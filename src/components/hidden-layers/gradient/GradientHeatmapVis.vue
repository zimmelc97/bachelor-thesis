<template>
    <div class="container w-100">
        <div class="heatmap">
            <div class = "row">
                <div class="toggleBox mt-1 mx-2">
                    <select class="generalButton" v-model="selected" @change="changeInputFunction">
                        <option v-for="(option, index) in options" v-bind:key="index" v-bind:value="option.value">
                            {{ option.text }}
                        </option>
                    </select>
                </div>
                <div class="toggleBox mt-1 mx-2">
                    <button
                        class="visButton"
                        @click="isWeight = true; $emit('setIsWeight', isWeight)"
                        :class="[!isWeight ? 'inactive' : '']"
                    >weights</button>
                    <button
                        class="visButton"
                        @click="isWeight = false; $emit('setIsWeight', isWeight)"
                        :class="[isWeight ? 'inactive' : '']"
                    >gradients</button>
                </div>
                <div class="toggleBox mt-1 mx-2">
                    <button class="generalButton" @click="SGDStep">SGD Step</button>
                </div>
                <div class="toggleBox mt-1 mx-2">
                    <LoggingButton :appendedData="appendedData"/>
                </div>
                <div class="toggleBox mt-1 mx-2">
                    <button class="generalButton" @click="buildLoadedNetworkFile">Load Network</button>
                </div>
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
                                                                 :highlightedNeuron="highlightedNeuron" :highlightedNeuronPerm="highlightedNeuronPerm"
                                                                 :isWeight="isWeight" class="weight-box" @show-tooltip="showTooltip"
                                                                 @hide-tooltip="hideTooltip"/>
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
        <div class="mt-2">
            <SliderEpochs ref="sliderEpochs" @setAppendedData="setAppendedData"></SliderEpochs>
        </div>
        <div
            class="tooltipStyle"
            :class="[tooltipVisible ? 'visible' : '']"
            :style="{ left: `${tooltipX}px`, top: `${tooltipY}px` }"
        >
          {{ tooltipText }}
        </div>
    </div>
</template>

<script>
import GradientHeatmap from "@/components/hidden-layers/gradient/GradientHeatmap.vue";
import {backProp, Errors, forwardProp, setAccErrDerToZero, updateWeights} from "@/neural-network/nn";
import Neurons from "@/components/hidden-layers/neurons/Neurons.vue";
import SliderEpochs from "@/components/SliderEpochs.vue";
import LoggingButton from "@/components/Logging.vue";

export default {
    name: 'GradientHeatmapVis',
    components: {LoggingButton, SliderEpochs, GradientHeatmap, Neurons},
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
            ],
            isWeight: false,
            appendedData: null,
            tooltipVisible: false,
            tooltipText: '',
            tooltipX: 0,
            tooltipY: 0,
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
        }
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
            this.$store.commit("setDrawLineChart")
            this.$refs.sliderEpochs.appendData()
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
        },
        appendData() {
            this.$refs.sliderEpochs.appendData()
        },
        setAppendedData(item) {
            this.appendedData = item
        },
        buildLoadedNetworkFile() {
            this.$refs.sliderEpochs.buildLoadedNetworkFile()
        },
        showTooltip({ text, box }) {
            this.tooltipText = text;
            const tooltipOffset = 7.5;
            this.tooltipX = box.left + box.width + tooltipOffset;
            this.tooltipY = box.top - tooltipOffset ;
            this.tooltipVisible = true;
        },
        hideTooltip() {
          this.tooltipVisible = false;
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
.container {
    padding: 0;
    height: 100vh;
}
.heatmap {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 88%;
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
    height: 80vh;
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
    max-height: 78vh;
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

.generalButton {
    background-color: #FFFFFF;
    border: 0 solid rgba(0, 0, 0, 0);
    border-radius: .25rem;
    box-shadow: rgba(0, 0, 0, 0.02) 0 0 0 0;
    box-sizing: border-box;
    color: rgba(0, 0, 0, 1);
    cursor: pointer;
    font-family: system-ui,-apple-system,system-ui,"Helvetica Neue",Helvetica,Arial,sans-serif;
    font-size: 16px;
    font-weight: 600;
    justify-content: center;
    line-height: 1.25;
    margin: 0;
    height: 3rem;
    padding: calc(.875rem - 1px);
    position: relative;
    vertical-align: baseline;
    width: auto;
}

.generalButton:active {
    background-color: #F0F0F1;
    border-color: rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.06) 0 2px 4px;
    transform: translateY(0);
}

.toggleBox {
    background-color: transparent;
    border-radius: .25rem;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.3);
}

.visButton {
    background-color: #FFFFFF;
    border: 0 solid rgba(0, 0, 0, 0);
    border-radius: .25rem;
    box-shadow: rgba(0, 0, 0, 0.02) 0 0 0 0;
    box-sizing: border-box;
    color: rgba(0, 0, 0, 1);
    cursor: pointer;
    font-family: system-ui,-apple-system,system-ui,"Helvetica Neue",Helvetica,Arial,sans-serif;
    font-size: 16px;
    font-weight: 600;
    justify-content: center;
    line-height: 1.25;
    margin: 0;
    height: 3rem;
    padding: calc(.875rem - 1px) ;
    position: relative;
    vertical-align: baseline;
    width: auto;
}

.inactive {
    background-color: #F0EBE3;
    color: rgba(0, 0, 0, .3)
}

.tooltipStyle {
  position: fixed;
  background-color: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.3);
  font-family: system-ui,-apple-system,system-ui,"Helvetica Neue",Helvetica,Arial,sans-serif;
  color: black;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  display: none;
  pointer-events: none;
  z-index: 10000;
}

.tooltipStyle.visible {
  display: block;
}

</style>