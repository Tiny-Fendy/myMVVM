/**
 * Created by fengdi on 2017/3/3.
 */

// 获取屏幕信息
let width = window.innerWidth,
    height = window.innerHeight,
    $body = $('body');

// 主容器
function SlideShow (obj = {}) {
    this.obj = obj;

    // 图片序列号默认从1开始而不是0
    this.index = obj.index || 1;
    this.list = obj.list;
    this.width = 1048;
    this.height = 600;
    this.html = '<div class="slide-show">' +
        '<div class="fade"></div>' +
        '<div class="container"><div class="img-main">' +
        '<ul></ul>' +
        '<a class="arrow cp left"></a><a class="arrow cp right"></a>' +
        '<p><span class="index"></span>/<span class="sum"></span></p>' +
        '</div>' +
        '<div class="img-list">' +
        '<a type="button" class="btn cp top"></a>' +
        '<div class="list-container"><ul></ul></div>' +
        '<a type="button" class="btn cp bom"></a>' +
        '</div>' +
        '</div>' +
        '</div>';
    this.init();
}

SlideShow.prototype = {
    init () {
        this.render();
        this.resize();
    },

    // 导入HTML
    render () {
        let list = this.list;

        if (!$body.find('.slide-show').length) $body.append(this.html);

        let $slide = $body.find('.slide-show');

        this.$container = $slide.find('.container');
        this.$imgMain = $slide.find('.img-main ul');
        this.$imgList = $slide.find('.img-list ul');
        this.$left = $slide.find('.img-main .left');
        this.$right = $slide.find('.img-main .right');
        this.$top = $slide.find('.img-list .top');
        this.$bom = $slide.find('.img-list .bom');
        this.$index = $slide.find('p span.index');
        this.$sum = $slide.find('p span.sum');
    },

    resize () {
        if (width < 1048) {
            $('.slide-show').css('width', width + 'px');
        }
        if (height < 600) {
            $('.slide-show').css('height', height + 'px');
        } else {
            this.$container.css('margin-top', (height - this.height)/2);
        }
    },

    // 绑定事件
    eventBind () {
        let self = this;

        this.$left.off('click').on('click', e => {
            self.imgMain.scrollLeft();
            self.imgList.switchUp();
        });
        this.$right.off('click').on('click', e => {
            self.imgMain.scrollRight();
            self.imgList.switchDown();
        });
        this.$top.off('click').on('click', e => {
            self.$imgList.scrollTop();
        });
        this.$bom.off('click').on('click', e => {
            self.$imgList.scrollBom();
        });
    },

    show (list) {
        let self = this;

        if (!(list && list instanceof Array && list.length)) {
            console.error('传入的图片列表有错误！');

            return false;
        }

        this.$sum.text(list.length);
        this.imgMain = new ImgShow({
            list: list,
            index: 0,
            $dom: self.$imgMain
        });
        this.imgList = new Thumbnail({
            list: list,
            index: 0,
            $dom: self.$imgList,
            callback: i => {
                ++i;
                self.$index.text(i);
                self.imgMain.switchImg(i);
                self.imgList.switchImg(i);
            }
        });
        this.eventBind();
    }
};

// 大图展示
function ImgShow (obj) {
    this.width = 768;
    this.height = 540;

    Object.assign(this, obj);

    if (!this.$dom.length) {
        console.error('没有获取到img-main节点');
    }
    this.init(this.$dom);
}

ImgShow.prototype = {

    // 初始化列表
    init ($dom) {
        $dom.html();
        this.list.forEach((url, i) => {
            $dom.append(new ImgLi(url, i));
        });
    },

    // 根据数据切换图片
    switchImg (index) {
        this.index = index;
        this.active(this.index);
    },

    scrollLeft () {
        if (this.index > 1) this.active(--this.index);
    },

    scrollRight () {
        if (this.index < this.list.length) this.active(++this.index);
    },

    active (index) {
        this.$dom.css('left', (index - 1)*this.width);
    }
};

// 缩略图列表
function Thumbnail (obj) {
    this.start = 0;
    this.index = 0;
    this.height = 600;
    this.margin = 10;

    Object.assign(this, obj);

    if (!this.$dom.length) {
        console.error('没有获取到img-list节点');
    }

    this.init(this.$dom, this.callback);
}

Thumbnail.prototype = {
    init ($dom, fn) {
        $dom.html();
        this.list.forEach((url, i) => {
             $dom.append(new ImgLi(url, i, fn));
        });
        this.$liList = $dom.find('li');
    },

    // 显示上一张图
    switchUp () {
        if (this.index > 1) this.switchImg(--this.index);
    },

    // 显示下一张图
    switchDown () {
        if (this.index < this.list.length) this.switchImg(++this.index);
    },

    // 托盘上移一位
    scrollTop () {
        if (this.start > 1) this.active(--this.start);
    },

    // 托盘下移一位
    scrollBom () {
        if (this.start + 2 < this.list.length) this.active(++this.start);
    },

    // 切换图片
    switchImg (index) {
        if (index < this.start || index > this.start + 2) {
            this.$liList.eq(this.index).removeClass('active');
            this.$liList.eq(index).addClass('active');
            this.index = index;
            this.start = index;
            this.active(index);
        }
    },

    // 托盘滚动
    active (start) {
        this.$dom.css('top', (start - 1)*(this.margin + this.height));
    }
};

// 图片
function ImgLi (url, index, fn) {
    this.index = index;
    this.$li = $('<li><img src="'+ url +'" alt="图片预览"></li>');
    if (fn) this.$li.on('click', () => {
        fn(index);
    });

    return this.$li;
}