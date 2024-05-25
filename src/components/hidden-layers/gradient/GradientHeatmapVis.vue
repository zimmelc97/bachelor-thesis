<template>
        <div class="heatmap">
            <button @click="swapComponent">Show Slices</button>
            <div class="layers">
                <div v-for="(dataset, layerIndex) in networkShape" :key="'layer' + layerIndex" class="layer">
                    <div class="neurons">
                        <div v-for="(dataset, neuronIndex) in [...Array(networkShape[layerIndex]).keys()]" :key="'neuron' + neuronIndex" class="neuron">
                            <div class="weights">
                            <div v-for="(dataset, weightIndex) in network[layerIndex + 1][neuronIndex].getInputLinks()" :key="'weight' + weightIndex"
                            class="weight">
                                <GradientHeatmap :layerIndex="layerIndex + 1" :neuronIndex="neuronIndex" :weightIndex="weightIndex"
                                                 :isActiveProp="setIsActive([layerIndex, neuronIndex, weightIndex])" class="weight-box" />
                            </div>
                        </div>
                        </div>
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
                return this.$store.getters.networkShape.slice(1)
            }
        },
        selectedWeights: {
            get: function() {
                return this.$store.getters.selectedWeights
            }
        },
    },
    methods: {
        swapComponent() {
            this.$emit("swapComponent", "slices");
        },
        setIsActive(index) {
            const weightsJSON = JSON.stringify(this.selectedWeights)
            const weightJSON = JSON.stringify(index)
            return weightsJSON.indexOf(weightJSON) !== -1
        }
    }
}
</script>
<style>
.heatmap {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.layers {
    display: flex;
    flex-direction: row;
}

.layer {
    display: flex;
    flex-direction: column;
    background: #A5A5A5;
}

.neurons {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 80vh;
}

.neuron {
    display: flex;
    flex-direction: column;
    background: #B7B6B6;
}

.weights {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    max-height: 80vh;
}
.weight {
  width: 20px;
  height: 20px;
}

.weight-box {
  display: flex;
  align-items: center;
  margin: auto;
  height: 80%;
  width: 80%;
}
</style>