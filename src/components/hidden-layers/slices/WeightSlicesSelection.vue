<template>
    <div>
        <button @click="swapComponent">Show Heatmap</button>
        <div v-for="(dataset, index) in selectedWeights" :key="index" :style="{display: 'inline-block'}">
                <LineChart :layerIndex="dataset[0]" :neuronIndex="dataset[1]" :weightIndex="dataset[2]" />
            </div>
        </div>
</template>

<script>
import LineChart from "@/components/hidden-layers/slices/LineChart.vue";

export default {
    name: 'WeightSlicesSelection',
    components: {LineChart},
    props: {},
    computed: {
        selectedWeights: {
            get: function() {
                return this.$store.getters.selectedWeights
            }
        },
    },
    methods: {
        swapComponent() {
            this.$emit("swapComponent", "gradient");
        }
    }
}
</script>