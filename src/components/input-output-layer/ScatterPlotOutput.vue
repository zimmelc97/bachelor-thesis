<template>
    <div>
        <p>MSE : {{ parseFloat(this.MSE).toFixed(7) }}</p>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" ref="chartGroup">
                <g class="axis axis-x" ref="axisX"></g>
                <g class="axis axis-y" ref="axisY"></g>
                <g class="line-group" ref="lineGroup"></g>
                <g class="circle-group" ref="circleGroupInput"></g>
                <g class="circle-group" ref="circleGroupOutput"></g>
            </g>
        </svg>
    </div>
</template>

<script>
    import * as d3 from "d3";
    import {forwardProp, forwardPropSlices} from "@/neural-network/nn";

    export default {
    name: 'ScatterPlotOutput',
    props: {},
    data() {
        return {
            svgWidth: 250,
            svgHeight: 250,
            svgPadding: {
            top: 10, right: 10, bottom: 30, left: 30,
            },
        }
    },
    mounted() {
        this.drawChart();
        this.drawCircles(this.inputData, "Input");
    },
    methods: {
        drawChart() {
            d3.select(this.$refs["chartGroup"])
                .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
            this.drawXAxis();
            this.drawYAxis();
            this.drawCircles(this.predictedData, "Output");
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
        drawCircles(data, variable) {
            const circleGroup = d3.select(this.$refs["circleGroup" + variable]);
            circleGroup.selectAll('.circle-' + variable)
                .data(data)
                .join('circle')
                .attr('class', 'circle-' + variable)
                .attr('cx', (d) => this.xScale(d.x))
                .attr('cy', (d) => this.yScale(d.label))
                .attr('r', 3)
        },
        drawLines() {
            const linesGroup = d3.select(this.$refs["lineGroup"]);
            linesGroup.selectAll('.trajectory').remove();

            if (this.index.length !== 0) {
                const line = d3.line()
                    .x((d) => this.xScale(d.x))
                    .y((d) => this.yScale(d.label));

                const clipPath = linesGroup
                    .attr('clip-path', 'url(#clip)');

                clipPath.selectAll('.line')
                    .data(this.computeTrajectory())
                    .join('path')
                    .attr('class', 'trajectory')
                    .attr('d', d => line(d))
                    .attr("fill", "none")
            }
        },
        computeTrajectory() {
            let trajectories = []
            for(let i=0; i<this.range.length; i++) {
                let predictedData = []
                for(let j=0; j<this.inputData.length; j++) {
                    predictedData.push({x: this.inputData[j].x,
                        label: forwardPropSlices(this.network, [this.inputData[j].x], this.index[0], this.index[1], this.index[2], this.range[i])})
                }
                trajectories.push(predictedData.slice().sort((a,b) => d3.ascending(a.x, b.x)))
            }
            return trajectories
        },
        predictData() {
            let predictedData = []
            for(let i=0; i<this.inputData.length; i++) {
                predictedData.push({x: this.inputData[i].x, label: forwardProp(this.network, [this.inputData[i].x])})
            }
            return predictedData
        },
        computeMSE() {
            let mse = 0
            for(let i=0; i<this.inputData.length; i++) {
                let y = forwardProp(this.network, [this.inputData[i].x])
                mse += Math.pow((y-this.inputData[i].label),2)
            }
            return mse/this.inputData.length
        },
        setMSE() {
            this.$store.commit('changeMSE', this.computeMSE());
        },
    },
    computed: {
        inputData: {
            get: function() {
                return this.$store.getters.inputData
            }
        },
        predictedData: {
            get: function() {
                return this.predictData()
            }
        },
        index: {
            get: function() {
                return this.$store.getters.index
            }
        },
        MSE: {
            get: function() {
                return this.$store.getters.MSE
            }
        },
        weights: {
            get: function() {
                return this.$store.getters.weights
            }
        },
        network: {
            get: function() {
              return this.$store.getters.network
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
            return d3.range(-5, 5.1, 1)
        },
    },
    watch: {
        inputData: {
            handler() {
                this.drawCircles(this.inputData, "Input");
            },
            deep: true,
        },
        weights: {
            handler() {
                this.setMSE()
                this.drawCircles(this.predictedData, "Output");
            },
            deep: true,
        },
        index: {
            handler() {
                this.drawLines();
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
    .circle-Output {
        fill: #616161;
        stroke: #B7B6B6;
        stroke-width: 1;
    }
    .circle-Input {
        fill: #616161;
        stroke: #B7B6B6;
        stroke-width: 1;
        opacity: 0.5;
    }
    .hoverText {
        fill: black;
        font-size: 16px;
        font-weight: bold;
    }
</style>