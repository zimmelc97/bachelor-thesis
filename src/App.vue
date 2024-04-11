<template>
    <div id="app">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-5">
                    <ScatterPlot/>
                </div>
                <div class="col-md-5">
                    <SliderWeights/>
                </div>
                <div class="col-md-12">
                    <LineChart/>
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
