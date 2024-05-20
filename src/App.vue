<template>
    <div id="app">
        <!--<input v-model="networkShape" placeholder="edit me" />-->
        <div class="container-fluid">
            <div class="col">
                <div class="row">
                    <div class="col-md-3" :style="{display: 'flex', alignItems: 'center'}">
                        <ScatterPlotInput/>
                    </div>
                    <div class="col-md-6">
                      <component @swapComponent="swapComponent" v-bind:is="currentComponent"/>
                    </div>
                    <div class="col-md-3" :style="{display: 'flex', alignItems: 'center'}">
                        <ScatterPlotOutput/>
                    </div>
                </div>
            </div>
        </div>
        <LoggingButton/>
    </div>
</template>

<script>

import ScatterPlotInput from "@/components/input-output-layer/ScatterPlotInput.vue";
import ScatterPlotOutput from "@/components/input-output-layer/ScatterPlotOutput.vue";
import LoggingButton from "@/components/Logging.vue";
import GradientHeatmapVis from "@/components/hidden-layers/gradient/GradientHeatmapVis.vue";
import WeightSlicesSelection from "@/components/hidden-layers/slices/WeightSlicesSelection.vue";

export default {
    name: 'App',
    components: {
        'slices': WeightSlicesSelection,
        'gradient': GradientHeatmapVis,
        LoggingButton,
        ScatterPlotOutput,
        ScatterPlotInput
    },
    data() {
        return {
            currentComponent: 'gradient'
        }
    },
    mounted() {
        this.$store.dispatch('loadData');
    },
    computed: {
        networkShape: {
            set(networkShape) {
                this.$store.commit('changeNetworkShape', networkShape);
            }
        },
    },
    methods: {
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
    margin-top: 20px;
}
</style>
