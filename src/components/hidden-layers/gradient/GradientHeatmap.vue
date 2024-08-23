<template>
    <div>
        <!--<p>{{ der.toFixed(4) }}</p>-->
        <svg class="main-svg" ref="svg">
            <g class="color-box" ref="colorBox"></g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";
import {getInputWeight} from "@/neural-network/nn";

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
        highlightedNeuron: {
            type: String,
            required: false
        },
        highlightedNeuronPerm: {
            type: String,
            required: false
        },
        isWeight: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            der: 0,
            color: "#000000",
            isActive: this.isActiveProp
        }
    },
    mounted() {
        if (this.isWeight)
            this.chooseColor(this.weight, 4, 0.1)
        else {
            this.computeDer()
            this.chooseColor(this.der, 10, 0.1)
        }
        this.drawBox()
    },
    methods: {
        drawBox() {
            d3.select(this.$refs["colorBox"]).selectAll("rect").remove()
            d3.select("body").select("div.tooltip").remove();

            d3.select(this.$refs["colorBox"]).append("rect")
                .attr("class", this.isHighlighted(this.network[this.layerIndex][this.neuronIndex].getInputLinks()[this.weightIndex]) || this.isActive ? "rectangle-active" : "rectangle")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", this.$refs["svg"].clientWidth)
                .attr("height", this.$refs["svg"].clientHeight)
                .attr("fill", this.color)
                .on("click", () => this.selectWeight())
                .on('mouseover', () => this.handleMouseOver())
                .on('mouseout', () => this.handleMouseOut())

        },
        computeDer() {
            this.der = this.network[this.layerIndex][this.neuronIndex].getInputLinks()[this.weightIndex].getAccErrorDer()
        },
        chooseColor(value, limit, zeroRange) {
            if (value < -limit) {
                this.color = this.colors.blue[this.colors.blue.length - 1];
                return
            }
            if (value > limit) {
                this.color = this.colors.red[this.colors.red.length - 1];
                return
            }
            if (value < zeroRange && value > -zeroRange) {
                this.color = this.colors.white;
                return
            }

            console.log(this.colors.red.length)
            const index = Math.floor(Math.abs(value / limit * this.colors.red.length));
            if (value < 0) {
                this.color = this.colors.blue[index];
            } else {
                this.color = this.colors.red[index];
            }
        },
        changeTrajectory() {
            this.$store.commit('changeIndex', [this.layerIndex, this.neuronIndex, this.weightIndex]);
        },
        handleMouseOver() {
            this.changeTrajectory()
        },
        handleMouseOut() {
            this.changeTrajectory()
        },
        selectWeight() {
            this.isActive = !this.isActive
            d3.select(this.$refs["colorBox"]).select("rect").attr("class", this.isActive ? "rectangle-active" : "rectangle");
            this.$store.commit('selectWeight', [this.layerIndex, this.neuronIndex, this.weightIndex]);
        },
        drawWeight() {
            const weightsJSON = JSON.stringify(this.selectedWeights)
            const weightJSON = JSON.stringify([this.layerIndex , this.neuronIndex, this.weightIndex])
            this.isActive = weightsJSON.indexOf(weightJSON) !== -1
            d3.select(this.$refs["colorBox"]).select("rect").attr("class", this.isHighlighted(this.network[this.layerIndex][this.neuronIndex].getInputLinks()[this.weightIndex]) || this.isActive ? "rectangle-active" : "rectangle");
        },
        isHighlighted(weight) {
            const weightIds = weight.id.split('-')
            if (!this.highlightedNeuronPerm)
                return this.highlightedNeuron && (this.highlightedNeuron === weightIds[0] || this.highlightedNeuron === weightIds[1])
            else
                return this.highlightedNeuronPerm && (this.highlightedNeuronPerm === weightIds[0] || this.highlightedNeuronPerm === weightIds[1])
        }
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
        networkShape: {
            get: function() {
                return this.$store.getters.networkShape.slice(1)
            }
        },
        weights: {
            get: function() {
                return this.$store.getters.weights
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
        weight: {
            get: function() {
                return getInputWeight(this.network[this.layerIndex][this.neuronIndex], this.weightIndex)
            }
        },
    },
    watch: {
        networkShape: {
            handler() {
                if (this.isWeight)
                    this.chooseColor(this.weight, 4, 0.1)
                else {
                    this.computeDer()
                    this.chooseColor(this.der, 10, 0.1)
                }
                this.drawBox()
            },
            deep: true,
        },
        weights: {
            handler() {
                if (this.isWeight)
                    this.chooseColor(this.weight, 4, 0.1)
                else {
                    this.computeDer()
                    this.chooseColor(this.der, 10, 0.1)
                }
                this.drawBox()
            },
            deep: true,
        },
        highlightedNeuron : {
            handler() {
               this.drawBox()
            }
        },
        highlightedNeuronPerm : {
            handler() {
                this.drawBox()
            }
        },
        selectedWeights : {
            handler() {
                this.drawWeight()
            }
        },
        isWeight : {
            handler() {
                if (this.isWeight)
                    this.chooseColor(this.weight, 4, 0.1)
                else {
                    this.computeDer()
                    this.chooseColor(this.der, 10, 0.1)
                }
                this.drawBox()
            }
        }
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