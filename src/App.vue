<template>
    <div id="app">
        <div class="container-fluid">
            <div class="col">
                <div class="col-md-5">
                    <SliderWeights/>
                </div>
                <div class="row">
                    <div class="col-md-4">
                        <ScatterPlotInput/>
                    </div>
                    <div class="col-md-4">
                        <LineChart v-for="(dataset, index) in this.weights" :key="index" :index="index"/>
                    </div>
                    <div class="col-md-4">
                        <ScatterPlotOutput/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import SliderWeights from "./components/SliderWeights.vue";
import LineChart from "./components/LineChart.vue";
import ScatterPlotInput from "@/components/ScatterPlotInput.vue";
import ScatterPlotOutput from "@/components/ScatterPlotOutput.vue";

export default {
    name: 'App',
    components: {
        ScatterPlotOutput, ScatterPlotInput, SliderWeights, LineChart
    },
    mounted() {
        this.$store.dispatch('loadData');
    },
    computed: {
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
