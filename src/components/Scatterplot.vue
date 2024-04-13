<template>
    <div>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" :ref="'chartGroup' + this.variable">
                <g class="axis axis-x" :ref="'axisX' + this.variable"></g>
                <g class="axis axis-y" :ref="'axisY' + this.variable"></g>
                <g v-if="this.variable === 'Output'" class="line-group" :ref="'lineGroup' + this.variable"></g>
                <g class="circle-group" :ref="'circleGroup' + this.variable"></g>
            </g>
        </svg>
    </div>
</template>

<script>
    import * as d3 from "d3";

    export default {
    name: 'Scatterplot',
    props: {
        dataset: {
            type: Array,
            required: true
        },
        variable: {
            type: String,
            required: true
    }
    },
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
        this.drawLines()
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
            d3.select(this.$refs["axisX" + this.variable]).select(".axis-label").remove()
            d3.select(this.$refs["axisX" + this.variable])
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
            d3.select(this.$refs["axisY" + this.variable]).select(".axis-label").remove()
            d3.select(this.$refs["axisY" + this.variable])
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
        drawCircles() {
            const circleGroup = d3.select(this.$refs["circleGroup" + this.variable]);
            circleGroup.selectAll('.circle-output')
                .data(this.dataset)
                .join('circle')
                .attr('class', 'circle-output')
                .attr('cx', (d) => this.xScale(d.x))
                .attr('cy', (d) => this.yScale(d.label))
                .attr('r', 3)
        },
        drawLines() {
            const linesGroup = d3.select(this.$refs["lineGroup" + this.variable]);
            linesGroup.selectAll('.trajectory').remove();

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
        },
        computeTrajectory() {
            let trajectories = []
            for(let i=0; i<this.range.length; i++) {
                let weightsNew = [...this.weights]
                weightsNew[this.index] = {id: this.index, value: this.range[i]}
                trajectories.push(this.predictData(weightsNew).slice().sort((a,b) => d3.ascending(a.x, b.x)))
            }
            return trajectories
        },
        predictData(weights) {
            let predictedData = []
            for(let i=0; i<this.inputData.length; i++) {
                predictedData.push({x: this.inputData[i].x, label: this.predict(this.inputData[i].x,weights)})
            }
            return predictedData
        },
    },
    computed: {
        inputData: {
            get: function() {
                return this.$store.getters.inputData
            }
        },
        index: {
            get: function() {
                return this.$store.getters.index
            }
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
            return d3.range(-5, 5.1, 10)
        },
    },
    watch: {
        weights: {
            handler() {
                this.drawChart();
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