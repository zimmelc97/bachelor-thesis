<template>
  <div>
    <svg class="main-svg-neurons" ref="svg">
      <g class="circle-neuron" ref="neuronCircle"></g>
    </svg>
  </div>
</template>
<script>
import * as d3 from "d3";

export default {
  name: 'Neurons',
  components: {},
  props: {
    layerIndex: {
        type: Number,
        required: true
    },
    numberNeurons: {
      type: Number,
      required: true
    },
    highlightedNeuron: {
        type: String || null,
        required: false
    }
  },
  mounted() {
      this.drawCircle()
  },
  methods: {
    drawCircle() {
        d3.select(this.$refs["neuronCircle"]).selectAll('circle').remove()
      d3.select(this.$refs["neuronCircle"]).selectAll('.circle-neuron')
          .data(this.network[this.layerIndex])
          .join("circle")
          .attr("class", (d) => {
              if (this.highlightedNeuron)
                  return this.highlightedNeuron === d.id ? "circle-neuron-active" : "circle-neuron"
              else
                  return "circle-neuron"
          })
          .attr("cx", this.$refs["svg"].clientWidth/2)
          .attr("cy", (d,i) => (this.numberNeurons * 2 * 10 > this.$refs["svg"].clientHeight) ? (i+0.5) * this.$refs["svg"].clientHeight/(this.numberNeurons) : (i+0.5) * this.$refs["svg"].clientHeight/(this.numberNeurons))
          .attr("r", (this.numberNeurons * 2 * 10 > this.$refs["svg"].clientHeight) ? this.$refs["svg"].clientHeight/(this.numberNeurons * 2) : 10)
          .on("mouseover",  (e,d) => {
              this.hoverNeuron(d.id)
          })
          .on("mouseout",  () => this.hoverNeuron(null))
          .on("click", (e,d) => {
                  this.clickNeuron(d.id)})
    },
    hoverNeuron(neuron) {
        this.$emit('hover', neuron);
    },
    clickNeuron(neuron) {
      this.$emit('click', neuron);
    }
  },
  computed: {
      network: {
          get: function() {
              return this.$store.getters.network
          }
      },
  },
  watch: {
      numberNeurons: {
          handler() {
              this.drawCircle()
          },
          deep: true,
      },
      highlightedNeuron: {
          handler() {
              this.drawCircle()
          },
          deep: true,
      },
  }
}
</script>
<style>
.circle-neuron  {
    fill: #c9c6bf;
    stroke: #000000;
    stroke-width: 1;
}
.circle-neuron-active  {
    fill: #c9c6bf;
    stroke: #000000;
    stroke-width: 4;
}
.main-svg-neurons {
  width: 100%;
  height: 100%;
}
</style>