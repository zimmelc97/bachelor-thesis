<template>
    <div id="app">
        <!--<input v-model="networkShape" placeholder="edit me" />-->
        <div class="container-fluid">
            <div class="col">
                <div class="row">
                    <div class="col-md-2" :style="{display: 'flex', alignItems: 'center'}">
                        <div class="col">
                            <div>
                                <label for="numberArray" >Enter #neurons in hidden layers (comma-separated):</label>
                                <input type="text" id="numberArray" v-model="networkShapeInput" placeholder="5,5" @keydown.enter="processInput">
                            </div>
                            <br/><br/>
                            <ScatterPlotOutput/>
                            <LoggingButton/>
                            <div v-for="(dataset, index) in selectedWeights" :key="index" >
                                <LineChart :layerIndex="dataset[0]" :neuronIndex="dataset[1]" :weightIndex="dataset[2]" />
                            </div>
                        </div>
                    </div>
                    <div class="col-md-10">
                        <div class="col">
                        <component @swapComponent="swapComponent" v-bind:is="currentComponent"/>
                        <SliderEpochs></SliderEpochs>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>

import ScatterPlotInput from "@/components/input-output-layer/ScatterPlotInput.vue";
import ScatterPlotOutput from "@/components/input-output-layer/ScatterPlotOutput.vue";
import LoggingButton from "@/components/Logging.vue";
import GradientHeatmapVis from "@/components/hidden-layers/gradient/GradientHeatmapVis.vue";
import WeightSlicesSelection from "@/components/hidden-layers/slices/WeightSlicesSelection.vue";
import LineChart from "@/components/hidden-layers/slices/LineChart.vue";
import SliderEpochs from "@/components/SliderEpochs.vue";

export default {
    name: 'App',
    components: {
        SliderEpochs,
        LineChart,
        'slices': WeightSlicesSelection,
        'gradient': GradientHeatmapVis,
        LoggingButton,
        ScatterPlotOutput,
        ScatterPlotInput
    },
    data() {
        return {
            currentComponent: 'gradient',
            networkShapeInput: ""
        }
    },
    mounted() {
        this.$store.dispatch('loadData');
    },
    computed: {
        selectedWeights: {
            get: function() {
                return this.$store.getters.selectedWeights
            }
        },
    },
    methods: {
        processInput() {
            const input = this.networkShapeInput.split(',')
                .map(item => item.trim())
                .filter(item => item !== '')
                .map(item => Number(item))
            this.$store.commit('changeNetworkShape', input);
        },
        swapComponent: function(component) {
            this.currentComponent = component;
        }
    }
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    background: #F0EBE3;
}
</style>
