<template>
    <div>
        <button @click="swapComponent">Show Slices</button>
        <div v-for="(dataset, layerIndex) in networkShape" :key="'layer' + layerIndex" :style="{display: 'inline-block'}">
            <div v-for="(dataset, neuronIndex) in [...Array(networkShape[layerIndex]).keys()]" :key="'neuron' + neuronIndex">
                <div v-for="(dataset, weightIndex) in network[layerIndex][neuronIndex].getInputLinks()" :key="'weight' + weightIndex">
                    <GradientHeatmap :layerIndex="layerIndex" :neuronIndex="neuronIndex" :weightIndex="weightIndex" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import GradientHeatmap from "@/components/hidden-layers/gradient/GradientHeatmap.vue";

export default {
    name: 'GradientHeatmapVis',
    components: {GradientHeatmap},
    props: {},
    computed: {
        network: {
            get: function() {
                return this.$store.getters.network
            }
        },
        networkShape: {
            get: function() {
                return this.$store.getters.networkShape
            }
        },
    },
    methods: {
        swapComponent() {
            this.$emit("swapComponent", "slices");
        }
    }
}
</script>