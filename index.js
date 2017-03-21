'use strict';
let fen = new Mv({
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
        show($event) {
            // $event.target.innerHTML = this.data.list.a;
            console.log(arguments);
        }
    }
});

window.fen = fen;