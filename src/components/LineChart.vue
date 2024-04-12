<template>
    <div>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" :ref="'chartGroup0'">
                <g class="axis axis-x" :ref="'axisX0'"></g>
                <g class="axis axis-y" :ref="'axisY0'"></g>
                <g class="line-group" :ref="'lineGroup0'"></g>
                <g class="circle-group" :ref="'circleGroup0'"></g>
            </g>
        </svg>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" :ref="'chartGroup1'">
                <g class="axis axis-x" :ref="'axisX1'"></g>
                <g class="axis axis-y" :ref="'axisY1'"></g>
                <g class="line-group" :ref="'lineGroup1'"></g>
                <g class="circle-group" :ref="'circleGroup1'"></g>
            </g>
        </svg>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" :ref="'chartGroup2'">
                <g class="axis axis-x" :ref="'axisX2'"></g>
                <g class="axis axis-y" :ref="'axisY2'"></g>
                <g class="line-group" :ref="'lineGroup2'"></g>
                <g class="circle-group" :ref="'circleGroup2'"></g>
            </g>
        </svg>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" :ref="'chartGroup3'">
                <g class="axis axis-x" :ref="'axisX3'"></g>
                <g class="axis axis-y" :ref="'axisY3'"></g>
                <g class="line-group" :ref="'lineGroup3'"></g>
                <g class="circle-group" :ref="'circleGroup3'"></g>
            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";

export default {
    name: 'LineChart',
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
        for (let i=0; i<this.weightsNr; i++) {
            this.drawChart(i.toString())
        }
    },
    methods: {
        drawChart(ref) {
            d3.select(this.$refs["chartGroup" + ref])
                .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
            this.drawXAxis(ref);
            this.drawYAxis(ref);
            this.drawLine(ref);
            this.drawCircle(ref)
        },
        drawXAxis(ref) {
            d3.select(this.$refs["axisX" + ref]).select(".axis-label").remove()
            d3.select(this.$refs["axisX" + ref])
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
        drawYAxis(ref) {
            d3.select(this.$refs["axisY" + ref]).select(".axis-label").remove()
            d3.select(this.$refs["axisY" + ref])
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
        sigmoid(x) {
            return 1 / (1 + Math.pow(Math.E,-x))
        },
        predict(x,w) {
            return w[2].value*this.sigmoid(w[0].value*x)+w[3].value*this.sigmoid(w[1].value*x)
        },
        MSE(weights) {
            let mse = 0.0
            for(let i=0; i<this.data.length; i++) {
                let y = this.predict(this.data[i].x,weights)
                mse += Math.pow((y-this.data[i].label),2)
            }
            return mse/this.data.length
        },
        slice(index) {
            let slice = []
            for(let i=0; i<this.range.length; i++) {
                let weightsNew = [...this.weights]
                weightsNew[index] = {id: index, value: this.range[i]}
                slice.push([this.range[i], this.MSE(weightsNew)])
            }
            return slice
        },
        drawLine(ref) {
                const linesGroup = d3.select(this.$refs["lineGroup" + ref]);
                linesGroup.selectAll('.mse-line').remove();

                const line = d3.line()
                    .x((d) => this.xScale(d[0]))
                    .y((d) => this.yScale(d[1]));

                const clipPath = linesGroup
                    .attr('clip-path', 'url(#clip)');

                clipPath.selectAll('.line')
                    .data([this.slice(ref)])
                    .join('path')
                    .attr('class', 'mse-line')
                    .attr('d', line)
                    .attr("fill", "none")
        },
        drawCircle(ref) {
            const circleGroup = d3.select(this.$refs["circleGroup" + ref]);
            let drag = d3.drag()
                .on('start', this.dragStarted)
                .on('drag', this.dragged)
                .on('end', this.dragEnded);

            circleGroup.selectAll('.circle')
                .data([[this.weights[parseInt(ref)].value, this.MSE(this.weights)]])
                .join('circle')
                .attr('class', 'circle')
                .attr('cx', (d) => this.xScale(d[0]))
                .attr('cy', (d) => this.yScale(d[1]))
                .attr('r', 5)
                .style("cursor", "pointer");

            circleGroup.selectAll('.circle').call(drag);
        },
        dragStarted() {
            d3.select(this).raise().classed('stroke', true);
        },
        dragged() {
            d3.select(this)
                .attr('cx', 0)
                .attr('cy', 0);

        },
        dragEnded() {
            d3.select(this).classed('stroke', false);
        }

    },
    computed: {
        data: {
            get: function() {
                return this.$store.getters.inputData
            }
        },
        predictedData() {
            let predictedData = []
            for(let i=0; i<this.data.length; i++) {
                predictedData.push({x: this.data[i].x, label: this.predict(this.data[i].x,this.weights)})
            }
            return predictedData
        },
        weights: {
            get: function() {
                return this.$store.getters.weights
            }
        },
        weightsNr() {
            return this.weights.length
        },
        range() {
            var step = 0.2;
            var range = [];
            for (let j = -5; j <= 5; j += step) {
                range.push(parseFloat(j));
            }
            return range
        },
        xScale() {
            return d3.scaleLinear()
                .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
                .domain([-5, 5]);
        },
        yScale() {
            return d3.scaleLinear()
                .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
                .domain([Math.sin(-1.5) * 1.1, Math.sin(1.5) * 1.1]);
        },
    },
    watch: {
        weights: {
            handler() {
                for (let i=0; i<this.weightsNr; i++) {
                    this.drawChart(i.toString())
                }
            },
            deep: true,
        },
    }
}
</script>
<style>
.mse-line {
    stroke: #B7B6B6;
    stroke-width: 2;
    opacity: 1;
}
.circle {
    fill: #B7B6B6;
    stroke: #ffffff;
    stroke-width: 1;
}
</style>