import Vue from 'vue';
import Vuex from 'vuex';
import { buildNetwork, Activations, changeInputWeight } from '@/neural-network/nn.js';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        inputData: [],
        weights: [],
        index: [],
        MSE: [],
        network: [],
        networkShape: [1,2,1]
    },
    mutations: {
        changeWeightInNetwork (state, {layerIndex, neuronIndex, weightIndex, weight}) {
            changeInputWeight(state.network[layerIndex][neuronIndex], weightIndex, weight)
        },
        changeWeightsPerIndex (state, weight, index) {
            state.weights[index] = weight;
        },
        changeIndex (state, index) {
            state.index = index;
        },
        changeMSE (state, MSE) {
            state.MSE = MSE;
        },
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
        }
    },
    actions: {
        loadData({state}) {
            for(let i=0; i<50; i++) {
                let random = Math.random() * 3 - 1.5
                state.inputData.push({x: random, label: Math.sin(random)})
            }
            for (let i=0; i<4; i++) {
                state.weights.push({id: i, value: Math.random() * 4 - 2});
            }
            state.network = buildNetwork(state.networkShape, Activations.SIGMOID, Activations.LINEAR)
        },
    },
})

export default store;
