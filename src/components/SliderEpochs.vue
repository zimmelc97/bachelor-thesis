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
import network from './../log/2024-08-23T13_56_15.593Z.json'
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
            networkShape: this.networkShape,
            weights: this.weights,
        }]
        this.$emit("setAppendedData", this.appendedData)
    },
    methods: {
        appendData() {
            this.currentEpochs++
            this.appendedData.push({
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
        buildLoadedNetworkFile() {
            const length = network.length
            this.appendedData = network
            this.currentEpochs = length
            this.epoch = length
            this.$emit("setAppendedData", this.appendedData)
            this.buildLoadedNetwork(length - 1)
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