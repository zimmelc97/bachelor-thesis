import Vue from 'vue';
import Vuex from 'vuex';
import {buildNetwork, Activations, changeInputWeight, buildLoadedNetwork} from '@/neural-network/nn.js';
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
            red: ["#F1DBDB","#ECC3C3","#E7AAAA","#E29292","#DD7A7A","#D86161","#D34949","#CE3131","#C91818","#C40000"]},
        drawLineChart: false
    },
    mutations: {
        changeWeightInNetwork (state, {layerIndex, neuronIndex, weightIndex, weight}) {
            changeInputWeight(state.network[layerIndex][neuronIndex], weightIndex, weight)
            this.commit("setWeights")
        },
        changeIndex (state, index) {
            if (state.index[0] === index[0] && state.index[1] === index[1] && state.index[2] === index[2]) {
                state.index = []
            }
            else {
                state.index = index;
            }
        },
        changeInput (state, functionName) {
            state.inputData = []
            switch(functionName) {
                case "sin":
                    for(let i=0; i<30+1; i++) {
                        let random = -1.5 + (3/(30)) * i
                        state.inputData.push({x: random, label: Math.sin(random)})
                    }
                    break;
                case "cos":
                    for(let i=0; i<30+1; i++) {
                        let random = -1.5 + (3/(30)) * i
                        state.inputData.push({x: random, label: Math.cos(random)})
                    }
                    break;
                case "exp":
                    for(let i=0; i<30+1; i++) {
                        let random = -1.5 + (3/(30)) * i
                        state.inputData.push({x: random, label: Math.exp(random)})
                    }
                    break;
                case "squared":
                    for(let i=0; i<30+1; i++) {
                        let random = -1.5 + (3/(30)) * i
                        state.inputData.push({x: random, label: Math.pow((random), 2)})
                    }
                    break;
                case "cubic":
                    for(let i=0; i<30+1; i++) {
                        let random = -1.5 + (3/(30)) * i
                        state.inputData.push({x: random, label: Math.pow((random), 3)})
                    }
                    break;
                case "linear":
                    for(let i=0; i<30+1; i++) {
                        let random = -1.5 + (3/(30)) * i
                        state.inputData.push({x: random, label: random})
                    }
                    break;
                default:
                    for(let i=0; i<50; i++) {
                        let random = Math.random() * 3 - 1.5
                        state.inputData.push({x: random, label: Math.sin(random)})
                    }
            }
            state.network = buildNetwork(state.networkShape, Activations.SIGMOID, Activations.LINEAR)
            this.commit("setWeights")
            state.selectedWeights = []
        },
        changeMSE (state, MSE) {
            state.MSE = MSE;
        },
        async changeNetworkShape (state, networkShape) {
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
        loadNetwork(state, network) {
            state.network = buildLoadedNetwork(network)
            this.commit("setWeights")
        },
        selectWeight (state, index) {
            const weightsJSON = JSON.stringify(state.selectedWeights)
            const weightJSON = JSON.stringify(index)
            if (weightsJSON.indexOf(weightJSON) === -1) {
                state.selectedWeights = []
                state.selectedWeights.push(index);
            }
            else {
                state.selectedWeights = []
            }
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
        },
        setDrawLineChart(state) {
            state.drawLineChart = !state.drawLineChart
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
        },
        drawLineChart (state) {
            return state.drawLineChart
        }
    },
    actions: {
        loadData({state}) {
            for(let i=0; i<30+1; i++) {
                let random = -1.5 + (3/(30)) * i
                state.inputData.push({x: random, label: Math.sin(random)})
            }
            state.network = buildNetwork(state.networkShape, Activations.SIGMOID, Activations.LINEAR)
            this.commit("setWeights")
        },
    },
})

export default store;
