
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateFeedback({
  question,
  level,
  transcript,
  azureAssessment
}) {
  const prompt = `
You are an experienced English speaking coach.

Analyze the student's actual spoken response.

Practice question: ${question}
Target English level: ${level || "Intermediate"}

Student transcript:
${transcript}

Azure pronunciation and fluency assessment:
${JSON.stringify(azureAssessment)}

IMPORTANT RULES:
1. Analyze only the provided transcript.
2. Never invent mistakes or sentences that are not present.
3. If the student's grammar is correct, return an empty grammar array.
4. Do not invent pronunciation errors. Use Azure metrics as evidence.
5. Give specific explanations and practical recommendations.
6. Evaluate content relevance to the practice question.
7. Do not confuse spoken informal language with grammatical errors.
8. All feedback must be in English.

Return ONLY valid JSON with this structure:

{
  "feedback_summary": "string",

  "grammar": [
    {
      "original": "string",
      "correction": "string",
      "explanation": "string"
    }
  ],

  "vocabulary": [
    {
      "original": "string",
      "suggestion": "string",
      "reason": "string"
    }
  ],

  "coherence": {
    "observations": ["string"],
    "suggestions": ["string"]
  },

  "content_score": 0,
  "grammar_score": 0,
  "vocabulary_score": 0,

  "strengths": ["string"],
  "improvements": ["string"],

  "exercises": [
    {
      "task": "string",
      "reason": "string"
    }
  ],

  "filler_words_notes": "string"
}

Scoring:
- content_score: 0-25
- grammar_score: 0-25
- vocabulary_score: 0-25

Be fair to the student's target level.
Do not award points based on recording duration alone.
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const result = JSON.parse(response.text);

  if (
    !result ||
    !Array.isArray(result.grammar) ||
    !Array.isArray(result.vocabulary) ||
    !Array.isArray(result.strengths) ||
    !Array.isArray(result.improvements)
  ) {
    throw new Error("Invalid Gemini response structure");
  }

  return result;
}

module.exports = { generateFeedback };
