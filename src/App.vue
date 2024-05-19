<template>
    <div id="app">
        <div class="container-fluid">
            <LoggingButton/>
            <div class="col">
                <div class="row">
                    <div class="col-md-3" :style="{display: 'flex', alignItems: 'center'}">
                        <ScatterPlotInput/>
                    </div>
                    <div class="col-md-6">
                      <div v-for="(dataset, layerIndex) in networkShape" :key="'layer' + layerIndex" :style="{display: 'inline-block'}">
                        <div v-for="(dataset, neuronIndex) in [...Array(networkShape[layerIndex]).keys()]" :key="'neuron' + neuronIndex">
                          <div v-for="(dataset, weightIndex) in network[layerIndex][neuronIndex].getInputLinks()" :key="'weight' + weightIndex">
                            <LineChart :layerIndex="layerIndex" :neuronIndex="neuronIndex" :weightIndex="weightIndex" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-3" :style="{display: 'flex', alignItems: 'center'}">
                        <ScatterPlotOutput/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import LineChart from "./components/LineChart.vue";
import ScatterPlotInput from "@/components/ScatterPlotInput.vue";
import ScatterPlotOutput from "@/components/ScatterPlotOutput.vue";
import LoggingButton from "@/components/Logging.vue";

export default {
    name: 'App',
    components: {
        LoggingButton,
        ScatterPlotOutput, ScatterPlotInput, LineChart
    },
    mounted() {
        this.$store.dispatch('loadData');
    },
    computed: {
        network: {
            get: function() {
                return this.$store.getters.network
            }
        },
      networkShape: {
        get: function() {
          return this.$store.getters.networkShape
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
