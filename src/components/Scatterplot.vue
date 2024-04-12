<template>
    <div>
    <div class="vis-component" ref="chart1">
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" ref="chartGroupInput">
                <g class="axis axis-x" ref="axisXInput"></g>
                <g class="axis axis-y" ref="axisYInput"></g>
                <g class="circle-group" ref="circleGroupInput"></g>
            </g>
        </svg>
    </div>
        <div class="vis-component" ref="chart2">
            <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
                <g class="chart-group" ref="chartGroupOutput">
                    <g class="axis axis-x" ref="axisXOutput"></g>
                    <g class="axis axis-y" ref="axisYOutput"></g>
                    <g class="circle-group" ref="circleGroupOutput"></g>
                    <g class="line-group" ref="lineGroup"></g>
                </g>
            </svg>
        </div>
    </div>
</template>

<script>
    import * as d3 from "d3";

    export default {
    name: 'Scatterplot',
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
        this.drawChart(this.data, "Input");
        this.drawChart(this.predictedData,"Output");
        this.drawLines()
    },
    methods: {
        drawChart(data,variable) {
            d3.select(this.$refs["chartGroup" + variable])
                .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
            this.drawXAxis(variable);
            this.drawYAxis(variable);
            this.drawCircles(data, variable);
        },
        drawXAxis(variable) {
            d3.select(this.$refs["axisX" + variable]).select(".axis-label").remove()
            d3.select(this.$refs["axisX" + variable])
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
        drawYAxis(variable) {
            d3.select(this.$refs["axisY" + variable]).select(".axis-label").remove()
            d3.select(this.$refs["axisY" + variable])
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
        drawCircles(data, variable) {
            const circleGroup = d3.select(this.$refs["circleGroup" + variable]);
            circleGroup.selectAll('.circle')
                .data(data)
                .join('circle')
                .attr('class', 'circle')
                .attr('cx', (d) => this.xScale(d.x))
                .attr('cy', (d) => this.yScale(d.label))
                .attr('r', 4)
            console.log(this.MSE)
        },
        drawLines(ref) {
            const linesGroup = d3.select(this.$refs["lineGroup"]);
            linesGroup.selectAll('.mse-line').remove();

            const line = d3.line()
                .x((d) => this.xScale(d.x))
                .y((d) => this.yScale(d.label));

            const clipPath = linesGroup
                .attr('clip-path', 'url(#clip)');

            clipPath.selectAll('.line')
                .data(this.computeTrajectory(ref))
                .join('path')
                .attr('class', 'mse-line')
                .attr('d', d => line(d))
                .attr("fill", "none")
                .style("stroke", (d, i) => d3.schemeCategory10[i]);
        },
        computeTrajectory() {
            let trajectories = []
            for(let i=0; i<this.range.length; i++) {
                let weightsNew = [...this.weights]
                weightsNew[this.index] = {id: this.index, value: this.range[i]}
                trajectories.push(this.predictData(weightsNew).slice().sort((a,b) => d3.ascending(a.x, b.x)))
            }
            console.log(trajectories)
            return trajectories
        },
        predictData(weights) {
            let predictedData = []
            for(let i=0; i<this.data.length; i++) {
                predictedData.push({x: this.data[i].x, label: this.predict(this.data[i].x,weights)})
            }
            return predictedData
        },
    },
    computed: {
        data: {
            get: function() {
                return this.$store.getters.inputData
            }
        },
        index: {
            get: function() {
                return this.$store.getters.index
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
        range() {
            var step = 2.5;
            var range = [];
            for (let j = -5; j <= 5; j += step) {
                range.push(parseFloat(j));
            }
            return range
        },
        MSE() {
            let mse = 0.0
            for(let i=0; i<this.data.length; i++) {
                let y = this.predict(this.data[i].x,this.weights)
                mse += Math.pow((y-this.data[i].label),2)
            }
            return mse/this.data.length
        },
    },
    watch: {
        data: {
            handler() {
                this.drawChart(this.data, "Input");
                this.drawChart(this.predictedData,"Output");
            },
            deep: true,
        },
        weights: {
            handler() {
                this.drawChart(this.data, "Input");
                this.drawChart(this.predictedData,"Output");
            },
            deep: true,
        },
        index: {
            handler() {
                this.drawChart(this.predictedData,"Output");
                this.drawLines()
            },
            deep: true,
        },
    }
    }
</script>
<style>
    .circle {
    fill: #B7B6B6;
    stroke: #ffffff;
    stroke-width: 1;
}
    .hoverText {
    fill: black;
    font-size: 16px;
    font-weight: bold;
}
</style>