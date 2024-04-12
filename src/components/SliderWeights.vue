<template>
    <div>
        <div v-for="(weight, index) in weights" :key="index">
            <label :for="'weights-bar'">Weight {{ index }} : {{ weight.value }}</label>
            <b-form-input id="range-year"
                          v-model="weights[index].value"
                          type="range"
                          min="-5" max="5" step="0.1"
                          v-on:click="test(index)"></b-form-input>
        </div>
    </div>
</template>

<script>

//import VueSlider from "vue-slider-component";

export default {
    name: 'SliderWeights',
    props: {
    },
    components: {
    },
    data() {
        return {}
    },
    mounted() {
    },
    methods: {
        test(index) {
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