import { TransactionCategory } from '../types';
import { TRAINING_DATASET, TrainingSample } from './training-dataset';

export interface MLPrediction {
  category: TransactionCategory;
  confidence: number; // 0 to 1
  probabilities: Array<{ category: TransactionCategory; probability: number }>;
  tokens: string[];
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'by', 'for', 'from', 'of', 'in',
  'to', 'and', 'or', 'with', 'pvt', 'ltd', 'limited', 'inr', 'rs', 'ref', 'no',
  'tx', 'txn', 'transfer', 'trans', 'payment', 'py', 'pymt', 'thru', 'through'
]);

export class TraditionalNaiveBayesClassifier {
  private vocabulary: Map<string, number> = new Map(); // token -> index
  private idf: number[] = [];
  private classes: TransactionCategory[] = [];
  private classLogPriors: Map<TransactionCategory, number> = new Map();
  // class -> array of log probabilities for each vocabulary token
  private classFeatureLogProbs: Map<TransactionCategory, number[]> = new Map();
  private isTrained: boolean = false;

  constructor() {
    this.train(TRAINING_DATASET);
  }

  /**
   * Tokenize and generate unigrams and selective bigrams.
   */
  public tokenize(text: string): string[] {
    const clean = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const rawTokens = clean.split(' ').filter(t => t.length > 1 && !STOP_WORDS.has(t));
    const tokens: string[] = [...rawTokens];

    // Add bigrams
    for (let i = 0; i < rawTokens.length - 1; i++) {
      tokens.push(`${rawTokens[i]}_${rawTokens[i + 1]}`);
    }

    return tokens;
  }

  /**
   * Train the TF-IDF Vectorizer and Multinomial Naive Bayes model.
   */
  public train(samples: TrainingSample[]): void {
    const N = samples.length;
    const docTermFreqs: Map<string, number>[] = [];
    const termDocCount: Map<string, number> = new Map();
    const classDocCounts: Map<TransactionCategory, number> = new Map();
    const classSamples: Map<TransactionCategory, Map<string, number>[]> = new Map();

    // Pass 1: Build token frequencies and class counts
    for (const sample of samples) {
      const tokens = this.tokenize(sample.text);
      const tf = new Map<string, number>();
      const seenInDoc = new Set<string>();

      for (const token of tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
        if (!seenInDoc.has(token)) {
          seenInDoc.add(token);
          termDocCount.set(token, (termDocCount.get(token) || 0) + 1);
        }
      }

      docTermFreqs.push(tf);

      const count = classDocCounts.get(sample.category) || 0;
      classDocCounts.set(sample.category, count + 1);

      if (!classSamples.has(sample.category)) {
        classSamples.set(sample.category, []);
      }
      classSamples.get(sample.category)!.push(tf);
    }

    // Build vocabulary with minimum occurrences threshold
    this.vocabulary.clear();
    let vocabIndex = 0;
    Array.from(termDocCount.entries()).forEach(([term]) => {
      this.vocabulary.set(term, vocabIndex++);
    });

    const V = this.vocabulary.size;
    this.idf = new Array(V).fill(0);

    // Compute Smooth IDF
    Array.from(this.vocabulary.entries()).forEach(([term, index]) => {
      const df = termDocCount.get(term) || 0;
      this.idf[index] = Math.log((1 + N) / (1 + df)) + 1.0;
    });

    // Classes
    this.classes = Array.from(classDocCounts.keys());
    this.classLogPriors.clear();
    this.classFeatureLogProbs.clear();

    const alpha = 1.0; // Laplace smoothing parameter

    for (const cat of this.classes) {
      const docCount = classDocCounts.get(cat) || 0;
      this.classLogPriors.set(cat, Math.log(docCount / N));

      const samplesInCat = classSamples.get(cat) || [];
      const termWeights = new Array(V).fill(0);
      let totalWeight = 0;

      for (const tf of samplesInCat) {
        // Calculate TF-IDF
        Array.from(tf.entries()).forEach(([token, freq]) => {
          const idx = this.vocabulary.get(token);
          if (idx !== undefined) {
            const sublinearTf = 1 + Math.log(freq);
            const tfidf = sublinearTf * this.idf[idx];
            termWeights[idx] += tfidf;
            totalWeight += tfidf;
          }
        });
      }

      // Compute conditional log probabilities with Laplace smoothing
      const denominator = totalWeight + alpha * V;
      const logProbs = new Array(V);
      for (let i = 0; i < V; i++) {
        logProbs[i] = Math.log((termWeights[i] + alpha) / denominator);
      }
      this.classFeatureLogProbs.set(cat, logProbs);
    }

    this.isTrained = true;
  }

  /**
   * Predict the category for a given transaction narration.
   */
  public predict(text: string): MLPrediction {
    if (!this.isTrained) {
      throw new Error("Model is not trained.");
    }

    const tokens = this.tokenize(text);
    const matchedTokens: string[] = [];

    // Calculate unnormalized log posterior for each class: log P(c) + sum(log P(w|c))
    const classScores: Map<TransactionCategory, number> = new Map();

    for (const cat of this.classes) {
      let score = this.classLogPriors.get(cat) || 0;
      const featureLogProbs = this.classFeatureLogProbs.get(cat)!;

      for (const token of tokens) {
        const tokenIdx = this.vocabulary.get(token);
        if (tokenIdx !== undefined) {
          if (!matchedTokens.includes(token)) {
            matchedTokens.push(token);
          }
          score += featureLogProbs[tokenIdx];
        }
      }
      classScores.set(cat, score);
    }

    // Softmax normalization with numerical stability shift
    let maxScore = -Infinity;
    Array.from(classScores.values()).forEach((score) => {
      if (score > maxScore) maxScore = score;
    });

    let expSum = 0;
    const expScores: Map<TransactionCategory, number> = new Map();
    Array.from(classScores.entries()).forEach(([cat, score]) => {
      const expVal = Math.exp(score - maxScore);
      expScores.set(cat, expVal);
      expSum += expVal;
    });

    const probabilities: Array<{ category: TransactionCategory; probability: number }> = [];
    Array.from(expScores.entries()).forEach(([cat, expVal]) => {
      probabilities.push({
        category: cat,
        probability: expSum > 0 ? expVal / expSum : 1 / this.classes.length,
      });
    });

    // Sort descending by probability
    probabilities.sort((a, b) => b.probability - a.probability);

    const top = probabilities[0];
    const confidence = top ? Math.min(Math.max(top.probability, 0.40), 0.99) : 0.50;

    return {
      category: top ? top.category : 'Miscellaneous',
      confidence,
      probabilities: probabilities.slice(0, 5),
      tokens: matchedTokens,
    };
  }
}

// Export singleton instance for reuse
export const traditionalMLClassifier = new TraditionalNaiveBayesClassifier();
