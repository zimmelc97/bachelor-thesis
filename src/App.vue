<template>
    <div id="app">
        <div class="container-fluid">
            <div class="col">
                <div class="col-md-5">
                    <SliderWeights/>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <ScatterPlot :key="0" :dataset="this.inputData" :variable="'Input'"/>
                    </div>
                    <div class="col-md-4">
                        <LineChart v-for="(dataset, index) in this.weights" :key="index" :index="index"/>
                    </div>
                    <div class="col-md-4">
                        <ScatterPlot :key="1" :dataset="predictData(this.weights)" :variable="'Output'"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import ScatterPlot from "./components/Scatterplot.vue";
import SliderWeights from "./components/SliderWeights.vue";
import LineChart from "./components/LineChart.vue";

export default {
    name: 'App',
    components: {
        ScatterPlot, SliderWeights, LineChart
    },
    mounted() {
        this.$store.dispatch('loadData');
    },
    methods: {
        sigmoid(x) {
            return 1 / (1 + Math.pow(Math.E,-x))
        },
        predict(x,w) {
            return w[2].value*this.sigmoid(w[0].value*x)+w[3].value*this.sigmoid(w[1].value*x)
        },
        predictData(weights) {
            let predictedData = []
            for(let i=0; i<this.inputData.length; i++) {
                predictedData.push({x: this.inputData[i].x, label: this.predict(this.inputData[i].x,weights)})
            }
            return predictedData
        },
    },
    computed: {
        inputData: {
            get: function() {
                return this.$store.getters.inputData
            }
        },
        weights: {
            get: function() {
                return this.$store.getters.weights
            }
        },
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
    margin-top: 20px;
}
</style>
