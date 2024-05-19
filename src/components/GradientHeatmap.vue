<template>
    <div>
        <p>Test</p>
        <button @click="swapComponent">Show Slices</button>
    </div>
</template>
<script>
//import * as d3 from "d3";


export default {
    name: 'GradientHeatmap',
    components: {},
    props: {},
    methods: {
        swapComponent() {
            this.$emit("swapComponent", "slices");
        }
    },
}
</script>
<style>

</style>