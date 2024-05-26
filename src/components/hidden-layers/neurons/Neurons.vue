<template>
  <div>
    <svg class="main-svg" ref="svg">
      <g class="neuron-circle" ref="neuronCircle"></g>
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
  data() {
  },
  mounted() {
    this.drawCircle()
  },
  methods: {
    drawCircle() {
      d3.select(this.$refs["neuronCircle"]).selectAll('.circle').remove()
      d3.select(this.$refs["neuronCircle"]).selectAll('.circle')
          .data(d3.range(0, this.numberNeurons, 1))
          .join("circle")
          .attr("class", "circle")
          .attr("cx", this.$refs["svg"].clientWidth/2)
          .attr("cy", (d,i) => (1+i) * 50)
          .attr("r", this.$refs["svg"].clientWidth/2)
          .attr("fill", "#000000")
    },
  },
  computed: {}
}
</script>
<style>
.circle  {
  stroke: black;
  stroke-width: 1px;
}
.main-svg {
  width: 100%;
  height: 100%;
}
</style>