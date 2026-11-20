
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function clampScore(value, fallback = 12) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(25, Math.round(num)));
}

function normalizeStringArray(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function normalizeObjectArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === 'object');
}

async function callWithTimeout(promise, timeoutMs, modelName) {
  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const err = new Error(`Gemini request timed out after ${timeoutMs}ms on ${modelName}`);
      err.status = 504;
      reject(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timerId);
  }
}

async function generateFeedback({
  question,
  level,
  transcript,
  azureAssessment
}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  if (!transcript || !transcript.trim()) {
    throw new Error('Transcript is empty');
  }

  const prompt = `
You are an experienced English speaking examiner and language coach.

Evaluate the student's spoken response using ONLY the transcript provided.

PRACTICE QUESTION:
${question || 'General speaking practice'}

TARGET ENGLISH LEVEL:
${level || 'Intermediate'}

STUDENT TRANSCRIPT:
${transcript}

AZURE SPEECH ASSESSMENT:
${JSON.stringify(azureAssessment || {})}

EVALUATION RULES:

1. CONTENT (0-25):
Evaluate relevance, completeness, development of ideas,
examples, and whether the student answers the question.

2. VOCABULARY (0-25):
Evaluate vocabulary range, precision, appropriateness,
word choice, and repetition.

3. GRAMMAR (0-25):
Evaluate grammatical accuracy, sentence structure,
and variety of grammatical constructions.

4. FLUENCY:
Do not assign a numerical fluency score.
Azure provides the fluency assessment separately.

5. PRONUNCIATION:
Do not invent pronunciation mistakes.
Azure provides pronunciation assessment separately.

6. FEEDBACK:
- Analyze only what the student actually said.
- Never invent grammar or vocabulary errors.
- If a sentence is correct, do not mark it as incorrect.
- Explain corrections clearly.
- Give practical recommendations.
- Consider the target level when evaluating.
- Do not penalize informal but natural spoken English.
- All feedback must be written in English.

SCORING:
Each of the three criteria must be an integer from 0 to 25.
Scores must reflect the actual transcript.
Do not automatically give high scores.

Return valid JSON with exactly this structure:

{
  "feedback_summary": "Short overall evaluation",
  "content_score": 0,
  "grammar_score": 0,
  "vocabulary_score": 0,
  "strengths": [
    "Specific strength"
  ],
  "improvements": [
    "Specific actionable recommendation"
  ],
  "grammar": [
    {
      "original": "Original phrase",
      "correction": "Corrected phrase",
      "explanation": "Why it should be corrected"
    }
  ],
  "vocabulary": [
    {
      "original": "Original word or phrase",
      "suggestion": "Better alternative",
      "reason": "Why it is more appropriate"
    }
  ],
  "coherence": {
    "observations": [
      "Observation about idea organization"
    ],
    "suggestions": [
      "Suggestion for improving coherence"
    ]
  },
  "exercises": [
    {
      "task": "Practice task",
      "reason": "Why this task is useful"
    }
  ],
  "filler_words_notes": "Comments about filler words, repetitions and pauses. Only mention evidence visible in the transcript. If pauses cannot be determined from the transcript, say so."
}

If there are no actual grammar or vocabulary mistakes,
return an empty array for that category.
`;

  const modelsToTry = Array.from(
    new Set([
      process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
    ])
  );

  let response;
  let lastError;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Calling Gemini model: ${model} (attempt ${attempt + 1}/2)`);

        response = await callWithTimeout(
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
          12000,
          model
        );

        break;
      } catch (error) {
        lastError = error;

        const status = Number(error?.status || error?.code);
        const message = String(error?.message || '').toLowerCase();
        const isTransient =
          [429, 500, 503, 504].includes(status) ||
          message.includes('timeout') ||
          message.includes('unavailable') ||
          message.includes('overloaded');

        if (!isTransient) {
          throw error;
        }

        if (attempt === 1) {
          console.warn(
            `Gemini model ${model} failed after retries (${status || 'timeout'}), trying next fallback if available.`
          );
          break;
        }

        const delay = 1000 + Math.floor(Math.random() * 250);
        console.log(
          `Gemini temporary issue on ${model} (${status || 'timeout'}). Retry 1/1 in ${delay}ms`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    if (response) {
      break;
    }
  }

  if (!response || !response.text) {
    throw lastError || new Error('Gemini did not return a response');
  }

  let raw;
  try {
    raw = JSON.parse(response.text);
  } catch (error) {
    throw new Error('Gemini returned invalid JSON');
  }

  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid Gemini response');
  }

  const coherenceObj =
    raw.coherence && typeof raw.coherence === 'object' ? raw.coherence : {};

  return {
    feedback_summary:
      typeof raw.feedback_summary === 'string' && raw.feedback_summary.trim()
        ? raw.feedback_summary.trim()
        : 'AI evaluation completed.',
    content_score: clampScore(raw.content_score, 12),
    grammar_score: clampScore(raw.grammar_score, 12),
    vocabulary_score: clampScore(raw.vocabulary_score, 12),
    strengths: normalizeStringArray(raw.strengths),
    improvements: normalizeStringArray(raw.improvements),
    grammar: normalizeObjectArray(raw.grammar),
    vocabulary: normalizeObjectArray(raw.vocabulary),
    coherence: {
      observations: normalizeStringArray(coherenceObj.observations),
      suggestions: normalizeStringArray(coherenceObj.suggestions),
    },
    exercises: normalizeObjectArray(raw.exercises),
    filler_words_notes:
      typeof raw.filler_words_notes === 'string' && raw.filler_words_notes.trim()
        ? raw.filler_words_notes.trim()
        : 'No specific filler word notes provided.',
  };
}

module.exports = { generateFeedback };
module.exports = { generateFeedback };

