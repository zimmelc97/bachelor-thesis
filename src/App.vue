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
                            <div v-for="(dataset, index) in selectedWeights" :key="index" >
                                <LineChart :layerIndex="dataset[0]" :neuronIndex="dataset[1]" :weightIndex="dataset[2]" v-on:append-data="$refs.heatmap.appendData()"/>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-9">
                        <div class="col">
                        <GradientHeatmapVis @setIsWeight="setIsWeight" ref="heatmap"/>
                        </div>
                    </div>
                    <div class="col-md-1">
                        <Legend :isWeight="isWeight"></Legend>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>

import ScatterPlotOutput from "@/components/input-output-layer/ScatterPlotOutput.vue";
import GradientHeatmapVis from "@/components/hidden-layers/gradient/GradientHeatmapVis.vue";
import LineChart from "@/components/hidden-layers/slices/LineChart.vue";
import Legend from "@/components/hidden-layers/gradient/Legend.vue";

export default {
    name: 'App',
    components: {
        LineChart,
        GradientHeatmapVis,
        ScatterPlotOutput,
        Legend
    },
    data() {
        return {
            currentComponent: 'gradient',
            networkShapeInput: "",
            isWeight: false
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
        setIsWeight(value) {
            this.isWeight = value
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
