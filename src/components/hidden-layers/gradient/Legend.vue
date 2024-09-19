<template>
    <div>
        <svg class="main-svg mt-3 ml-4" ref="svg" width="200" height="1000">
            <g class="legend" ref="legend"></g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";

export default {
    name: 'Legend',
    components: {},
    props: {
        isWeight: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            color: "#000000"
        }
    },
    mounted() {
        if (this.isWeight)
            this.drawLegend(5)
        else
            this.drawLegend(10)
    },
    methods: {
        drawLegend(range) {
            d3.select(this.$refs["legend"]).selectAll("rect").remove()
            d3.select(this.$refs["legend"]).selectAll("text").remove()

            let colors = []
            let numbers = []

            for (let i = this.colors.blue.length - 1; i >= 0; i--) {
                colors.push(this.colors.blue[i])
            }

            colors.push('#ffffff')

            for (let i = 0; i < this.colors.blue.length; i++) {
                colors.push(this.colors.red[i])
            }

            const stepSize = range/this.colors.red.length
            let number = -range
            for(let i = this.colors.red.length; i > 0; i--) {

                numbers.push(number.toString())
                number = number + stepSize
            }
            numbers.push('-0.1 - 0.1')
            for(let i = 0; i < this.colors.red.length; i++) {
                number = number + stepSize
                numbers.push(number)
            }

            d3.select(this.$refs["legend"]).selectAll('rect')
                .data(colors)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => 20 * i)
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", d => d)

            d3.select(this.$refs["legend"]).selectAll('text')
                .data(numbers)
                .enter()
                .append("text")
                .attr("x", 25)
                .attr("y", (d, i) => 20 * i + 15)
                .attr('font-size', '14px')
                .text(d => d)
        }
    },
    computed: {
        colors: {
            get: function() {
                return this.$store.getters.colors
            }
        },
    },
    watch: {
        isWeight : {
            handler() {
                if (this.isWeight)
                    this.drawLegend(5)
                else {
                    this.drawLegend(10)
                }
            }
        }
    }
}
</script>

<style>
.legend {
    font-family: system-ui,-apple-system,system-ui,"Helvetica Neue",Helvetica,Arial,sans-serif;
}
</style>