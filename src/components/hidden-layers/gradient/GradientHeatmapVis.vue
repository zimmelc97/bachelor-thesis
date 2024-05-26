<template>
        <div class="heatmap">
            <button @click="swapComponent">Show Slices</button>
            <div class="layers">
                <div v-for="(numberNeurons, layerIndex) in networkShape" :key="'layer' + layerIndex" >
                  <div class="network">
                      <div class="layer">
                        <p>L{{ layerIndex + 1 }}</p>
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
                      <!--<Neurons v-if="layerIndex !== networkShape.length - 1" :numberNeurons="numberNeurons" class="neuron-circles"></Neurons>-->
                  </div>
                  </div>
            </div>
        </div>
</template>

<script>
import GradientHeatmap from "@/components/hidden-layers/gradient/GradientHeatmap.vue";
import {computeDer, Errors, forwardProp, setAccErrDerToZero} from "@/neural-network/nn";
//import Neurons from "@/components/hidden-layers/neurons/Neurons.vue";

export default {
    name: 'GradientHeatmapVis',
    components: { GradientHeatmap},
    mounted() {
        this.computeDer();
    },
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
        computeDer() {
            setAccErrDerToZero(this.network)
            for(let i=0; i<this.data.length; i++) {
                forwardProp(this.network, [this.data[i].x])
                computeDer(this.network, this.data[i].label, Errors.SQUARE)
            }
        },
        swapComponent() {
            this.$emit("swapComponent", "slices");
        },
        setIsActive(index) {
            const weightsJSON = JSON.stringify(this.selectedWeights)
            const weightJSON = JSON.stringify(index)
            return weightsJSON.indexOf(weightJSON) !== -1
        }
    },
    watch: {
        data: {
            handler() {
                this.computeDer();
            },
            deep: true,
        },
    }
}
</script>
<style>
.heatmap {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.network{
  display: flex;
  flex-direction: row;
}
.layers {
    display: flex;
    flex-direction: row;
}

.neuron-circles {
    height: 90vh;
    width: 2vw;
}

.layer {
    display: flex;
    flex-direction: column;
    background: #A5A5A5;
    padding-left: 0.3vw;
    padding-right: 0.3vw;
    margin-left: 0.3vw;
    margin-right: 0.3vw;
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
    padding: 0.1vw;
    margin: 0.5vh 0.15vw;
//margin: auto;
}

.weights {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    max-height: 88vh;
}
.weight {
    position: relative;
    width: 1.5vh;
    height: 1.5vh;
}

.weight-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    height: 80%;
    width: 80%;
}
</style>