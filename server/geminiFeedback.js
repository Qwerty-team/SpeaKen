

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

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

  const response = await ai.models.generateContent({
    let response;
    let lastError;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });
    
        break;
      } catch (error) {
        lastError = error;
    
        const status = Number(error.status || error.code);
    
        // Retry only temporary server or rate-limit errors.
        if (![429, 500, 503, 504].includes(status)) {
          throw error;
        }
    
        if (attempt === 2) {
          throw error;
        }
    
        const delay = 1000 * Math.pow(2, attempt);
    
        console.log(
          `Gemini temporary error ${status}. Retry ${attempt + 1}/2 in ${delay}ms`
        );
    
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (!response) {
      throw lastError || new Error('Gemini did not return a response');
    }
  });

  let result;

  try {
    result = JSON.parse(response.text);
  } catch (error) {
    throw new Error('Gemini returned invalid JSON');
  }

  if (!result || typeof result !== 'object') {
    throw new Error('Invalid Gemini response');
  }

  const scoreFields = [
    'content_score',
    'grammar_score',
    'vocabulary_score'
  ];

  for (const field of scoreFields) {
    if (
      typeof result[field] !== 'number' ||
      !Number.isFinite(result[field]) ||
      result[field] < 0 ||
      result[field] > 25
    ) {
      throw new Error(`Gemini returned an invalid ${field}`);
    }
  }

  const arrayFields = [
    'strengths',
    'improvements',
    'grammar',
    'vocabulary',
    'exercises'
  ];

  for (const field of arrayFields) {
    if (!Array.isArray(result[field])) {
      throw new Error(`Gemini returned an invalid ${field} array`);
    }
  }

  return result;
}

module.exports = { generateFeedback };

