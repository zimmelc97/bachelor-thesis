import Vue from 'vue';
import Vuex from 'vuex';
import { buildNetwork, Activations, changeInputWeight } from '@/neural-network/nn.js';
//import * as d3 from "d3";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        inputData: [],
        weights: [],
        selectedWeights: [],
        index: [],
        MSE: [],
        network: [],
        networkShape: [1,5,5,1],
        colors:
            {blue: ["#D1DCFF","#BAC9F8","#A3B5F2","#8BA2EB","#748FE5","#5D7BDE","#4668D8","#2E55D1","#1741CB","#002EC4"],
            white: ["#FFFFFF"],
            red: ["#F1DBDB","#ECC3C3","#E7AAAA","#E29292","#DD7A7A","#D86161","#D34949","#CE3131","#C91818","#C40000"]}
    },
    mutations: {
        changeWeightInNetwork (state, {layerIndex, neuronIndex, weightIndex, weight}) {
            changeInputWeight(state.network[layerIndex][neuronIndex], weightIndex, weight)
            this.commit("setWeights")
        },
        changeWeightsPerIndex (state, weight, index) {
            state.weights[index] = weight;
        },
        changeIndex (state, index) {
            if (state.index[0] === index[0] && state.index[1] === index[1] && state.index[2] === index[2]) {
                state.index = []
            }
            else {
                state.index = index;
            }
        },
        changeMSE (state, MSE) {
            state.MSE = MSE;
        },
        changeNetworkShape (state, networkShape) {
            state.networkShape = []
            state.networkShape.push(1)
            for (let i=0; i<networkShape.length; i++) {
                state.networkShape.push(networkShape[i])
            }
            state.networkShape.push(1)
            state.network = buildNetwork(state.networkShape, Activations.SIGMOID, Activations.LINEAR)
            this.commit("setWeights")
            state.selectedWeights = []
        },
        selectWeight (state, index) {
            state.selectedWeights = []
            state.selectedWeights.push(index);
            /*const weightsJSON = JSON.stringify(state.selectedWeights)
            const weightJSON = JSON.stringify(index)
            if (state.selectedWeights.length < 1 && weightsJSON.indexOf(weightJSON) === -1) {
                state.selectedWeights.push(index);
            }

            if (weightsJSON.indexOf(weightJSON) !== -1) {
                state.selectedWeights = state.selectedWeights.filter(element => {
                    return !(element[0] === index[0] && element[1] === index[1] && element[2] === index[2])
                })
            }

            state.selectedWeights = state.selectedWeights.sort((a, b) => {
                return d3.ascending(a[0], b[0]) || d3.ascending(a[1], b[1]) || d3.ascending(a[2], b[2]);
            });

             */
        },
        setWeights(state) {
            state.weights = []
            for (let layerIdx = 1; layerIdx < state.network.length; layerIdx++) {
                let currentLayer = state.network[layerIdx];
                for (let i = 0; i < currentLayer.length; i++) {
                    let node = currentLayer[i];
                    for (let j = 0; j < node.getInputLinks().length; j++) {
                        let link = node.getInputLinks()[j];
                        state.weights.push(link.getWeight())
                    }
                }
            }
        }
    },
    methods: {

    },
    getters: {
        inputData (state) {
            return state.inputData
        },
        weights (state) {
            return state.weights
        },
        index (state) {
            return state.index
        },
        MSE (state) {
            return state.MSE
        },
        network (state) {
            return state.network
        },
        networkShape (state) {
            return state.networkShape
        },
        colors (state) {
            return state.colors
        },
        selectedWeights (state) {
            return state.selectedWeights
        }
    },
    actions: {
        loadData({state}) {
            for(let i=0; i<50; i++) {
                let random = Math.random() * 3 - 1.5
                state.inputData.push({x: random, label: Math.sin(random)})
            }
            state.network = buildNetwork(state.networkShape, Activations.SIGMOID, Activations.LINEAR)
            this.commit("setWeights")
        },
    },
})

export default store;
