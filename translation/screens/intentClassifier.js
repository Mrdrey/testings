import * as tf from '@tensorflow/tfjs';

class IntentClassifier {
  constructor() {
    this.model = null;
    this.vocab = {};
    this.labels = [];
    this.maxLength = 15; // Maximum sequence length
  }

  // Preprocess text into numerical representation
  textToSequence(text) {
    // Convert to lowercase and remove punctuation
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
    const words = cleanText.split(/\s+/);
    
    // Map words to their vocabulary indices
    const sequence = words.map(word => this.vocab[word] || 0);
    
    // Pad or truncate sequence to fixed length
    if (sequence.length > this.maxLength) {
      return sequence.slice(0, this.maxLength);
    }
    while (sequence.length < this.maxLength) {
      sequence.push(0);
    }
    return sequence;
  }

  // Create training dataset
  createTrainingDataset() {
    return [
      // Greeting intents
      { text: 'hello', intent: 'greeting' },
      { text: 'hi there', intent: 'greeting' },
      { text: 'hey', intent: 'greeting' },
      { text: 'good morning', intent: 'greeting' },

      // Help intents
      { text: 'help me', intent: 'help' },
      { text: 'what can you do', intent: 'help' },
      { text: 'show commands', intent: 'help' },
      { text: 'list features', intent: 'help' },

      // Translation intents
      { text: 'translate apple to french', intent: 'translate' },
      { text: 'how do you say hello in spanish', intent: 'translate' },
      { text: 'translate good morning to german', intent: 'translate' },

      // Language support intents
      { text: 'what languages do you support', intent: 'language_support' },
      { text: 'show available languages', intent: 'language_support' },
      { text: 'list supported languages', intent: 'language_support' },

      // Goodbye intents
      { text: 'bye', intent: 'goodbye' },
      { text: 'see you later', intent: 'goodbye' },
      { text: 'goodbye', intent: 'goodbye' },
      { text: 'take care', intent: 'goodbye' }
    ];
  }

  // Train the neural network model
  async train() {
    const trainingData = this.createTrainingDataset();
    
    // Create vocabulary
    const allWords = trainingData.flatMap(item => 
      item.text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    );
    
    // Create unique vocabulary
    const uniqueWords = [...new Set(allWords)];
    this.vocab = Object.fromEntries(
      uniqueWords.map((word, index) => [word, index + 1])
    );

    // Prepare labels
    this.labels = [...new Set(trainingData.map(item => item.intent))];

    // Prepare training data
    const xs = trainingData.map(item => 
      this.textToSequence(item.text)
    );
    const ys = trainingData.map(item => 
      this.labels.indexOf(item.intent)
    );

    // Create neural network model
    this.model = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: Object.keys(this.vocab).length + 1,
          outputDim: 16,
          inputLength: this.maxLength
        }),
        tf.layers.globalAveragePooling1d({}),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ 
          units: this.labels.length, 
          activation: 'softmax' 
        })
      ]
    });

    // Compile the model
    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Convert to tensors
    const xTensor = tf.tensor2d(xs, [xs.length, this.maxLength]);
    const yTensor = tf.oneHot(ys, this.labels.length);

    // Train the model
    await this.model.fit(xTensor, yTensor, {
      epochs: 100,
      batchSize: 8,
      verbose: 0  // Set to 1 for training progress
    });

    console.log('Intent Classifier trained successfully');
    return this;
  }

  // Predict intent with confidence
  predict(text, confidenceThreshold = 0.5) {
    if (!this.model) {
      throw new Error('Model not trained. Call train() first.');
    }

    const sequence = this.textToSequence(text);
    const tensor = tf.tensor2d([sequence], [1, this.maxLength]);
    
    // Get prediction probabilities
    const prediction = this.model.predict(tensor);
    const probabilities = prediction.dataSync();
    
    // Find the index of the highest probability
    const classIndex = prediction.argMax(-1).dataSync()[0];
    const confidence = probabilities[classIndex];
    
    // Return intent or null based on confidence
    return confidence >= confidenceThreshold 
      ? { 
          intent: this.labels[classIndex], 
          confidence: confidence 
        } 
      : null;
  }

  // Get all supported intents
  getSupportedIntents() {
    return this.labels;
  }
}

export default IntentClassifier;