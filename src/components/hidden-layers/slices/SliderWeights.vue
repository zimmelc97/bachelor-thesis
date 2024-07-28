<template>
    <div>
        <label for="range-weights">Weight : {{ parseFloat(weight).toFixed(2) }}</label>
        <b-form-input id="range-weights"
                      v-model="weight"
                      type="range"
                      min="-20" max="20" step="0.001"
                      v-on:click="changeIndex([layerIndex, neuronIndex, weightIndex])"></b-form-input>
    </div>
</template>

<script>

import { getInputWeight } from "@/neural-network/nn";

//import VueSlider from "vue-slider-component";

export default {
    name: 'SliderWeights',
    props: {
        layerIndex: {
            type: Number,
            required: true
        },
        neuronIndex: {
            type: Number,
            required: true
        },
        weightIndex: {
            type: Number,
            required: true
        },
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
        },
        commitWeight() {
            this.$store.commit('changeWeightInNetwork', {layerIndex: this.layerIndex,
                neuronIndex: this.neuronIndex,
                weightIndex: this.weightIndex,
                weight: this.selectedWeights.value})
        }
    },
    computed: {
        weight: {
            get() {
                return getInputWeight(this.network[this.layerIndex][this.neuronIndex], this.weightIndex)
            },
            set(weight) {
                this.$store.commit('changeWeightInNetwork', {layerIndex: this.layerIndex,
                    neuronIndex: this.neuronIndex,
                    weightIndex: this.weightIndex,
                    weight: weight});
            }
        },
        network: {
            get() {
                return this.$store.getters.network;
            },

        },
    },
    watch: {
    },
}
</script>


<style>
</style>