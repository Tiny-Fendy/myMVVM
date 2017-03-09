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

        self._el ? self._getDom(self._dom.children, self._data) : console.error('error: 没有设置 el');
    };

    //遍历dom树，解析模板
    F.prototype._getDom = (domList, data) => {
        Array.prototype.forEach.call(domList || [], dom => {
            let children = dom.children;

            if (children.length) {

                // Element节点解析
                self.getAttr(dom, data);
                self._getDom(dom.children, data);
            } else if (dom.childNodes.length) {

                // Text节点{{}}模板解析
                self.compileText(dom.childNodes[0], data);
            }
        });
    };

    // 获取dom中的指令并解析
    F.prototype.getAttr = (dom, data) => {
        for (let i in self._directiveList) {
            if (self._directiveList.hasOwnProperty(i) && dom.hasAttribute(i)) {
                self._directiveList[i](dom, dom.getAttribute(i), data);
            }
        }
    };

    F.prototype.compileText = (text, data) => {
        let tem = text.textContent.split(/{{(.*?)}}/);


        tem = tem.map((item, i) => i % 2 ? data[item] || '' : item).join('');
        console.log(tem);
    };

    //将data用Object.defineProperty代理一遍
    F.prototype.defineProperty = (data, attr) => {
        let val = data[attr];

        Object.defineProperty(data, attr, {
            get: function () {
                return val;
            },

            set: function (newValue) {
                val = newValue;
                self._dependList[attr].forEach(fn => fn());
            }
        });
    };

    // 注册data变化后对应的执行队列
    F.prototype.registerDataChange =  (attr, fn) => {
        if (!(self._dependList[attr] instanceof Array)) self._dependList[attr] = [];
        if (typeof fn === 'function') {
            self._dependList[attr].push(fn);
            fn()
        }
    };

    /**
     * 自定义标签
     * attr: 标签名
     * fn: 检测到标签时执行的逻辑
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
            self.defineProperty(data, attr);
        },

        'f-text': (dom, attr, data) => {
            self.registerDataChange(attr, () => dom.innerHTML = data[attr]);
        }
    };

    // Todo:支持js表达式
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
            items.forEach(i => {
                let node = dom.cloneNode(true);

                // 判断是不是最后一个子节点, 不是--是
                if (dom.nextElementSibling) {
                    dom.parentNode.insertBefore(node, dom.nextElementSibling);
                } else {
                    dom.parentNode.appendChild(node);
                }
            });

            // 去掉自身，防止多出一个
            dom.remove();
        } else {
            F.error('f-for：遍历的数据格式不正确！');
        }

    });

    /**
     * 定义內建标签
     * name:模块名称
     * fn:返回模块对象
     * */

    F.define = (name, fn) => {
        F.define.modelList = F.define.modelList || {};
        let modelList = F.define.modelList;

        // 获取依赖的列表
        let fnString = fn.toString(),
            dependString = fnString.substring(fnString.indexOf('(') + 1, fnString.indexOf(')')),
            dependList = dependString ? dependString.split(',') : [];

        // 是否查找到了依赖模块
        let hasModel = true;

        // 查找依赖的模块，返回给dependList
        if (dependList.length) dependList = dependList.map(name => {
            if (modelList[name]) {

                return modelList[name];
            } else {
                hasModel = false;
                F.error('没有查找到依赖的模块');
            }
        });

        if (hasModel) modelList[name] = fn.apply(this, dependList);
    };

    F.error = msg => {
        console.error('Error:' + msg);
    };

    F.define('sf',  () => F.prototype);

    F.define('init', sf => {

    });

    window.Fen = F;
})();