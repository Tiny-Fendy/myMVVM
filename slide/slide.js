/**
 * Created by fengdi on 2017/3/3.
 */

// 获取屏幕信息
let width = window.innerWidth,
    height = window.innerHeight,
    $body = $('body');

// 主容器
function SlideShow (obj) {
    if (!obj.list || (obj.list instanceof Array) || obj.list.length) {
        console.error('传入的图片列表有错误！');

        return false;
    }

    this.obj = obj;

    // 图片序列号默认从1开始而不是0
    this.index = obj.index || 1;
    this.list = obj.list;
    this.html = '<div class="slide-show">' +
        '<div class="fade"></div>' +
        '<div class="container"><div class="img-main">' +
        '<ul></ul>' +
        '<a class="arrow cp left"></a><a class="arrow cp right"></a>' +
        '<p><span>15</span>/<span>' + this.list.length + '</span></p>' +
        '</div>' +
        '</div>' +
        '<div class="img-list">' +
        '<a type="button" class="btn cp top"></a>' +
        '<div class="list-container"><ul></ul></div>' +
        '<a type="button" class="btn cp bom"></a>' +
        '</div>' +
        '</div>'

}

SlideShow.prototype = {
    init () {
        this.append();
        this.resize();
    },

    // 导入HTML
    append () {
        let self = this,
            $slide = $body.find('.slide-show'),
            list = this.list;

        if (!$slide.length) {
            $body.append(this.html)
        } else {
            $body.find('.slide-show .img-main ul').html('');
            $body.find('.slide-show .img-list ul').html('');
        }

        this.$imgMain = $body.find('.slide-show .img-main ul');
        this.$imgList = $body.find('.slide-show .img-list ul');
        this.$left = $body.find('.slide-show .img-main .left');
        this.$right = $body.find('.slide-show .img-main .right');
        this.$top = $body.find('.slide-show .img-list .top');
        this.$bom = $body.find('.slide-show .img-list .bom');


        // 不知道这里的this指向哪里
        this.imgMain = new ImgShow({
            list: self.list,
            index: 0,
            $dom: self.$imgMain
        });

        this.imgList = new Thumbnail({
            list: self.list,
            index: 0,
            $dom: self.$imgList
        });

        this.eventBind();
    },

    resize () {
        if (width < 1048) {
            $('.slide-show').css('width', width + 'px');
        }
        if (height < 600) {
            $('.slide-show').css('height', height + 'px');
        }
    },

    // 绑定事件
    eventBind () {
        let self = this;

        this.$left.off('click').on('click', e => {
            if (self.index >= 1) {
                self.index--;
                self.imgMain.switchImg(self.index);
                self.imgList.switchImg(self.index);
            }
        });

        this.$right.off('click').on('click', e => {
            if (self.index < self.list.length) {
                self.index++;
                self.imgMain.switchImg(self.index);
                self.imgList.switchImg(self.index);
            }
        });

        this.$top.off('click').on('click', e => {

        });


    },

    show (list) {

    }
};

// 大图展示
function ImgShow (obj) {
    Object.assign(this, obj);
    this.init(this.$dom);
}

ImgShow.prototype = {

    // 初始化列表
    init ($dom) {
        if (this.list instanceof Array) {
            this.list.forEach(url => {
                $dom.append(new ImgLi(url, function () {

                }));
            });
        }
    },

    // 根据数据切换图片
    switchImg (index) {
        this.index = index;
    }
};

// 缩略图列表
function Thumbnail (obj) {
    Object.assign(this, obj);
    this.init(this.$dom);
}

Thumbnail.prototype = {
    init ($dom) {

    },

    switchImg (index) {

    },

    scroll () {

    }
};

// 图片
function ImgLi (url, fn) {
    this.$li = $('<li><img src="'+ url +'" alt="图片预览"></li>');
    this.$li.on('click', fn);

    return this.$li;
}