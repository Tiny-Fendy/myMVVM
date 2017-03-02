'use strict';
function Fen (all) {
    const self = this;

    //获取配置值
    this._el = all.el;
    this._dom = document.querySelector(this._el);

    // 处理data值
    this.data = this._data = all.data || {};

    // 将methods定义的方法代理到实例化对象上
    this._methods = all.methods || {};
    Object.assign(this, this._methods);

    this._markList = {
        'f-model': function () {
            console.log(1111);
        },
        'f-text': function () {

        },
        'f-repeat': function () {

        }
    };
    this._dependList = {};

    //遍历dom树，解析模板
     function getDom (domList) {
        Array.prototype.forEach.call(domList || [], dom => {
            getAttr(dom);
            getDom(dom.children);
        });
    }

    function getAttr (dom) {
        if (dom.hasAttribute('f-model')) {
            let attr = dom.getAttribute('f-model');

            dom.addEventListener('input', function () {
                (self._dependList[attr] || []).forEach(() => self._data[attr] = dom.value);
            });
            register(attr, () => dom.value = self._data[attr]);
            defineProperty(self._data, attr);
        } else if (dom.hasAttribute('f-text')) {
            let attr = dom.getAttribute('f-text');

            register(attr, () => dom.innerHTML = self._data[attr]);
        }
    }

    //将data用Object.defineProperty代理一遍
    function defineProperty(data, attr) {
        let val = '';

        Object.defineProperty(data, attr, {
            get: function () {
                return val;
            },

            set: function (newValue) {
                val = newValue;
                (self._dependList[attr] || []).forEach(fn => {
                     fn();
                });
            }
        });
    }

    // 注册data变化后对应的执行队列
    function register (attr, fn) {
        if (!(self._dependList[attr] instanceof Array)) self._dependList[attr] = [];
        if (typeof fn === 'function') self._dependList[attr].push(fn);
    }

    // 解析HTML标签

    this._init = function (self) {
        self._el ? getDom(this._dom.children) : console.error('error: 没有设置 el');
    };

    this._init(this);
}

let fen =new Fen({
    el: '.main',
    data: {
        title: ''
    },
    methods: {

    }
});

fen.data.title = 3333;