import Wedding from '../models/Wedding.js';
import Function from '../models/Function.js';
import VideoPlan from '../models/VideoPlan.js';
import HighlightVideo from '../models/HighlightVideo.js';
import AlbumDesign from '../models/AlbumDesign.js';
import { generateWeddingPlan } from '../services/aiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { canAccessWedding } from './weddingController.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const saveGenerated = async (wedding, functions, generated, scope = 'all') => {
  if (scope === 'all' || scope === 'video') {
    await Promise.all(
      generated.functionVideoPlans.map(async (plan) => {
        const fn = functions.find((f) => f.name.toLowerCase() === plan.functionName.toLowerCase());
        const previous = await VideoPlan.findOne({ weddingId: wedding._id, functionName: plan.functionName }).sort('-version');
        return VideoPlan.create({ ...plan, weddingId: wedding._id, functionId: fn?._id, version: (previous?.version || 0) + 1 });
      }),
    );
    const previousHighlight = await HighlightVideo.findOne({ weddingId: wedding._id }).sort('-version');
    await HighlightVideo.create({ ...generated.highlightVideo, weddingId: wedding._id, version: (previousHighlight?.version || 0) + 1 });
  }
  if (scope === 'all' || scope === 'album') {
    const previous = await AlbumDesign.findOne({ weddingId: wedding._id }).sort('-version');
    await AlbumDesign.create({ ...generated.albumDesign, weddingId: wedding._id, version: (previous?.version || 0) + 1 });
  }
};

/**
 * Run the AI generation + DB saves in the background.
 * Updates the wedding status to reflect progress or failure.
 * Errors are logged but NOT re-thrown (fire-and-forget).
 */
const runGenerationAsync = async (weddingId, functions, scope = 'all') => {
  try {
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) return;

    const generated = await generateWeddingPlan(wedding.toObject(), functions.map((f) => f.toObject()));
    await saveGenerated(wedding, functions, generated, scope);

    if (scope === 'all') {
      wedding.status = 'ai_generated';
      wedding.aiError = undefined;
    }
    await wedding.save();
  } catch (err) {
    process.stderr.write(
      JSON.stringify({ ts: new Date().toISOString(), msg: 'Background AI generation failed', weddingId, error: err.message }) + '\n',
    );
    // Mark the wedding so the frontend can surface the failure
    try {
      await Wedding.findByIdAndUpdate(weddingId, {
        status: 'planning',
        aiError: err.message || 'AI generation failed. Please try again.',
      });
    } catch (_) { /* best-effort */ }
  }
};

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * POST /api/ai/generate-plan/:weddingId
 * Returns 202 immediately and runs generation in the background.
 * The frontend should poll GET /api/ai/status/:weddingId for completion.
 */
export const generate = asyncHandler(async (req, res) => {
  const wedding = await canAccessWedding(req.params.weddingId, req.user, true);
  const functions = await Function.find({ weddingId: wedding._id });
  if (!functions.length) throw new AppError('Add at least one wedding function before generating an AI plan.');

  // Set status to "generating" so the frontend can show a progress state
  wedding.status = 'generating';
  wedding.aiError = undefined;
  await wedding.save();

  // Fire-and-forget — do NOT await
  runGenerationAsync(wedding._id, functions, 'all');

  res.status(202).json({
    message: 'AI plan generation started. Poll /api/ai/status/:weddingId for progress.',
    weddingId: wedding._id,
  });
});

/**
 * GET /api/ai/status/:weddingId
 * Lets the frontend poll for generation completion.
 */
export const generationStatus = asyncHandler(async (req, res) => {
  const wedding = await canAccessWedding(req.params.weddingId, req.user);
  const done = wedding.status === 'ai_generated';
  const failed = wedding.status === 'planning' && !!wedding.aiError;
  res.json({
    status: wedding.status,
    done,
    failed,
    error: failed ? wedding.aiError : undefined,
  });
});

/**
 * POST /api/ai/regenerate-video/:weddingId
 * Async — returns 202 and regenerates video plans in background.
 */
export const regenerateVideo = asyncHandler(async (req, res) => {
  const wedding = await canAccessWedding(req.params.weddingId, req.user, true);
  const functions = await Function.find({ weddingId: wedding._id });

  runGenerationAsync(wedding._id, functions, 'video');

  res.status(202).json({ message: 'Video plan regeneration started.', weddingId: wedding._id });
});

/**
 * POST /api/ai/regenerate-album/:weddingId
 * Async — returns 202 and regenerates album design in background.
 */
export const regenerateAlbum = asyncHandler(async (req, res) => {
  const wedding = await canAccessWedding(req.params.weddingId, req.user, true);
  const functions = await Function.find({ weddingId: wedding._id });

  runGenerationAsync(wedding._id, functions, 'album');

  res.status(202).json({ message: 'Album design regeneration started.', weddingId: wedding._id });
});
