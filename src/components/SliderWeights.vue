<template>
    <div>
        <label for="range-weights">Weight {{ index }} : {{ parseFloat(weights[this.index].value).toFixed(2) }}</label>
        <b-form-input id="range-weights"
                      v-model="weights[index].value"
                      type="range"
                      min="-5" max="5" step="0.01"
                      v-on:click="changeIndex(index)"></b-form-input>
    </div>
</template>

<script>

//import VueSlider from "vue-slider-component";

export default {
    name: 'SliderWeights',
    props: {
        index: {
            type: Number,
            required: true
        }
    },
    components: {
    },
    data() {
        return {}
    },
    mounted() {
    },
    methods: {
        changeIndex(index) {
            this.$store.commit('changeIndex', index);
        }
    },
    computed: {
        weights: {
            get() {
                return this.$store.getters.weights;
            },
            set(weights) {
                this.$store.commit('changeWeights', weights);
            }
        },
    },
    watch: {
    },
}
</script>


<style scoped>

</style>