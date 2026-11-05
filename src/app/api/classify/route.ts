import { NextRequest, NextResponse } from 'next/server';
import { traditionalMLClassifier } from '@/lib/classifiers/traditional-ml';
import { heuristicClassifier } from '@/lib/classifiers/heuristics';
import { detectTransactionMode } from '@/lib/classifiers/hybrid-classifier';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, debit = null, credit = null, modeHint } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Transaction description text is required' },
        { status: 400 }
      );
    }

    const mode = modeHint || detectTransactionMode(text);

    // Heuristic rule matching
    const heuristicMatch = heuristicClassifier.classify(
      text,
      debit,
      credit,
      mode
    );

    // Traditional ML Naive Bayes prediction
    const mlResult = traditionalMLClassifier.predict(text);

    // Final ensemble selection
    const chosenCategory = heuristicMatch ? heuristicMatch.category : mlResult.category;
    const chosenMethod = heuristicMatch ? 'HEURISTIC' : 'TRADITIONAL_ML';
    const confidence = heuristicMatch
      ? Math.round(heuristicMatch.confidence * 100)
      : Math.round(mlResult.confidence * 100);

    return NextResponse.json({
      input: {
        text,
        debit,
        credit,
        mode,
      },
      result: {
        category: chosenCategory,
        method: chosenMethod,
        confidence,
        heuristicMatch: heuristicMatch
          ? {
              ruleName: heuristicMatch.ruleName,
              category: heuristicMatch.category,
              confidence: Math.round(heuristicMatch.confidence * 100),
              explanation: heuristicMatch.explanation,
            }
          : null,
        traditionalML: {
          category: mlResult.category,
          confidence: Math.round(mlResult.confidence * 100),
          tokens: mlResult.tokens,
          probabilities: mlResult.probabilities,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Classification failed' },
      { status: 500 }
    );
  }
}
