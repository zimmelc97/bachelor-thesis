<template>
    <div class="sliceSelection">
        <div class="sliceButton">
            <button @click="swapComponent" >Show Heatmap</button>
        </div>
        <div class="slicesContainer">
            <div class="slices">
                <div v-for="(dataset, index) in selectedWeights" :key="index" >
                    <LineChart :layerIndex="dataset[0]" :neuronIndex="dataset[1]" :weightIndex="dataset[2]" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import LineChart from "@/components/hidden-layers/slices/LineChart.vue";
import {backProp, Errors, forwardProp, setAccErrDerToZero} from "@/neural-network/nn";

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
                backProp(this.network, this.data[i].label, Errors.SQUARE)
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
<style>
.sliceSelection {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.sliceButton {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10vh;
}
.slicesContainer {
    display: flex;
    justify-content: center;
    height: 90vh;
}
.slices{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center
}
</style>