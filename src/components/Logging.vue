<template>
    <div>
        <button @click="saveDataToFile">Download File</button>
    </div>
</template>
<script>

export default {
    name: 'LoggingButton',
    components: {},
    props: {},
    data() {
        return {
            appendedData: []
        }
    },
    mounted() {
    },
    methods: {
        appendData(mse, weights) {
            this.appendedData.push({
                MSE: mse,
                weights: weights,
            });
        },
        saveDataToFile() {
            const dataStr = JSON.stringify(this.appendedData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            let timestamp = new Date().toISOString()
            link.download = timestamp + '.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.appendedData = []
        }
    },
    computed: {
        network: {
            get: function() {
                return this.$store.getters.network
            }
        },
        MSE: {
            get: function() {
                return this.$store.getters.MSE
            }
        },
        weights: {
            get: function() {
                let weights = []
                for (let layerIdx = 1; layerIdx < this.network.length; layerIdx++) {
                    let currentLayer = this.network[layerIdx];
                    for (let i = 0; i < currentLayer.length; i++) {
                        let node = currentLayer[i];
                        for (let j = 0; j < node.getInputLinks().length; j++) {
                            let link = node.getInputLinks()[j];
                            weights.push({layerIndex: layerIdx, neuronIndex: i, weightIndex: j, weight: link.getWeight()})
                        }
                    }
                }
                return weights
            }
        },
    },
    watch: {
        weights: {
            handler() {
                this.appendData(this.MSE, this.weights)
            },
            deep: true,
        },
    }
}
</script>
<style>

</style>