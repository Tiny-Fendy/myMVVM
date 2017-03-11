'use strict';

(function () {
    function F (all) {
        this._init(all);
    }

    let self = F.fn = F.prototype;

    F.prototype._init = all => {

        //获取配置值
        self._el = all.el;
        self._dom = document.querySelector(self._el);

        // 处理data值
        self.data = self._data = all.data || {};

        // 将methods定义的方法代理到实例化对象上
        self._methods = all.methods || {};
        Object.assign(self, self._methods);

        // 数据变化时，每个指令执行的动作列表
        self._dependList = {};

        self._el ? self._getDom(self._dom, self._data) : console.error('error: 没有设置 el');
    };

    //遍历dom树，解析模板
    F.prototype._getDom = (template, data) => {

        // 浅度复制数组，防止DOM实时变动带来的影响
        let domList = Array.prototype.slice.call(template.childNodes, 0);

        domList.forEach(dom => {
            if (dom.nodeType === 1) {
                self._getAttr(dom, data);
                self._getDom(dom, data);
            } else if (dom.nodeType === 3 && dom.nodeValue) {

                // Text节点{{}}模板解析
                self._compileText(dom, data);
            }
        });
    };

    // 获取dom中的指令并解析
    F.prototype._getAttr = (dom, data) => {
        for (let i in self._directiveList) {
            if (self._directiveList.hasOwnProperty(i) && dom.hasAttribute(i)) {
                self._directiveList[i](dom, dom.getAttribute(i), data);
            }
        }
    };

    // 编译文本节点中的{{}}模板
    F.prototype._compileText = (dom, data) => {
        let tem = dom.textContent.split(/{{(.*?)}}/);

        if (tem.length > 1) tem = tem.map((item, i) => {
            if (i % 2) {

                // 如果存在{{}}那么中间的值一定存在于数组的奇数位元素中
                self.registerDataChange(item, () => {
                    tem[i] = data[item];
                    dom.nodeValue = tem.join('');
                });

                return data[item];
            } else {

                return  item;
            }
        });
    };

    //将data用Object.defineProperty代理一遍
    F.prototype._defineProperty = (data, attr) => {
        let val = data[attr];

        Object.defineProperty(data, attr, {
            get: function () {
                return val;
            },

            set: function (newValue) {
                if (val === newValue) return false;
                val = newValue;
                self._dependList[attr].forEach(fn => fn(val));
            }
        });
    };

    /**
     * 注册data变化后对应的执行队列
     * attr: 注册的标签
     * fn: data变化后执行的回调
     * */

    F.prototype.registerDataChange =  (attr, fn) => {
        if (!(self._dependList[attr] instanceof Array)) self._dependList[attr] = [];
        if (typeof fn === 'function') {
            self._dependList[attr].push(fn);
            fn(self._data[attr] || '');
        }
    };

    /**
     * 自定义标签
     * attr: 标签名
     * fn: 检测到标签时执行的回调函数
     * */

    F.prototype.directive =  (attr, fn) => {
        if (!self._directiveList.hasOwnProperty(attr)) self._directiveList[attr] = fn;
    };

    // 指令列表
    F.prototype._directiveList = {
        'f-model': (dom, attr, data) => {
            dom.addEventListener('input', () => (self._dependList[attr] || []).forEach(() => data[attr] = dom.value));
            self.registerDataChange(attr, () => dom.value = data[attr]);
            dom.value = data[attr];
            self._defineProperty(data, attr);
        },

        'f-text': (dom, attr, data) => {
            self.registerDataChange(attr, () => dom.innerHTML = data[attr]);
        }
    };

    /**
     * 开始注册指令
     * dom：当前检测到具有该指令的节点
     * attr：指令的值
     * data：作用域中的data
     * */

    self.directive('f-show', (dom, attr, data) => {
        self.registerDataChange('attr', () => data[attr] ? dom.style.display = '' : dom.style.display = 'none');
    });

    self.directive('f-if', (dom, attr, data) => {
        self.registerDataChange('attr', data[attr] ? dom.style.display = true : dom.remove());
    });

    // Todo: 监控数组的变动
    self.directive('f-for', (dom, attr, data) => {
        let item = attr.split('in')[0].replace(/\s/g, ''),
            items = data[attr.split('in')[1].replace(/\s/g, '')];

        dom.removeAttribute('f-for');
        if (items instanceof Array) {
            items.forEach((val, i) => {
                let node = dom.cloneNode(true);

                // dom处理完毕开始继续进行编辑
                self._getDom(node, {
                    [item]: val
                });

                // 判断是不是最后一个子节点, 不是--是
                dom.parentNode.insertBefore(node, dom);
            });

            // 去掉自身，防止多出一个
            dom.remove();
        } else {
            F.error('f-for：遍历的数据格式不正确！');
        }

    });

    /**
     * define方法，用于实现内部的模块化以及依赖注入，先放在这里，可能会用得上
     * 定义內建标签，目前只处理了箭头函数的传入，没有处理function关键字的传入
     * name:模块名称
     * fn:返回模块对象
     * */

    F.define = (name, fn) => {
        F.define.modelList = F.define.modelList || {};
        let modelList = F.define.modelList;

        // 获取依赖的列表
        let fnString = fn.toString().split('=>')[0];

        if (fnString !== '()') {
            modelList[name] = fn();
        } else if (fnString.includes('(')) {
            let dependString = fnString.slice(1, -1),
                dependList = dependString.split(',');

            // 是否查找到了依赖模块
            let hasModel = true;

            // 查找依赖的模块，返回给dependList
            if (dependList.length) dependList = dependList.map(model => {
                if (modelList[model]) {

                    return modelList[model];
                } else {
                    hasModel = false;
                    F.error('没有查找到依赖的模块');
                }
            });

            if (hasModel) modelList[name] = fn.apply(this, dependList);
        } else {
            modelList[name] = fn(modelList[fnString]);
        }
    };

    F.error = msg => {
        console.error('Error:' + msg);
    };

    F.define('self',  () => F.prototype);

    F.define('init', self => {
        console.log(11111);
    });

    window.Fen = F;
})();