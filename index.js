'use strict';
let fen = new Fen({
    el: '.main',
    data: {
        title: 44444,
        fun: 'aaaaaaa',
        list: {
            a: 'hahaha',
            items: [1,2,3,4],
        },

        num: 111
    },
    methods: {
        show() {
            console.log(this);
        }
    }
});

window.fen = fen;