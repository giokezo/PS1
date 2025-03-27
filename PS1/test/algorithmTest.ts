import assert from "assert";
import { AnswerDifficulty, Flashcard, BucketMap } from "../src/flashcards";
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress,
} from "../src/algorithm";

// Helper function to create flashcards
function createFlashcard(front: string, back: string, hint: string = '', tags: string[] = []): Flashcard {
  return new Flashcard(front, back, hint, tags);
}

describe("toBucketSets()", () => {
  it("converts empty bucket map to empty array", () => {
    const emptyBuckets: BucketMap = new Map();
    const result = toBucketSets(emptyBuckets);
    assert.deepStrictEqual(result, []);
  });

  it("converts non-contiguous bucket map correctly", () => {
    const card1 = createFlashcard("Q1", "A1");
    const card2 = createFlashcard("Q2", "A2");
    const buckets: BucketMap = new Map([
      [0, new Set([card1])],
      [2, new Set([card2])]
    ]);
    
    const result = toBucketSets(buckets);
    assert.strictEqual(result.length, 3);
    assert.ok(result[0]?.has(card1));
    assert.ok(result[2]?.has(card2));
    assert.strictEqual(result[1]?.size, 0);
  });
});

describe("getBucketRange()", () => {
  it("returns undefined for empty buckets", () => {
    const emptyBuckets: Array<Set<Flashcard>> = [];
    assert.strictEqual(getBucketRange(emptyBuckets), undefined);
  });

  it("finds correct bucket range", () => {
    const card1 = createFlashcard("Q1", "A1");
    const card2 = createFlashcard("Q2", "A2");
    const buckets: Array<Set<Flashcard>> = [
      new Set(), 
      new Set([card1]), 
      new Set(), 
      new Set([card2])
    ];
    
    const range = getBucketRange(buckets);
    assert.deepStrictEqual(range, { minBucket: 1, maxBucket: 3 });
  });
});

describe("practice()", () => {
  it("practices bucket 0 cards every day", () => {
    const card1 = createFlashcard("Q1", "A1");
    const card2 = createFlashcard("Q2", "A2");
    const buckets: Array<Set<Flashcard>> = [
      new Set([card1, card2]), 
      new Set(), 
      new Set()
    ];
    
    const practiceCards = practice(buckets, 5);
    assert.deepStrictEqual(practiceCards, new Set([card1, card2]));
  });

  it("practices higher bucket cards on specific days", () => {
    const card1 = createFlashcard("Q1", "A1");
    const card2 = createFlashcard("Q2", "A2");
    const buckets: Array<Set<Flashcard>> = [
      new Set(), 
      new Set([card1]), 
      new Set([card2])
    ];
    
    const practiceCards1 = practice(buckets, 2);
    assert.deepStrictEqual(practiceCards1, new Set([card1]));

    const practiceCards2 = practice(buckets, 4);
    assert.deepStrictEqual(practiceCards2, new Set([card2]));
  });
});

describe("update()", () => {
  it("moves card to correct bucket based on difficulty", () => {
    const card = createFlashcard("Q1", "A1");
    const initialBuckets: BucketMap = new Map([
      [0, new Set([card])]
    ]);

    // Easy difficulty moves card up two buckets
    const easyUpdate = update(initialBuckets, card, AnswerDifficulty.Easy);
    assert.strictEqual(easyUpdate.get(2)?.has(card), true);

    // Hard difficulty moves card up one bucket
    const hardUpdate = update(initialBuckets, card, AnswerDifficulty.Hard);
    assert.strictEqual(easyUpdate.get(1)?.has(card), true);

    // Wrong difficulty resets to bucket 0
    const wrongUpdate = update(initialBuckets, card, AnswerDifficulty.Wrong);
    assert.strictEqual(wrongUpdate.get(0)?.has(card), true);
  });
});

describe("getHint()", () => {
  it("returns existing hint if available", () => {
    const card = createFlashcard("Question", "Answer", "Existing Hint");
    assert.strictEqual(getHint(card), "Existing Hint");
  });

  it("generates hint for short strings", () => {
    const shortCard = createFlashcard("Hi", "Hello", "");
    const hint = getHint(shortCard);
    assert.strictEqual(hint, "H*");
  });

  it("generates hint for longer strings", () => {
    const longCard = createFlashcard("Python Programming", "A coding language", "");
    const hint = getHint(longCard);
    assert.strictEqual(hint, "Pyt***************");
  });
});

describe("computeProgress()", () => {
  it("calculates progress across different stages", () => {
    const card1 = createFlashcard("Q1", "A1");
    const card2 = createFlashcard("Q2", "A2");
    const card3 = createFlashcard("Q3", "A3");
    
    const buckets: BucketMap = new Map([
      [0, new Set([card1])],
      [2, new Set([card2])],
      [6, new Set([card3])]
    ]);

    const progress = computeProgress(buckets, {});
    assert.strictEqual(progress.totalCards, 3);
    
    const stageBreakdown = progress.stageBreakdown;
    assert.strictEqual(stageBreakdown[0].stage, 'Beginner');
    assert.strictEqual(stageBreakdown[0].cardCount, 1);
    assert.strictEqual(stageBreakdown[1].stage, 'Intermediate');
    assert.strictEqual(stageBreakdown[1].cardCount, 1);
    assert.strictEqual(stageBreakdown[2].stage, 'Advanced');
    assert.strictEqual(stageBreakdown[2].cardCount, 1);
  });
});