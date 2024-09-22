<template>
    <div class="mt-5">
        <label for="range-weights"></label>
        <VueSlider id="range-epochs"
                   v-model="epoch"
                   :dot-options="{tooltip: 'none'}"
                   :process-style="{background: 'white'}"
                   :min="0" :max="this.currentEpochs" marks :adsorb="true" :lazy="true" drag-on-click
                   @change=buildLoadedNetwork(epoch)></VueSlider>
    </div>
</template>

<script>
import network from '../log/network.json'
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
            MSE: this.MSE,
            networkShape: this.networkShape,
            weights: this.weights,
        }]
        this.$emit("setAppendedData", this.appendedData)
    },
    methods: {
        appendData() {
            this.currentEpochs++
            this.appendedData.push({
                MSE: this.MSE,
                networkShape: this.networkShape,
                weights: this.weights,
            })
            this.epoch = this.currentEpochs
            this.$emit("setAppendedData", this.appendedData)
        },
        buildLoadedNetwork(epoch) {
            this.$store.commit("setDrawLineChart")
            this.$store.commit("loadNetwork", this.appendedData[epoch])
        },
        async buildLoadedNetworkFile() {
            const length = network.length - 1
            await this.$store.commit('changeNetworkShape', network[0].networkShape.slice(1, network[0].networkShape.length-1));
            this.$emit("setAppendedData", network)
            this.appendedData = network
            this.buildLoadedNetwork(length, network)
            this.currentEpochs = length
            this.epoch = length
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
                    MSE: this.MSE,
                    networkShape: this.networkShape,
                    weights: this.weights,
                }]
                this.$emit("setAppendedData", this.appendedData)
            },
            deep: true,
        },
    },
}
</script>