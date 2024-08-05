<template>
    <div>
        <label for="range-weights"></label>
        <b-form-input id="range-weights"
                      v-model="epochs"
                      type="range"
                      min="0" :max="steps" step="1"
                      @click=buildLoadedNetwork></b-form-input>
    </div>
</template>

<script>
import network from './../../logs/2024-08-05T06_55_40.398Z.json'

export default {
    name: 'SliderEpochs',
    props: {},
    components: {
    },
    data() {
        return {
            loadedNetwork : network,
            epochs: 0,
            steps : 5
        }
    },
    mounted() {
    },
    methods: {
        buildLoadedNetwork() {
            this.$store.commit("loadNetwork", this.loadedNetwork[0])
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
        weights: {
            handler() {
                //this.appendData(this.MSE, this.weights)
                //this.saveDataToFile()
            },
            deep: true,
        },
    },
}
</script>