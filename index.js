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
            console.log(2222);
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

// 注册新的标签
Fen.prototype.addAtter =  attr => {

};

/**
 * 定义內建标签
 * name:模块名称
 * fn:返回模块对象
 * */

Fen.define = (name, fn) => {
    this.modelList = this.modelList || [];
    let modelList = this.modelList;

    // 获取依赖的列表
    let fnString = fn.toString(),
        defendString = fnString.substring(fnString.indexOf('(') + 1, fnString.indexOf(')')),
        defineList = defendString.split(',');

    // 是否查找到了依赖模块
    let hasModel = true;

    defineList.map(function (name) {
        if (modelList[name]) {

            return modelList[name]
        } else {
            hasModel = false;
            Fen.error('没有查找到依赖的模块');
        }
    });

    if (hasModel) modelList[name] = fn.apply(this, defineList);
};

Fen.error = msg => {
    console.error('Error:' + msg);
};

let fen = new Fen({
    el: '.main',
    data: {
        title: ''
    },
    methods: {

    }
});

fen.data.title = 3333;