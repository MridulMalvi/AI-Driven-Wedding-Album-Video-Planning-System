import OpenAI from 'openai';
import { AppError } from '../utils/appError.js';

const clean = (value, fallback = '') => typeof value === 'string' ? value : fallback;

const profileFor = (name) => {
  const n = name.toLowerCase();
  if (n.includes('meh')) return { vibe: 'joyful, tactile and colour-rich', moments: ['intricate mehendi application', 'hands and jewellery details', 'laughter with bridesmaids'], shots: ['Macro detail', 'Overhead hands', 'Candid reaction'], music: 'Light acoustic Indian fusion', grade: 'Sun-washed greens, marigold and warm skin tones' };
  if (n.includes('haldi')) return { vibe: 'playful and spontaneous', moments: ['haldi ritual', 'flower shower', 'family laughter'], shots: ['High-speed splash', 'Wide ritual', 'Close reaction'], music: 'Upbeat percussion-led folk groove', grade: 'Golden yellows with clean, bright whites' };
  if (n.includes('sangeet')) return { vibe: 'electric, rhythmic and celebratory', moments: ['opening performance', 'dance formations', 'audience applause'], shots: ['Wide stage master', 'Gimbal dance', 'Audience reaction'], music: 'Energetic Bollywood-inspired instrumental', grade: 'Vibrant jewel tones with controlled highlights' };
  if (n.includes('reception')) return { vibe: 'polished, glamorous and celebratory', moments: ['couple entrance', 'speeches', 'portraits and celebration'], shots: ['Elegant portrait', 'Speech close-up', 'Dance-floor wide'], music: 'Contemporary romantic instrumental', grade: 'Luxe contrast with champagne highlights' };
  return { vibe: 'emotional, ceremonial and cinematic', moments: ['bridal entrance', 'key rituals', 'family blessings and couple portraits'], shots: ['Cinematic wide', 'Emotional close-up', 'Detail macro'], music: 'Orchestral Indian romantic score', grade: 'Warm filmic tones with true-to-life reds' };
};

function mockPlan(wedding, functions) {
  const functionVideoPlans = functions.map((fn, index) => {
    const p = profileFor(fn.name);
    return {
      functionName: fn.name,
      objective: `Tell a ${p.vibe} ${fn.name} story while preserving the moments the family will revisit.`,
      estimatedDuration: fn.importance === 'high' ? 90 : 60,
      shots: p.shots.map((shotType, i) => ({ shotNumber: i + 1, shotType, description: `${shotType} of ${p.moments[i] || fn.name}, framed for both narrative context and clean editorial cut points.`, duration: [5, 7, 4][i], cameraSuggestion: i === 0 ? 'Full-frame mirrorless + 85mm' : i === 1 ? 'Gimbal + 24mm' : '50mm prime', movement: i === 1 ? 'Slow orbit / follow' : 'Intentional handheld', priority: i === 0 ? 'high' : 'medium' })),
      musicSuggestion: p.music,
      transitionStyle: index === 0 ? 'Soft dissolves and motivated match cuts' : 'Beat-matched cuts with restrained speed ramps',
      colorGrading: p.grade,
      importantMoments: [...p.moments, ...(fn.specialMoments || [])],
      equipmentSuggestions: ['Two mirrorless camera bodies', '24-70mm and 85mm primes', 'Wireless lavalier for vows/speeches'],
      editingNotes: ['Prioritize authentic reactions over posed coverage.', 'Leave clean room tone beneath major emotional beats.', `Respect ${fn.startTime || 'the scheduled'} timing and ceremonial pace.`],
    };
  });
  const names = functions.map((f) => f.name);
  const timeline = [
    { timestamp: '00:00', section: 'Opening', description: `A visual invitation to ${wedding.brideName} and ${wedding.groomName}'s ${wedding.weddingStyle} celebration.`, footageSource: 'Venue, details, preparations', music: 'Ambient score begins', transition: 'Elegant fade in' },
    ...functions.map((f, i) => ({ timestamp: `0${i + 1}:00`, section: f.name, description: `The defining energy and intimate beats from ${f.name}.`, footageSource: `${f.name} coverage`, music: i % 2 ? 'Rhythmic lift' : 'Romantic theme', transition: 'Motivated match cut' })),
    { timestamp: `0${functions.length + 1}:15`, section: 'Finale', description: 'Golden-hour portraits, celebrations and one final emotional embrace.', footageSource: 'Couple portraits and family reactions', music: 'Main theme resolves', transition: 'Slow dissolve' },
  ];
  return {
    functionVideoPlans,
    highlightVideo: {
      totalDuration: Math.max(240, functions.length * 75),
      concept: `${wedding.weddingStyle} romance, told with intimate detail and a generous cinematic scale`,
      story: `From quiet anticipation to communal celebration, the film follows ${wedding.brideName} and ${wedding.groomName} through ${names.join(', ')} and lands on their shared beginning.`,
      timeline,
      opening: 'Quiet preparations, heirloom details and an establishing view of the venue.',
      emotionalPeak: 'The central ceremony, blessings and the couple\'s first private reaction afterward.',
      finale: 'A joyful exit into portraits and dancing, ending on a lingering couple moment.',
      musicDirection: 'Begin with delicate Indian acoustic textures, build through percussive celebration, and resolve with an orchestral romantic theme.',
      editingStyle: 'Cinematic, emotion-led pacing with editorially clean cuts and restrained transitions.',
    },
    albumDesign: {
      theme: `${wedding.weddingStyle} heirloom editorial`,
      concept: `A tactile visual keepsake pairing ${wedding.colorTheme || 'the event palette'} with airy portrait-led storytelling.`,
      colorPalette: ['#6E2C3E', '#D9A47D', '#F7F1EA', '#2C2526'],
      typography: 'Elegant high-contrast serif for titles paired with a refined sans-serif for captions.',
      coverSuggestion: `Debossed initials "${wedding.brideName?.[0] || ''} & ${wedding.groomName?.[0] || ''}" on a textured linen cover with one small candid inset.`,
      pageStructure: [
        { pageNumber: 1, layout: 'Full-bleed opener', photoCount: 1, photoTypes: ['Couple portrait'], description: 'A confident opening portrait with generous negative space.', designNotes: 'No caption; let the image set the mood.' },
        ...functions.slice(0, 4).map((f, i) => ({ pageNumber: i * 2 + 2, layout: i % 2 ? 'Layered collage' : 'Editorial spread', photoCount: i % 2 ? 5 : 3, photoTypes: ['Wide scene', 'Details', 'Candid moments'], description: `${f.name} narrative spread balancing scene-setting, details and expression.`, designNotes: 'Keep one image dominant; use smaller frames for rhythm.' })),
        { pageNumber: functions.length * 2 + 3, layout: 'Full-bleed closing page', photoCount: 1, photoTypes: ['Closing couple photograph'], description: 'A calm final frame from the celebration.', designNotes: 'Optional discreet date line.' },
      ],
      photographyStyle: 'Observational documentary coverage elevated with softly directed editorial portraits.',
      layoutNotes: ['Use breathing room around hero photographs.', 'Avoid repeating similar poses on a spread.', 'Sequence the album from anticipation to celebration to quiet resolution.'],
    },
  };
}

const REQUIRED_KEYS = ['functionVideoPlans', 'highlightVideo', 'albumDesign'];
export function validatePlan(plan) {
  if (!plan || typeof plan !== 'object' || REQUIRED_KEYS.some((key) => !plan[key])) {
    throw new AppError('The AI response did not match the required wedding-plan schema.', 502);
  }
  if (!Array.isArray(plan.functionVideoPlans) || !Array.isArray(plan.highlightVideo.timeline) || !Array.isArray(plan.albumDesign.pageStructure)) {
    throw new AppError('The AI response contains invalid plan collections.', 502);
  }
  return plan;
}

/** Call the OpenRouter API with a timeout and one automatic retry on transient errors. */
async function callOpenRouter(prompt, attempt = 1) {
  const TIMEOUT_MS = 90_000; // 90 seconds
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // OpenRouter is OpenAI-API-compatible — just point the base URL at OpenRouter.
    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'AI-Driven Wedding Album & Video Planning System',
      },
    });

    const result = await client.chat.completions.create(
      {
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'Return only strict valid JSON, no Markdown.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      },
      { signal: controller.signal },
    );

    return clean(result.choices[0]?.message?.content);
  } catch (err) {
    // Retry once on timeout or transient server errors
    const isTransient = err.name === 'AbortError' || (err.status >= 500 && err.status < 600);
    if (attempt === 1 && isTransient) {
      process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), msg: 'AI call transient failure, retrying', error: err.message }) + '\n');
      return callOpenRouter(prompt, 2);
    }
    if (err.name === 'AbortError') {
      throw new AppError('The AI request timed out. Please try again.', 504);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateWeddingPlan(wedding, functions) {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  if (provider === 'mock') return validatePlan(mockPlan(wedding, functions));
  if (provider !== 'openrouter') {
    throw new AppError(`AI provider '${provider}' is not configured. Set AI_PROVIDER=mock or AI_PROVIDER=openrouter.`, 500);
  }
  if (!process.env.OPENROUTER_API_KEY) {
    throw new AppError('OPENROUTER_API_KEY is missing. Use AI_PROVIDER=mock for a no-key demonstration.', 500);
  }

  const schema = '{"functionVideoPlans":[{"functionName":"","objective":"","estimatedDuration":0,"shots":[{"shotNumber":1,"shotType":"","description":"","duration":0,"cameraSuggestion":"","movement":"","priority":"high"}],"musicSuggestion":"","transitionStyle":"","colorGrading":"","importantMoments":[],"equipmentSuggestions":[],"editingNotes":[]}],"highlightVideo":{"totalDuration":0,"concept":"","story":"","timeline":[{"timestamp":"","section":"","description":"","footageSource":"","music":"","transition":""}],"opening":"","emotionalPeak":"","finale":"","musicDirection":"","editingStyle":""},"albumDesign":{"theme":"","concept":"","colorPalette":[],"typography":"","coverSuggestion":"","pageStructure":[{"pageNumber":1,"layout":"","photoCount":0,"photoTypes":[],"description":"","designNotes":""}],"photographyStyle":"","layoutNotes":[]}}';
  const prompt = `You are an expert Indian wedding cinematographer, wedding filmmaker, video editor and album designer. Analyze this wedding: ${JSON.stringify({ wedding, functions })}. Generate practical production-ready recommendations. Do not invent unavailable details. Return ONLY valid JSON matching this exact schema: ${schema}`;

  const raw = await callOpenRouter(prompt);
  try {
    return validatePlan(JSON.parse(raw));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('The AI returned malformed JSON. Please regenerate the plan.', 502);
  }
}
