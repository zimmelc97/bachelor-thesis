import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        inputData: [],
        weights: [],
        index: []
    },
    mutations: {
        changeWeights (state, weights) {
            state.weights = weights;
        },
        changeIndex (state, index) {
            state.index = index;
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
        }
    },
    actions: {
        loadData({state}) {
            for(let i=0; i<50; i++) {
                let random = Math.random() * 3 - 1.5
                state.inputData.push({x: random, label: Math.sin(random)})
            }
            for (let i=0; i<4; i++) {
                state.weights.push({id: i, value: Math.random() * 2 - 1});
            }

        },
    },
})

export default store;
