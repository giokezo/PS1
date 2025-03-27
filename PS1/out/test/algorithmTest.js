"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const flashcards_1 = require("../src/flashcards");
const algorithm_1 = require("../src/algorithm");
// Helper function to create flashcards
function createFlashcard(front, back, hint = '', tags = []) {
    return new flashcards_1.Flashcard(front, back, hint, tags);
}
describe("toBucketSets()", () => {
    it("converts empty bucket map to empty array", () => {
        const emptyBuckets = new Map();
        const result = (0, algorithm_1.toBucketSets)(emptyBuckets);
        assert_1.default.deepStrictEqual(result, []);
    });
    it("converts non-contiguous bucket map correctly", () => {
        const card1 = createFlashcard("Q1", "A1");
        const card2 = createFlashcard("Q2", "A2");
        const buckets = new Map([
            [0, new Set([card1])],
            [2, new Set([card2])]
        ]);
        const result = (0, algorithm_1.toBucketSets)(buckets);
        assert_1.default.strictEqual(result.length, 3);
        assert_1.default.ok(result[0]?.has(card1));
        assert_1.default.ok(result[2]?.has(card2));
        assert_1.default.strictEqual(result[1]?.size, 0);
    });
});
describe("getBucketRange()", () => {
    it("returns undefined for empty buckets", () => {
        const emptyBuckets = [];
        assert_1.default.strictEqual((0, algorithm_1.getBucketRange)(emptyBuckets), undefined);
    });
    it("finds correct bucket range", () => {
        const card1 = createFlashcard("Q1", "A1");
        const card2 = createFlashcard("Q2", "A2");
        const buckets = [
            new Set(),
            new Set([card1]),
            new Set(),
            new Set([card2])
        ];
        const range = (0, algorithm_1.getBucketRange)(buckets);
        assert_1.default.deepStrictEqual(range, { minBucket: 1, maxBucket: 3 });
    });
});
describe("practice()", () => {
    it("practices bucket 0 cards every day", () => {
        const card1 = createFlashcard("Q1", "A1");
        const card2 = createFlashcard("Q2", "A2");
        const buckets = [
            new Set([card1, card2]),
            new Set(),
            new Set()
        ];
        const practiceCards = (0, algorithm_1.practice)(buckets, 5);
        assert_1.default.deepStrictEqual(practiceCards, new Set([card1, card2]));
    });
    it("practices higher bucket cards on specific days", () => {
        const card1 = createFlashcard("Q1", "A1");
        const card2 = createFlashcard("Q2", "A2");
        const buckets = [
            new Set(),
            new Set([card1]),
            new Set([card2])
        ];
        const practiceCards1 = (0, algorithm_1.practice)(buckets, 2);
        assert_1.default.deepStrictEqual(practiceCards1, new Set([card1]));
        const practiceCards2 = (0, algorithm_1.practice)(buckets, 4);
        assert_1.default.deepStrictEqual(practiceCards2, new Set([card2]));
    });
});
describe("update()", () => {
    it("moves card to correct bucket based on difficulty", () => {
        const card = createFlashcard("Q1", "A1");
        const initialBuckets = new Map([
            [0, new Set([card])]
        ]);
        // Easy difficulty moves card up two buckets
        const easyUpdate = (0, algorithm_1.update)(initialBuckets, card, flashcards_1.AnswerDifficulty.Easy);
        assert_1.default.strictEqual(easyUpdate.get(2)?.has(card), true);
        // Hard difficulty moves card up one bucket
        const hardUpdate = (0, algorithm_1.update)(initialBuckets, card, flashcards_1.AnswerDifficulty.Hard);
        assert_1.default.strictEqual(easyUpdate.get(1)?.has(card), true);
        // Wrong difficulty resets to bucket 0
        const wrongUpdate = (0, algorithm_1.update)(initialBuckets, card, flashcards_1.AnswerDifficulty.Wrong);
        assert_1.default.strictEqual(wrongUpdate.get(0)?.has(card), true);
    });
});
describe("getHint()", () => {
    it("returns existing hint if available", () => {
        const card = createFlashcard("Question", "Answer", "Existing Hint");
        assert_1.default.strictEqual((0, algorithm_1.getHint)(card), "Existing Hint");
    });
    it("generates hint for short strings", () => {
        const shortCard = createFlashcard("Hi", "Hello", "");
        const hint = (0, algorithm_1.getHint)(shortCard);
        assert_1.default.strictEqual(hint, "H*");
    });
    it("generates hint for longer strings", () => {
        const longCard = createFlashcard("Python Programming", "A coding language", "");
        const hint = (0, algorithm_1.getHint)(longCard);
        assert_1.default.strictEqual(hint, "Pyt***************");
    });
});
describe("computeProgress()", () => {
    it("calculates progress across different stages", () => {
        const card1 = createFlashcard("Q1", "A1");
        const card2 = createFlashcard("Q2", "A2");
        const card3 = createFlashcard("Q3", "A3");
        const buckets = new Map([
            [0, new Set([card1])],
            [2, new Set([card2])],
            [6, new Set([card3])]
        ]);
        const progress = (0, algorithm_1.computeProgress)(buckets, {});
        assert_1.default.strictEqual(progress.totalCards, 3);
        const stageBreakdown = progress.stageBreakdown;
        assert_1.default.strictEqual(stageBreakdown[0].stage, 'Beginner');
        assert_1.default.strictEqual(stageBreakdown[0].cardCount, 1);
        assert_1.default.strictEqual(stageBreakdown[1].stage, 'Intermediate');
        assert_1.default.strictEqual(stageBreakdown[1].cardCount, 1);
        assert_1.default.strictEqual(stageBreakdown[2].stage, 'Advanced');
        assert_1.default.strictEqual(stageBreakdown[2].cardCount, 1);
    });
});
