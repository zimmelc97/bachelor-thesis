<template>
    <div>
        <button @click="swapComponent">Show Heatmap</button>
        <div v-for="(dataset, index) in selectedWeights" :key="index" :style="{display: 'inline-block'}">
                <LineChart :layerIndex="dataset[0]" :neuronIndex="dataset[1]" :weightIndex="dataset[2]" />
            </div>
        </div>
</template>

<script>
import LineChart from "@/components/hidden-layers/slices/LineChart.vue";
import {computeDer, Errors, forwardProp, setAccErrDerToZero} from "@/neural-network/nn";

export default {
    name: 'WeightSlicesSelection',
    components: {LineChart},
    props: {},
    computed: {
        selectedWeights: {
            get: function() {
                return this.$store.getters.selectedWeights
            }
        },
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
        weights: {
            get: function() {
                return this.$store.getters.weights
            }
        },
    },
    methods: {
        computeDer() {
            setAccErrDerToZero(this.network)
            for(let i=0; i<this.data.length; i++) {
                forwardProp(this.network, [this.data[i].x])
                computeDer(this.network, this.data[i].label, Errors.SQUARE)
            }
        },
        swapComponent() {
            this.$emit("swapComponent", "gradient");
        }
    },
    watch: {
        weights: {
            handler() {
                this.computeDer()
            },
            deep: true,
        },
    }
}
</script>