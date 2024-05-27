<template>
    <div>
        <!--<p>{{ der.toFixed(4) }}</p>-->
        <svg class="main-svg" ref="svg">
            <g class="color-box" ref="colorBox"></g>
        </svg>
    </div>
</template>
<script>
//import * as d3 from "d3";

import * as d3 from "d3";

export default {
    name: 'GradientHeatmap',
    components: {},
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
        },
        isActiveProp: {
            type: Boolean,
            required: true
        },
    },
    data() {
        console.log()
        return {
            der: 0,
            color: "#000000",
            isActive: this.isActiveProp,
        }
    },
    mounted() {
        this.computeDer()
        this.chooseColor()
        this.drawBox()
    },
    methods: {
        drawBox() {
            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            d3.select(this.$refs["colorBox"]).append("rect")
                .attr("class", this.isActive ? "rectangle-active" : "rectangle")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", this.$refs["svg"].clientWidth)
                .attr("height", this.$refs["svg"].clientHeight)
                .attr("fill", this.color)
                .on('mouseover', (event) => this.handleMouseOver(tooltip, event))
                .on('mousemove', (event) => this.handleMouseMove(tooltip, event))
                .on('mouseout', () => this.handleMouseOut(tooltip))
                .on("click", () => this.selectWeight())
        },
        computeDer() {
            this.der = this.network[this.layerIndex][this.neuronIndex].getInputLinks()[this.weightIndex].getAccErrorDer()
        },
        chooseColor() {
            console.log(this.colors.blue[this.color.length - 1])
            if (this.der < -10) {
                this.color = this.colors.blue[this.colors.blue.length - 1];
                return
            }
            if (this.der > 10) {
                this.color = this.colors.red[this.colors.red.length - 1];
                return
            }
            if (this.der < 0.1 && this.der > -0.1) {
                this.color = this.colors.white;
                return
            }

            const index = Math.floor(Math.abs(this.der));
            if (this.der < 0) {
                this.color = this.colors.blue[index];
            } else {
                this.color = this.colors.red[index];
            }
        },
        changeTrajectory() {
            this.$store.commit('changeIndex', [this.layerIndex, this.neuronIndex, this.weightIndex]);
        },
        handleMouseOver(tooltip, event) {
            tooltip.transition()
                .style("opacity", 0.9);
            tooltip.html("<span>L" + this.layerIndex +
                "<span> - N" + this.neuronIndex +
                "<span> - W" + this.weightIndex + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
            this.changeTrajectory()
        },
        handleMouseMove(tooltip, event) {
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
        },
        handleMouseOut(tooltip) {
            this.changeTrajectory()
            tooltip.transition()
                .style("opacity", 0);
        },
        selectWeight() {
            if (this.selectedWeights.length < 5 || this.isActive) {
                this.isActive = !this.isActive
                d3.select(this.$refs["colorBox"]).select("rect").attr("class", this.isActive ? "rectangle-active" : "rectangle")
                this.$store.commit('selectWeight', [this.layerIndex, this.neuronIndex, this.weightIndex]);
            }
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
        colors: {
            get: function() {
                return this.$store.getters.colors
            }
        },
        selectedWeights: {
            get: function() {
                return this.$store.getters.selectedWeights
            }
        },
    }
}
</script>
<style>
.rectangle  {
    stroke: black;
    stroke-width: 1px;
}
.rectangle-active  {
    stroke: black;
    stroke-width: 7px;
}
.main-svg {
    width: 100%;
    height: 100%;
}
.tooltip {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 8px;
    font-size: 12px;
    pointer-events: none;
}
.tooltip-text-bold{
    display: block;
    text-align: center;
    font-weight: 700;
}
</style>