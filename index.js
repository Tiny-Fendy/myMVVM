'use strict';
let fen = new Mv({
    el: '.main',
    data: {
        title: 44444,
        fun: 'aaaaaaa',
        show: false,
        list: {
            a: 'hahaha',
            items: [1,2,3,4],
        },

        num: 111
    },
    methods: {
        show($event) {
            this.data.show = !this.data.show;
            console.log(this.data.show);
        }
    }
});

window.fen = fen;