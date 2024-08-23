<template>
    <div>
        <div class="row">
            <LoggingButton :appendedData="appendedData"/>
            <button @click="buildLoadedNetworkFile">Load network</button>
        </div>
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
import LoggingButton from "@/components/Logging.vue";

export default {
    name: 'SliderEpochs',
    props: {},
    components: {
        VueSlider,
        LoggingButton
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
        },
        buildLoadedNetworkFile() {
            this.appendedData = network
            this.currentEpochs = network.length
            this.epoch = this.currentEpochs
            this.$store.commit("setDrawLineChart")
            this.$store.commit("loadNetwork", this.appendedData[this.currentEpochs])
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