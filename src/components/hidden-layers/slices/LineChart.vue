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
            currentTransform: null,
            zoomLevel: 1
        }
    },
    mounted() {
        this.drawChart()
        this.initZoom()
    },
    methods: {
        drawChart() {
            d3.select(this.$refs["chartGroup"])
                .attr('transform', `translate(${this.svgPadding.left},${this.svgPadding.top})`);
            this.drawXAxis();
            this.drawYAxis();
            this.drawLine();
            this.drawCircle()
        },
        initZoom() {
            this.currentTransform = null
            const zoom = d3.zoom()
                .scaleExtent([1, 20])  // Trurhis controls how much you can unzoom (x0.5) and zoom (x20)
                .extent([[0, 0], [this.svgWidth, this.svgHeight]])
                .on("zoom", this.updateChart.bind(this))

            d3.select(this.$refs.lineGroup).append("rect")
                .attr("width", this.svgWidth)
                .attr("height", this.svgHeight)
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr('transform', 'translate(' + 0 + ',' + (-this.svgPadding.bottom - this.svgPadding.top) + ')')
                .call(zoom);

            if (!this.currentTransform) {
                this.currentTransform = d3.zoomIdentity;
            }
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

            d3.select(this.$refs["lineGroup"]).append("defs").append("lineGroup:clipPath")
                .attr("id", "clip")
                .append("SVG:rect")
                .attr("width", this.svgWidth )
                .attr("height", this.svgHeight - this.svgPadding.bottom - this.svgPadding.top )
                .attr("x", 0)
                .attr("y", 0);

            const clipPath = linesGroup
                .append("g")
                .attr("id", "testClip")
                .attr('clip-path', 'url(#clip)');

            clipPath.selectAll('.line')
                .data([this.slice()])
                .join('path')
                .attr("id", "testLine")
                .attr('class', 'mse-line')
                .attr('d', line)
                .attr("fill", "none");
        },
        updateChart({transform}) {
            const xAxis = d3.select(this.$refs.axisX);
            const yAxis = d3.select(this.$refs.axisY);
            const clipPath =  d3.select(this.$refs["lineGroup"])
            const circle = d3.select(this.$refs["circleGroup"])
            this.currentTransform = transform;
            // Recover the new scale
            let newX = transform.rescaleX(this.xScale);
            let newY = transform.rescaleY(this.yScale);

            // Update axes with these new boundaries
            xAxis.call(d3.axisBottom(newX));
            yAxis.call(d3.axisLeft(newY));

            const newLineGenerator = d3.line()
                .x(d => newX(d[0]))
                .y(d => newY(d[1]));

            // Update line path
            clipPath
                .selectAll("path.mse-line")
                .attr("d", newLineGenerator);

            circle.
                selectAll("circle")
                .attr('cx', (d) => newX(d[0]))
                .attr('cy', (d) => newY(d[1]))

            this.zoomLevel = transform.k
        },
        drawCircle() {
            const circleGroup = d3.select(this.$refs["circleGroup"]);
            circleGroup.selectAll('.circle').remove();

            let drag = d3.drag()
                .on('drag', this.dragged);

            d3.select(this.$refs["circleGroup"]).append("defs").append("circleGroup:clipPath")
                .attr("id", "clip")
                .append("SVG:rect")
                .attr("width", this.svgWidth )
                .attr("height", this.svgHeight - this.svgPadding.bottom - this.svgPadding.top )
                .attr("x", 0)
                .attr("y", 0);

            const clipPath = circleGroup
                .append("g")
                .attr("id", "testClip")
                .attr('clip-path', 'url(#clip)');

            clipPath.selectAll('.circle')
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
        dragged(event, d) {
            let newX = this.currentTransform.rescaleX(this.xScale);

            this.$store.commit('changeWeightInNetwork', {layerIndex: this.layerIndex,
                neuronIndex: this.neuronIndex,
                weightIndex: this.weightIndex,
                weight: newX.invert(event.x)});
            d3.select(this).attr("cx", d.x = event.x).attr("cy", d.y = event.y);

        },
        changeTrajectory() {
            this.$store.commit('changeIndex', [this.layerIndex, this.neuronIndex, this.weightIndex]);
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
                if (this.currentTransform) {
                    this.updateChart({ transform: this.currentTransform });
                }
            },
            deep: true,
        },
        selectedWeights: {
            handler() {
                this.drawLine()
                this.drawCircle()
                this.initZoom();
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