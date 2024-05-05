import Vue from 'vue';
import Vuex from 'vuex';
import { forwardProp, buildNetwork, Activations } from '@/neural-network/nn.js';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        inputData: [],
        weights: [],
        index: [],
        MSE: []
    },
    mutations: {
        changeWeights (state, weights) {
            state.weights = weights;
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
            let network = buildNetwork([1,2,1], Activations.SIGMOID, [1])
            forwardProp(network, [0])
            console.log(network[0][0])
        },
    },
})

export default store;
