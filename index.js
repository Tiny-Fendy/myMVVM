function Fen (all) {
    var self = this;

    //获取配置值
    this._el = all.el;
    this._data = all.data || {};
    this._methods = all.methods || {};

    //遍历DOM节点, 页面内可能会有多个模板
    this.getDomList = function (el) {
        if (el) {
            Array.prototype.forEach.call(document.querySelectorAll(el), function (dom) {
                self.getDom(dom.children);
            });
        } else {
            console.error('error: 请设置--el');
        }
    };

    //遍历dom树，解析模板
    this.getDom = function (domList) {
        Array.prototype.forEach.call(domList || [], function (dom) {
            self.getAttr(dom.attributes);

            defineProperty(dom, 'value', function (newValue) {
                console.log(newValue);
            });
            self.getDom(dom.children);
        });
    };

    this.getAttr = function (attributes) {
        if (attributes && attributes.length) {
            for (var i in attributes) {
                var attr = attributes[i];

                if (attr.name === 'f-model') {
                    defineProperty(self._data, attr.name, function (newValue) {

                    });
                }
            }
        }
    };

    //获取模板
    this.getDomList(this._el);
}

//将data用Object.defineProperty代理一遍
function defineProperty (data, i, fn) {
    Object.defineProperty(data, i, {
        set: fn
    });
}

new Fen({
    el: '.main',
    data: {
        name: ''
    },
    methods: {

    }
});