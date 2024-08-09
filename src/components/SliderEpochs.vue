<template>
    <div>
        <label for="range-weights"></label>
        <VueSlider id="range-weights"
                   v-model="epoch"
                   :dot-options="{tooltip: 'none'}"
                   :process-style="{background: 'white'}"
                   :min="0" :max="this.currentEpochs" marks :adsorb="true" :lazy="true" drag-on-click
                   @change=buildLoadedNetwork(epoch)></VueSlider>
    </div>
</template>

<script>
import VueSlider from 'vue-slider-component'

export default {
    name: 'SliderEpochs',
    props: {},
    components: {
        VueSlider
    },
    data() {
        return {
            appendedData: [],
            epoch: 0,
            currentEpochs: 0,
        }
    },
    mounted() {
        this.appendedData = [{
            epoch: this.currentEpochs,
            networkShape: this.networkShape,
            MSE: this.MSE,
            weights: this.weights,
        }]
    },
    methods: {
        appendData() {
            this.currentEpochs++
            this.appendedData.push({
                networkShape: this.networkShape,
                weights: this.weights,
            })
            this.epoch = this.currentEpochs
        },
        buildLoadedNetwork(epoch) {
            this.$store.commit("setDrawLineChart")
            this.$store.commit("loadNetwork", this.appendedData[epoch])
        }
    },
    computed: {
        network: {
            get: function() {
                return this.$store.getters.network
            }
        },
        MSE: {
            get: function() {
                return this.$store.getters.MSE
            }
        },
        networkShape: {
            get: function() {
                return this.$store.getters.networkShape
            }
        },
        weights: {
            get: function() {
                let weights = []
                for (let layerIdx = 1; layerIdx < this.network.length; layerIdx++) {
                    let currentLayer = this.network[layerIdx];
                    for (let i = 0; i < currentLayer.length; i++) {
                        let node = currentLayer[i];
                        for (let j = 0; j < node.getInputLinks().length; j++) {
                            let link = node.getInputLinks()[j];
                            weights.push({layerIndex: layerIdx, neuronIndex: i, weightIndex: j, weight: link.getWeight()})
                        }
                    }
                }
                return weights
            }
        },
    },
    watch: {
        networkShape: {
            handler() {
                this.currentEpochs = 0
                this.epoch = 0
                this.appendedData = [{
                    epoch: this.currentEpochs,
                    networkShape: this.networkShape,
                    MSE: this.MSE,
                    weights: this.weights,
                }]
            },
            deep: true,
        },
    },
}
</script>