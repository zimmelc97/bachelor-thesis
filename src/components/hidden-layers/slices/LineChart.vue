<template>
    <div>
        <p>L{{ this.layerIndex }} - N{{ this.neuronIndex }} - W{{ this.weightIndex }}</p>
        <svg class="main-svg" ref="svg" :width="svgWidth" :height="svgHeight">
            <g class="chart-group" ref="chartGroup">
                <g class="axis axis-x" ref="axisX"></g>
                <g class="axis axis-y" ref="axisY"></g>
                <g class="line-group" ref="lineGroup"></g>
                <g class="circle-group" ref="circleGroup"></g>
            </g>
        </svg>
        <p>Der : {{ this.der.toFixed(4) }}</p>
        <SliderWeights :layerIndex="layerIndex" :neuronIndex="neuronIndex" :weightIndex="weightIndex"/>
    </div>
</template>
<script>
import * as d3 from "d3";

import SliderWeights from "@/components/hidden-layers/slices/SliderWeights.vue";
import {getInputWeight, forwardPropSlices} from "@/neural-network/nn";

export default {
    name: 'LineChart',
    components: {SliderWeights},
    props: {
        layerIndex: {
            type: Number,
            required: true
      },
        neuronIndex: {
            type: Number,
            required: true
      },
        weightIndex: {
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
            idleTimeout: null,
            brush: null,
            zoom: null
        }
    },
    mounted() {
        this.drawChart()
    },
    methods: {
        drawChart() {
            d3.select(this.$refs["chartGroup"])
                .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
            this.drawXAxis();
            this.drawYAxis();
            this.drawLine();
            this.drawCircle()

            this.brush = d3.brushX()
                .extent([
                    [0, 0],
                    [this.svgWidth, this.svgHeight]
                ])
                .on("brush end", this.brushed)

            this.zoom = d3.zoom()
                .scaleExtent([1, Infinity])
                .translateExtent([[0, 0], [this.svgWidth, this.svgHeight]])
                .extent([[0, 0], [this.svgWidth, this.svgHeight]])
                .on('zoom', this.zoomed);

            d3.select(this.$refs["chartGroup"])
                .append("g")
                .attr("class", "brush")
                .call(this.brush)
                .call(this.brush.move, this.xScale.range())

            d3.select(this.$refs["chartGroup"]).append("rect")
                .attr("class", "zoom")
                .attr("width", this.svgWidth)
                .attr("height", this.svgHeight)
                .style('fill', 'none')
                .style('pointer-events', 'all')
                .style('cursor', 'move')
                .attr("transform", "translate(0,-"  + this.svgPadding.top + ")")
                .call(this.zoom);
        },
        drawXAxis() {
            d3.select(this.$refs["axisX"]).select(".axis-label").remove()
            d3.select(this.$refs["axisX"])
                .attr('transform', `translate( 0, ${this.svgHeight - this.svgPadding.bottom - this.svgPadding.top} )`)
                .call(d3.axisBottom(this.xScale).ticks(5))
                .append('text')
                .attr('class', 'axis-label')
                .attr('dy', '-0.5em')
                .attr('fill', 'black')
                .attr('text-anchor', 'end')
                .style("font-size", "12px")
                .text("weight")
                .attr("x", this.svgWidth - this.svgPadding.left - this.svgPadding.right)
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
                .text("MSE")
                .attr('fill', 'black')
        },
        computeMSESlices(weight) {
            let mse = 0
            for(let i=0; i<this.data.length; i++) {
              let y = forwardPropSlices(this.network, [this.data[i].x],this.layerIndex, this.neuronIndex, this.weightIndex, weight)
              mse += Math.pow((y-this.data[i].label),2)
            }
            return mse/this.data.length
        },
        slice() {
            let slice = []
            for(let i=0; i<this.range.length; i++) {
                slice.push([this.range[i], this.computeMSESlices(this.range[i])])
            }
            return slice
        },
        drawLine() {
            const linesGroup = d3.select(this.$refs["lineGroup"]);
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
            const circleGroup = d3.select(this.$refs["circleGroup"]);

            let drag = d3.drag()
                .on('drag', this.dragged);

            circleGroup.selectAll('.circle')
                .data([[this.weight, this.MSE]])
                .join('circle')
                .attr('class', 'circle')
                .attr('cx', (d) => this.xScale(d[0]))
                .attr('cy', (d) => this.yScale(d[1]))
                .attr('r', 5)
                .style("cursor", "pointer")
                .call(drag)
                .on("click", () => this.changeTrajectory())
        },
        dragged(event) {
            this.$store.commit('changeWeightInNetwork', {layerIndex: this.layerIndex,
              neuronIndex: this.neuronIndex,
              weightIndex: this.weightIndex,
              weight: this.xScale.invert(event.x)});
            d3.select(event.sourceEvent.target)
                .attr('cx', event.x)
                .attr('cy', this.yScale(this.MSE));
        },
        changeTrajectory() {
            this.$store.commit('changeIndex', [this.layerIndex, this.neuronIndex, this.weightIndex]);
        },
        brushed(event) {
            if (event.sourceEvent && event.sourceEvent.type === "zoom") return;

            let s = event.selection ;

            this.xScale.domain(s.map(this.xScale.invert, this.xScale));


            d3.select(this.$refs["chartGroup"]).select(".zoom").call(this.zoom.transform, d3.zoomIdentity
                .scale(this.svgWidth / (s[1] - s[0]))
                .translate(-s[0], 0));

        },
        zoomed(event) {
            if (event.sourceEvent && event.sourceEvent.type === "brush") return;

            let t = event.transform;
            this.xScale.domain(t.rescaleX(this.xScale).domain());

            d3.select(this.$refs["chartGroup"]).select(".brush").call(this.brush.move, this.xScale.range().map(t.invertX, t));
        },
    },
    computed: {
        data: {
            get: function() {
                return this.$store.getters.inputData
            }
        },
        network: {
            get: function() {
                return this.$store.getters.network
            }
        },
        weights: {
            get: function() {
                return this.$store.getters.weights
            }
        },
        weight: {
          get: function() {
              return getInputWeight(this.network[this.layerIndex][this.neuronIndex], this.weightIndex)
          }
        },
        selectedWeights: {
            get: function() {
                return this.$store.getters.selectedWeights
            }
        },
        MSE: {
            get: function() {
                return this.$store.getters.MSE
            }
        },
        der: {
          get: function() {
              return this.network[this.layerIndex][this.neuronIndex].getInputLinks()[this.weightIndex].getAccErrorDer()
          }
        },
        range() {
            return d3.range(-20.1, 20.1, 1)
        },
        xScale() {
            return d3.scaleLinear()
                .range([0, this.svgWidth - this.svgPadding.left - this.svgPadding.right])
                .domain([-20, 20]);
        },
        yScale() {
            return d3.scaleLinear()
                .range([this.svgHeight - this.svgPadding.top - this.svgPadding.bottom, 0])
                .domain([0, 5]);
        },
    },
    watch: {
        MSE: {
            handler() {
                this.drawLine()
                this.drawCircle()
            },
            deep: true,
        },
        selectedWeights: {
            handler() {
                this.drawLine()
                this.drawCircle()
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