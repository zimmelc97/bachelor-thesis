<template>
    <div>
        <button @click="swapComponent">Show Heatmap</button>
        <div v-for="(dataset, layerIndex) in networkShape" :key="'layer' + layerIndex" :style="{display: 'inline-block'}">
            <div v-for="(dataset, neuronIndex) in [...Array(networkShape[layerIndex]).keys()]" :key="'neuron' + neuronIndex">
                <div v-for="(dataset, weightIndex) in network[layerIndex][neuronIndex].getInputLinks()" :key="'weight' + weightIndex">
                    <LineChart :layerIndex="layerIndex" :neuronIndex="neuronIndex" :weightIndex="weightIndex" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import LineChart from "@/components/hidden-layers/slices/LineChart.vue";

export default {
    name: 'WeightSlicesVis',
    components: {LineChart},
    props: {},
    computed: {
        data: {
            get: function() {
                return this.$store.getters.inputData
            }
        },
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
            this.$emit("swapComponent", "gradient");
        }
    },
}
</script>
