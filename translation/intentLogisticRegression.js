const tf = require('@tensorflow/tfjs');
const natural = require('natural');

// Initialize the tokenizer
const tokenizer = new natural.WordTokenizer();

// Example dataset (user input and corresponding intents)
const data = [
  { text: "translate hello to French", intent: "translate" },
  { text: "how do you say 'good morning' in Spanish?", intent: "translate" },
  { text: "help", intent: "help" },
  { text: "I want to report an issue", intent: "feedback" },
];

// Step 1: Preprocess text
const preprocessText = (text) => {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return tokens;
};

// Step 2: Create a vocabulary
const vocabulary = [...new Set(data.flatMap((item) => preprocessText(item.text)))];
const vocabMap = Object.fromEntries(vocabulary.map((word, index) => [word, index]));

// Step 3: Convert text to feature vectors
const textToVector = (text) => {
  const tokens = preprocessText(text);
  const vector = Array(vocabulary.length).fill(0);
  tokens.forEach((token) => {
    if (vocabMap[token] !== undefined) {
      vector[vocabMap[token]] += 1;
    }
  });
  return vector;
};

// Step 4: Prepare training data
const X = data.map((item) => textToVector(item.text));
const y = data.map((item) =>
  item.intent === "translate" ? 0 : item.intent === "help" ? 1 : 2
); // Encoding intents as numbers

const X_tensor = tf.tensor2d(X);
const y_tensor = tf.oneHot(y, 3);

// Step 5: Create Logistic Regression Model
const model = tf.sequential();
model.add(tf.layers.dense({ units: 3, inputShape: [X[0].length], activation: "softmax" }));
model.compile({ optimizer: "adam", loss: "categoricalCrossentropy", metrics: ["accuracy"] });

// Step 6: Train the model
(async () => {
  await model.fit(X_tensor, y_tensor, { epochs: 10 });
  console.log("Model trained!");

  // Example: Predict an intent
  const testInput = "how do you say 'good evening' in German?";
  const testVector = textToVector(testInput);
  const prediction = model.predict(tf.tensor2d([testVector]));
  prediction.print();
})();
