<template>
        <div class="heatmap">
            <div class = "row">
                <div class="gradientButton">
                    <button @click="SGDStep">SGD Step</button>
                </div>
                <select v-model="selected" @change="changeInputFunction">
                    <option v-for="(option, index) in options" v-bind:key="index" v-bind:value="option.value">
                        {{ option.text }}
                    </option>
                </select>
            </div>
            <br/>
            <div class="layers">
                <div v-for="(numberNeurons, layerIndex) in networkShape" :key="'layer' + layerIndex" >
                    <div class="structure">
                        <Neurons v-if="layerIndex === 0" :layerIndex="layerIndex" :numberNeurons="1"
                                 :highlightedNeuron="highlightedNeuronPerm"
                                 @click="handleClick" @hover="handleHover" class="neuron-circles"></Neurons>
                        <div class="network">
                            <div class="layer">
                                <p>L{{ layerIndex + 1 }}</p>
                                <div class="neurons">
                                    <div v-for="(dataset, neuronIndex) in [...Array(networkShape[layerIndex]).keys()]" :key="'neuron' + neuronIndex" class="neuron">
                                        <div class="weights">
                                            <div v-for="(dataset, weightIndex) in network[layerIndex + 1][neuronIndex].getInputLinks()" :key="'weight' + weightIndex"
                                                 class="weight">
                                                <GradientHeatmap :layerIndex="layerIndex + 1" :neuronIndex="neuronIndex" :weightIndex="weightIndex"
                                                                 :isActiveProp="setIsActive([layerIndex + 1, neuronIndex, weightIndex])"
                                                                 :highlightedNeuron="highlightedNeuron" :highlightedNeuronPerm="highlightedNeuronPerm" class="weight-box" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Neurons v-if="layerIndex !== networkShape.length" :layerIndex="layerIndex+1"
                                 :numberNeurons="numberNeurons" :highlightedNeuron="highlightedNeuronPerm"
                                 @click="handleClick" @hover="handleHover" class="neuron-circles"></Neurons>
                    </div>
                </div>
            </div>
        </div>
</template>

<script>
import GradientHeatmap from "@/components/hidden-layers/gradient/GradientHeatmap.vue";
import {backProp, Errors, forwardProp, setAccErrDerToZero, updateWeights} from "@/neural-network/nn";
import Neurons from "@/components/hidden-layers/neurons/Neurons.vue";

export default {
    name: 'GradientHeatmapVis',
    components: { GradientHeatmap, Neurons},
    data() {
        return {
            highlightedNeuron: null,
            highlightedNeuronPerm: null,
            selected: 'sin',
            options: [
                { text: 'Sin()', value: 'sin' },
                { text: 'Cos()', value: 'cos' },
                { text: 'Exp()', value: 'exp' },
                { text: '()^2', value: 'squared' },
                { text: '()^3', value: 'cubic' },
                { text: '()', value: 'linear' }
            ]
        }
    },
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
        weights: {
            get: function() {
                return this.$store.getters.weights
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
        SGDStep() {
            setAccErrDerToZero(this.network)
            for (let i = 0; i < 1; i++) {
                for (let i = 0; i < this.data.length; i++) {
                    forwardProp(this.network, [this.data[i].x])
                    backProp(this.network, this.data[i].label, Errors.SQUARE)
                    updateWeights(this.network, 0.5)
                    this.$store.commit("setWeights")
                }
            }
        },
        computeDer() {
            setAccErrDerToZero(this.network)
            for (let i = 0; i < this.data.length; i++) {
                forwardProp(this.network, [this.data[i].x])
                backProp(this.network, this.data[i].label, Errors.SQUARE)
            }
        },
        swapComponent() {
            this.$emit("swapComponent", "slices");
        },
        setIsActive(index) {
            const weightsJSON = JSON.stringify(this.selectedWeights)
            const weightJSON = JSON.stringify(index)
            return weightsJSON.indexOf(weightJSON) !== -1
        },
        handleHover(neuron) {
            this.highlightedNeuron = neuron;
        },
        handleClick(neuron) {
            if (this.highlightedNeuronPerm !== neuron) {
                this.highlightedNeuronPerm = neuron;
            }
            else {
                this.highlightedNeuronPerm = null
            }
        },
        changeInputFunction() {
            this.$store.commit('changeInput', this.selected)
        }
    },
    watch: {
        data: {
            handler() {
                this.computeDer();
                this.highlightedNeuronPerm = null
            },
            deep: true,
        },
        weights: {
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
    height: 95vh;
}
.gradientButton {
    display: flex;
    justify-content: center;
    align-items: center;

}

.structure {
    display: flex;
    flex-direction: row;
    height: 100%
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
    height: 100%;
    width: 2vw;
}

.layer {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    padding-left: 0.3vw;
    padding-right: 0.3vw;
    margin-left: 0.3vw;
    margin-right: 0.3vw;
    border-radius: 5px;
}

.neurons {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    height: 83vh;
}

.neuron {
    display: flex;
    flex-direction: column;
    background: #c9c6bf;
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
    width: 2vh;
    height: 2vh;
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