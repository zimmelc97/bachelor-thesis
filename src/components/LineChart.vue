<template>
    <div>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" :ref="'chartGroup' + this.index">
                <g class="axis axis-x" :ref="'axisX' + this.index"></g>
                <g class="axis axis-y" :ref="'axisY' + this.index"></g>
                <g class="line-group" :ref="'lineGroup' + this.index"></g>
                <g class="circle-group" :ref="'circleGroup' + this.index"></g>
            </g>
        </svg>
    </div>
</template>
<script>
import * as d3 from "d3";

export default {
    name: 'LineChart',
    props: {
        index: {
            type: Number,
            required: true
        }
    },
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
        this.drawChart()
    },
    methods: {
        drawChart() {
            d3.select(this.$refs["chartGroup" + this.index])
                .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
            this.drawXAxis();
            this.drawYAxis();
            this.drawLine();
            this.drawCircle()
        },
        drawXAxis() {
            d3.select(this.$refs["axisX" + this.index]).select(".axis-label").remove()
            d3.select(this.$refs["axisX" + this.index])
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
            d3.select(this.$refs["axisY" + this.index]).select(".axis-label").remove()
            d3.select(this.$refs["axisY" + this.index])
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
        slice() {
            let slice = []
            for(let i=0; i<this.range.length; i++) {
                let weightsNew = [...this.weights]
                weightsNew[this.index] = {id: this.index, value: this.range[i]}
                slice.push([this.range[i], this.MSE(weightsNew)])
            }
            return slice
        },
        drawLine() {
                const linesGroup = d3.select(this.$refs["lineGroup" + this.index]);
                linesGroup.selectAll('.mse-line').remove();

                const line = d3.line()
                    .x((d) => this.xScale(d[0]))
                    .y((d) => this.yScale(d[1]));

                const clipPath = linesGroup
                    .attr('clip-path', 'url(#clip)');

                clipPath.selectAll('.line')
                    .data([this.slice()])
                    .join('path')
                    .attr('class', 'mse-line')
                    .attr('d', line)
                    .attr("fill", "none")
        },
        drawCircle() {
            const circleGroup = d3.select(this.$refs["circleGroup" + this.index]);
            let drag = d3.drag()
                .on('drag', this.dragged);

            circleGroup.selectAll('.circle')
                .data([[this.weights[this.index].value, this.MSE(this.weights)]])
                .join('circle')
                .attr('class', 'circle')
                .attr('cx', (d) => this.xScale(d[0]))
                .attr('cy', (d) => this.yScale(d[1]))
                .attr('r', 5)
                .style("cursor", "pointer")
                .call(drag)
                .on("click", () => this.changeTrajectory())
        },
        dragStarted() {
            d3.select(this).raise().classed('stroke', true);
        },
        dragged(event) {
            let weightsNew = [...this.weights]
            weightsNew[this.index] = {id: this.index, value: this.xScale.invert(event.x)}
            this.$store.commit('changeWeights', weightsNew);
            d3.select(event.sourceEvent.target)
                .attr('cx', event.x)
                .attr('cy', this.yScale(this.MSE(this.weights)));
        },
        dragEnded() {
            d3.select(this).classed('stroke', false);
        },
        changeTrajectory() {
            this.$store.commit('changeIndex', this.index);
        }
    },
    computed: {
        data: {
            get: function() {
                return this.$store.getters.inputData
            }
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
            return d3.range(-5, 5, 0.5)
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
                this.drawChart()
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