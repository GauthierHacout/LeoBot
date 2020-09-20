const app = new Vue({
    el: '#app',
    data: {
        title: 'Leo bot',
        leo: './LeoLangue.png',
        boolean: true,
        inventory: 50,
        list: [{id: 1, desc: 'testing 1', qty: 4}, {id: 2, desc: 'testing 2', qty: 600}],
    },
});

const eventBus = new Vue();

Vue.component('product', {
    props: {
        test: {
            type: Number,
            required: true,
            default: 99,
        },
    },
    template: '<div @click="addition"> Im a component {{test}} and {{product}} <span @click="testing(94)"> click me !</span></div>',
    data() {
        return {
            product: 'This is a product',
        };
    },
    methods: {
        testing(numberSubmitted) {
            eventBus.$emit('submit', numberSubmitted);
        },
        addition() {
            this.$emit('add-one');
        },
    },
    mounted() {
        eventBus.$on('submit', (numberSubmitted) => {
            console.log(numberSubmitted);
        });
    },
});

const event = new Vue({
    el: '#event',
    data: {
        test: 10,
        number: 1,
        list: [{id: 1, color: 'blue'}, {id: 2, color: 'red'}],
        color: 'background-color: grey;',
    },
    methods: {
        addOne: function() {
            this.number += 1;
        },
        changeColor(color) {
            this.color= 'background-color: '+color+';';
        },
    },
    computed: {
        title() {
            return this.number + 'its a title ';
        },
    },
});
