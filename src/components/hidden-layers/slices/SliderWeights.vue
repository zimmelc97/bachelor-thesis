<template>
    <div>
        <label for="range-weights">Weight : {{ parseFloat(weight).toFixed(2) }}</label>
        <VueSlider id="range-weights"
                   v-model="weight"
                   :dot-options="{tooltip: 'none'}"
                   :process-style="{background: 'white'}"
                   :min="-20" :max="20" :interval="0.0001"
                   @click="changeIndex([layerIndex, neuronIndex, weightIndex])"
                   @drag-end="$emit('append-data')"></VueSlider>
    </div>
</template>

<script>

import { getInputWeight } from "@/neural-network/nn";

import VueSlider from "vue-slider-component";

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
        VueSlider
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