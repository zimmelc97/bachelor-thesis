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
    numberNeurons: {
      type: Number,
      required: true
    }
  },
  mounted() {
    this.drawCircle()
  },
  methods: {
    drawCircle() {
      d3.select(this.$refs["neuronCircle"]).selectAll('.circle-neuron')
          .data(d3.range(0, this.numberNeurons, 1))
          .join("circle")
          .attr("class", "circle-neuron")
          .attr("cx", this.$refs["svg"].clientWidth/2)
          .attr("cy", (d,i) => (this.numberNeurons * 2 * 10 > this.$refs["svg"].clientHeight) ? (i+0.5) * this.$refs["svg"].clientHeight/(this.numberNeurons) : (i+0.5) * this.$refs["svg"].clientHeight/(this.numberNeurons))
          .attr("r", (this.numberNeurons * 2 * 10 > this.$refs["svg"].clientHeight) ? this.$refs["svg"].clientHeight/(this.numberNeurons * 2) : 10)
          .attr("fill", "#000000")
    },
  },
  computed: {},
  watch: {
      numberNeurons: {
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
.main-svg-neurons {
  width: 100%;
  height: 100%;
}
</style>