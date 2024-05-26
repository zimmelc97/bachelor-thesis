<template>
        <div class="heatmap">
            <button @click="swapComponent">Show Slices</button>
            <div class="layers">
                <div v-for="(dataset, layerIndex) in networkShape" :key="'layer' + layerIndex" class="layer">
                    <p>Layer: {{ layerIndex + 1 }}</p>
                    <div class="neurons">
                        <div v-for="(dataset, neuronIndex) in [...Array(networkShape[layerIndex]).keys()]" :key="'neuron' + neuronIndex" class="neuron">
                            <div class="weights">
                            <div v-for="(dataset, weightIndex) in network[layerIndex + 1][neuronIndex].getInputLinks()" :key="'weight' + weightIndex"
                            class="weight">
                                <GradientHeatmap :layerIndex="layerIndex + 1" :neuronIndex="neuronIndex" :weightIndex="weightIndex"
                                                 :isActiveProp="setIsActive([layerIndex + 1, neuronIndex, weightIndex])" class="weight-box" />
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
    padding-left: 0.5vw;
    padding-right: 0.5vw;
    margin-left: 0.7vw;
}

.neurons {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 90vh;
}

.neuron {
    display: flex;
    flex-direction: column;
    background: #B7B6B6;
    padding: 0.2vw;
    margin-top: 0.5vh;
    margin-bottom: 0.5vh;
    margin-left: 0.2vw;
}

.weights {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    max-height: 90vh;
}
.weight {
    position: relative;
    width: 20px;
    height: 20px;
}

.weight-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -80%);
    height: 80%;
    width: 80%;
}
</style>