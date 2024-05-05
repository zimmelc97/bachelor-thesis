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


class Node {
  constructor(id, activation) {
    this.id = id;
    this.output = 0;
    this.activation = activation;
    this.inputLinks = [];
    this.outputLinks = [];
  }

  updateOutput() {
    // Stores total input into the node.
    this.totalInput = 0;
    for (let j = 0; j < this.inputLinks.length; j++) {
      let link = this.inputLinks[j];
      this.totalInput += link.weight * link.source.output;
    }
    this.output = this.activation.output(this.totalInput);
    return this.output;
  }
}

export const Activations = {
  SIGMOID: {
    output: x => 1 / (1 + Math.exp(-x))
  }
}

class Link {
  constructor(source, dest) {
    this.id = source.id + "-" + dest.id;
    this.source = source;
    this.dest = dest;
    this.weight = Math.random() - 0.5;
  }

  getWeight() {
    return this.weight;
  }
}

export function buildNetwork(networkShape, activation, inputIds) {
  let numLayers = networkShape.length;
  let id = 1;
  let network = [];
  for (let layerIdx = 0; layerIdx < numLayers; layerIdx++) {
    let isInputLayer = layerIdx === 0;
    let currentLayer = [];
    network.push(currentLayer);
    let numNodes = networkShape[layerIdx];
    for (let i = 0; i < numNodes; i++) {
      let nodeId = id.toString();
      if (isInputLayer) {
        nodeId = inputIds[i];
      } else {
        id++;
      }
      let node = new Node(nodeId, activation);
      currentLayer.push(node);
      if (layerIdx >= 1) {
        for (let j = 0; j < network[layerIdx - 1].length; j++) {
          let prevNode = network[layerIdx - 1][j];
          let link = new Link(prevNode, node);
          prevNode.outputLinks.push(link);
          node.inputLinks.push(link);
        }
      }
    }
  }
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

export function getOutputNode(network) {
  return network[network.length - 1][0];
}