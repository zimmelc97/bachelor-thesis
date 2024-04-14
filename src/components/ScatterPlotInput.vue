<template>
    <div>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" ref="chartGroup">
                <g class="axis axis-x" ref="axisX"></g>
                <g class="axis axis-y" ref="axisY"></g>
                <g class="circle-group" ref="circleGroup"></g>
            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";

export default {
    name: 'ScatterPlotInput',
    props: {},
    data() {
        return {
            svgWidth: 350,
            svgHeight: 350,
            svgPadding: {
                top: 10, right: 10, bottom: 30, left: 30,
            },
        }
    },
    mounted() {
        this.drawChart();
    },
    methods: {
        drawChart() {
            d3.select(this.$refs["chartGroup" + this.variable])
                .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
            this.drawXAxis();
            this.drawYAxis();
            this.drawCircles();
        },
        drawXAxis() {
            d3.select(this.$refs["axisX"]).select(".axis-label").remove()
            d3.select(this.$refs["axisX"])
                .attr('transform', `translate( 0, ${this.svgHeight - this.svgPadding.top - this.svgPadding.bottom} )`)
                .call(d3.axisBottom(this.xScale).ticks(5))
                .append('text')
                .attr('class', 'axis-label')
                .attr('dy', '-0.5em')
                .attr('fill', 'black')
                .attr('text-anchor', 'end')
                .style("font-size", "12px")
                .attr("x", this.svgWidth - this.svgPadding.right - this.svgPadding.left)
        },
        drawYAxis() {
            d3.select(this.$refs["axisY"]).select(".axis-label").remove()
            d3.select(this.$refs["axisY"])
                .call(d3.axisLeft(this.yScale).ticks(5))
                .append('text')
                .attr('class', 'axis-label')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '0.71em')
                .attr('text-anchor', 'end')
                .style("font-size", "12px")
                .attr('fill', 'black')
        },
        drawCircles() {
            const circleGroup = d3.select(this.$refs["circleGroup"]);
            circleGroup.selectAll('.circle-output')
                .data(this.inputData)
                .join('circle')
                .attr('class', 'circle-output')
                .attr('cx', (d) => this.xScale(d.x))
                .attr('cy', (d) => this.yScale(d.label))
                .attr('r', 3)
        },
    },
    computed: {
        inputData: {
            get: function() {
                return this.$store.getters.inputData
            }
        },
        xScale() {
            return d3.scaleLinear()
                .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
                .domain([-1.5, 1.5]);
        },
        yScale() {
            return d3.scaleLinear()
                .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
                .domain([Math.sin(-1.5) * 1.1, Math.sin(1.5) * 1.1]);
        },
    },
    watch: {
        inputData: {
            handler() {
                this.drawChart();
            },
            deep: true,
        },
    }
}
</script>
<style>
.trajectory {
    stroke: #A5A5A5;
    stroke-width: 1.5;
    opacity: 0.4;
    border: none;
    border-top: 1px dotted black;
}
.circle-output {
    fill: #616161;
    stroke: #B7B6B6;
    stroke-width: 1;
}
.hoverText {
    fill: black;
    font-size: 16px;
    font-weight: bold;
}
</style>