/* Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/


let Node = {
  id: -1,
  output: 0,
  activation: null,
  inputLinks: [],
  outputLinks: [],
  totalInput: 0,

  create: function (id, activation) {
    let node = Object.create(this)
    node.id =id
    node.activation = activation
    node.inputLinks = []
    node.outputLinks = []
    node.totalInput = 0
    return node
  },
  updateOutput: function () {
    // Stores total input into the node.
    let totalInput = 0;
    for (let j = 0; j < this.inputLinks.length; j++) {
      let link = this.inputLinks[j];
      totalInput += link.weight * link.source.output;
    }
    this.output = this.activation.output(totalInput);
    return this.output;
  },
  updateOutputSlices: function (weightIndex, weight) {
    // Stores total input into the node.
    let totalInput = 0;
    for (let j = 0; j < this.inputLinks.length; j++) {
      let link = this.inputLinks[j];
      if (j !== weightIndex) {
        totalInput += link.weight * link.source.output;
      }
      else {
        totalInput += weight * link.source.output;
      }
    }
    this.output = this.activation.output(totalInput);
    return this.output;
  },
  getInputLinks: function() {
    return this.inputLinks
  }
}

export const Activations = {
  SIGMOID: {
    output: x => 1 / (1 + Math.exp(-x))
  },
  LINEAR: {
    output: x => x
  }
}

let Link = {
  id: -1,
  source: null,
  dest: null,
  weight: 0,

  create: function (source, dest) {
    let link = Object.create(this)
    link.id = source.id + "-" + dest.id;
    link.source = source;
    link.dest = dest;
    link.weight = Math.random() * 4 - 2;
    return link;
  },
  changeWeight: function (weight) {
    this.weight = weight
  },
  getWeight: function () {
    return this.weight;
  }
}

export function buildNetwork(networkShape, activation, outputActivation) {
  let numLayers = networkShape.length;
  let id = 1;
  let network = [];
  for (let layerIdx = 0; layerIdx < numLayers; layerIdx++) {
    let isOutputLayer = layerIdx === numLayers - 1;
    let currentLayer = [];
    network.push(currentLayer);
    let numNodes = networkShape[layerIdx];
    for (let i = 0; i < numNodes; i++) {
      let nodeId = id.toString();
      id++;
      let node = Node.create(nodeId, isOutputLayer ? outputActivation : activation);
      currentLayer.push(node);
      if (layerIdx >= 1) {
        for (let j = 0; j < network[layerIdx - 1].length; j++) {
          let prevNode = network[layerIdx - 1][j];
          let link = Link.create(prevNode, node);
          prevNode.outputLinks.push(link);
          node.inputLinks.push(link);
        }
      }
    }
  }
  console.log(network)
  return network;
}

export function forwardProp(network, inputs) {
  let inputLayer = network[0];
  if (inputs.length !== inputLayer.length) {
    throw new Error("The number of inputs must match the number of nodes in" +
        " the input layer");
  }
  // Update the input layer.
  for (let i = 0; i < inputLayer.length; i++) {
    let node = inputLayer[i];
    node.output = inputs[i];
  }
  for (let layerIdx = 1; layerIdx < network.length; layerIdx++) {
    let currentLayer = network[layerIdx];
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
        node.updateOutput();
    }
  }
  return network[network.length - 1][0].output;
}

export function forwardPropSlices(network, inputs, layerIndex, neuronIndex, weightIndex, weight) {
  let inputLayer = network[0];
  if (inputs.length !== inputLayer.length) {
    throw new Error("The number of inputs must match the number of nodes in" +
        " the input layer");
  }
  // Update the input layer.
  for (let i = 0; i < inputLayer.length; i++) {
    let node = inputLayer[i];
    node.output = inputs[i];
  }
  for (let layerIdx = 1; layerIdx < network.length; layerIdx++) {
    let currentLayer = network[layerIdx];
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
        if (layerIdx !== layerIndex && i !== neuronIndex) {
          node.updateOutput()
        } else {
          node.updateOutputSlices(weightIndex, weight);
        }
      }
    }
  return network[network.length - 1][0].output;
}

export function getInputWeight(node, weightIndex) {
  return node.inputLinks[weightIndex].getWeight()
}

export function changeInputWeight(node, weightIndex, newWeight) {
  return node.inputLinks[weightIndex].changeWeight(newWeight)
}

export function getOutputNode(network) {
  return network[network.length - 1][0];
}