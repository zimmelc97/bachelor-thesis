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
  outputDer: 0,
  inputDer: 0,

  create: function (id, activation) {
    let node = Object.create(this)
    node.id =id
    node.activation = activation
    node.inputLinks = []
    node.outputLinks = []
    node.totalInput = 0
    node.output = 0
    node.outputDer = 0
    node.inputDer = 0
    return node
  },
  updateOutput: function () {
    // Stores total input into the node.
    this.totalInput = 0;
    for (let j = 0; j < this.inputLinks.length; j++) {
      let link = this.inputLinks[j];
      this.totalInput += link.weight * link.source.output;
    }
    this.output = this.activation.output(this.totalInput);
    return this.output;
  },
  updateOutputSlices: function (weightIndex, weight) {
    // Stores total input into the node.
    this.totalInput = 0;
    for (let j = 0; j < this.inputLinks.length; j++) {
      let link = this.inputLinks[j];
      if (j !== weightIndex) {
        this.totalInput += link.weight * link.source.output;
      }
      else {
        this.totalInput += weight * link.source.output;
      }
    }
    this.output = this.activation.output(this.totalInput);
    return this.output;
  },
  getInputLinks: function() {
    return this.inputLinks
  }
}

export const Activations = {
  SIGMOID: {
    output: x => 1 / (1 + Math.exp(-x)),
    der: x => {
      let output = Activations.SIGMOID.output(x);
      return output * (1 - output);
    }
  },
  RELU: {
    output: x => Math.max(0, x),
    der: x => x <= 0 ? 0 : 1
  },
  LINEAR: {
    output: x => x,
    der: x => x/x
  }
}
export const Errors = {
  SQUARE: {
    error: (output, target) => 0.5 * Math.pow(output - target, 2),
    der: (output, target) => output - target
  }
}

let Link = {
  id: -1,
  source: null,
  dest: null,
  weight: 0,
  errorDer: 0,
  accErrorDer: 0,

  create: function (source, dest) {
    let link = Object.create(this)
    link.id = source.id + "-" + dest.id;
    link.source = source;
    link.dest = dest;
    link.weight = Math.random() * 4 - 2;
    link.errorDer = 0;
    link.accErrorDer = 0;
    return link;
  },
  changeWeight: function (weight) {
    this.weight = weight
  },
  getWeight: function () {
    return this.weight;
  },
  getAccErrorDer: function () {
    return this.accErrorDer
  },
  getErrorDer: function () {
    return this.errorDer
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
        if (layerIdx !== layerIndex || i !== neuronIndex) {
          node.updateOutput()
        } else {
          node.updateOutputSlices(weightIndex, weight);
        }
      }
    }
  return network[network.length - 1][0].output;
}

export function computeDer (network, target, errorFunc) {
  let outputNode = network[network.length - 1][0];
  outputNode.outputDer = errorFunc.der(outputNode.output, target);

  for (let layerIdx = network.length - 1; layerIdx >= 1; layerIdx--) {
    let currentLayer = network[layerIdx];
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
      node.inputDer = node.outputDer * node.activation.der(node.totalInput);
    }
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
      for (let j = 0; j < node.inputLinks.length; j++) {
        let link = node.inputLinks[j];
        link.errorDer = node.inputDer * link.source.output;
        link.accErrorDer += link.errorDer
      }
    }
    if (layerIdx === 1) {
      continue;
    }
    let prevLayer = network[layerIdx - 1];
    for (let i = 0; i < prevLayer.length; i++) {
      let node = prevLayer[i];
      node.outputDer = 0;
      for (let j = 0; j < node.outputLinks.length; j++) {
        let output = node.outputLinks[j];
        node.outputDer += output.weight * output.dest.inputDer;
      }
    }
  }
}

export function setAccErrDerToZero(network) {
  for (let layerIdx = network.length - 1; layerIdx >= 1; layerIdx--) {
    let currentLayer = network[layerIdx];
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
      for (let j = 0; j < node.inputLinks.length; j++) {
        let link = node.inputLinks[j];
        link.accErrorDer = 0
      }
    }
  }
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

/*
export function backProp(network, target, errorFunc) {
  // The output node is a special case. We use the user-defined error
  // function for the derivative.
  let outputNode = network[network.length - 1][0];
  outputNode.outputDer = errorFunc.der(outputNode.output, target);

  // Go through the layers backwards.
  for (let layerIdx = network.length - 1; layerIdx >= 1; layerIdx--) {
    let currentLayer = network[layerIdx];
    // Compute the error derivative of each node with respect to:
    // 1) its total input
    // 2) each of its input weights.
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
      node.inputDer = node.outputDer * node.activation.der(node.totalInput);
      node.accInputDer += node.inputDer;
      node.numAccumulatedDers++;
    }

    // Error derivative with respect to each weight coming into the node.
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
      for (let j = 0; j < node.inputLinks.length; j++) {
        let link = node.inputLinks[j];
        if (link.isDead) {
          continue;
        }
        link.errorDer = node.inputDer * link.source.output;
        link.accErrorDer += link.errorDer;
        link.numAccumulatedDers++;
      }
    }
    if (layerIdx === 1) {
      continue;
    }
    let prevLayer = network[layerIdx - 1];
    for (let i = 0; i < prevLayer.length; i++) {
      let node = prevLayer[i];
      // Compute the error derivative with respect to each node's output.
      node.outputDer = 0;
      for (let j = 0; j < node.outputs.length; j++) {
        let output = node.outputs[j];
        node.outputDer += output.weight * output.dest.inputDer;
      }
    }
  }
}
*/
/**
 * Updates the weights of the network using the previously accumulated error
 * derivatives.
 */
/*
export function updateWeights(network, learningRate, regularizationRate) {
  for (let layerIdx = 1; layerIdx < network.length; layerIdx++) {
    let currentLayer = network[layerIdx];
    for (let i = 0; i < currentLayer.length; i++) {
      let node = currentLayer[i];
      // Update the node's bias.
      if (node.numAccumulatedDers > 0) {
        node.bias -= learningRate * node.accInputDer / node.numAccumulatedDers;
        node.accInputDer = 0;
        node.numAccumulatedDers = 0;
      }
      // Update the weights coming into this node.
      for (let j = 0; j < node.inputLinks.length; j++) {
        let link = node.inputLinks[j];
        if (link.isDead) {
          continue;
        }
        let regulDer = link.regularization ?
            link.regularization.der(link.weight) : 0;
        if (link.numAccumulatedDers > 0) {
          // Update the weight based on dE/dw.
          link.weight = link.weight -
              (learningRate / link.numAccumulatedDers) * link.accErrorDer;
          // Further update the weight based on regularization.
          let newLinkWeight = link.weight -
              (learningRate * regularizationRate) * regulDer;
          if (link.regularization === RegularizationFunction.L1 &&
              link.weight * newLinkWeight < 0) {
            // The weight crossed 0 due to the regularization term. Set it to 0.
            link.weight = 0;
            link.isDead = true;
          } else {
            link.weight = newLinkWeight;
          }
          link.accErrorDer = 0;
          link.numAccumulatedDers = 0;
        }
      }
    }
  }
}
*/