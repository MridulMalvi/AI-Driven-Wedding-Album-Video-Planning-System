import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWeddingPlan } from '../services/aiService.js';

test('mock provider returns context-aware, schema-valid wedding production plans', async () => {
  process.env.AI_PROVIDER = 'mock';
  const plan = await generateWeddingPlan(
    { brideName: 'Priya', groomName: 'Rahul', weddingStyle: 'Royal Traditional', colorTheme: 'Maroon and antique gold' },
    [{ name: 'Mehendi', importance: 'high', specialMoments: ['Grandmother reveal'] }, { name: 'Sangeet', importance: 'high', specialMoments: ['Couple dance'] }]
  );
  assert.equal(plan.functionVideoPlans.length, 2);
  assert.match(plan.functionVideoPlans[0].colorGrading, /marigold/i);
  assert.match(plan.functionVideoPlans[1].musicSuggestion, /Bollywood/i);
  assert.ok(plan.highlightVideo.timeline.length >= 3);
  assert.ok(plan.albumDesign.pageStructure.length >= 3);
});
