'use strict';
function Fen (all) {
    var self = this;

    //获取配置值
    this._el = all.el;
    this._dom = document.querySelector(this._el);
    this._data = all.data || {};
    this._methods = all.methods || {};
    this._markList = [];
    this._dependList = {};

    //遍历dom树，解析模板
    this.getDom = function (domList) {
        Array.prototype.forEach.call(domList || [], function (dom) {
            self.getAttr(dom);
            self.getDom(dom.children);
        });
    };

    this.getAttr = function (dom) {
        if (dom.hasAttribute('f-model')) {
            let attr = dom.getAttribute('f-model');

            dom.addEventListener('input', function (e) {
                (self._dependList[attr] || []).forEach(function (fn) {
                    self._data[attr] = dom.value;
                });
            });

            defineProperty(self._data, attr);
        } else if (dom.hasAttribute('f-text')) {
            let attr = dom.getAttribute('f-text');

            if (!(self._dependList[attr] instanceof Array)) self._dependList[attr] = [];
            self._dependList[attr].push(function () {
                dom.innerHTML = self._data[attr];
            });
        }
    };

    //将data用Object.defineProperty代理一遍
    function defineProperty(data, attr) {
        let val = '';

        Object.defineProperty(data, attr, {
            get: function () {
                return val;
            },

            set: function (newValue) {
                val = newValue;
                (self._dependList[attr] || []).forEach(function (fn) {
                     fn();
                });
            }
        });
    }

    this._init = function (self) {
        if (self._el) {
            self.getDom(this._dom.children);
        } else {
            console.error('error: 没有设置 el');
        }
    };

    this._init(this);
}

new Fen({
    el: '.main',
    data: {
        title: ''
    },
    methods: {

    }
});