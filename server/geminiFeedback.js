const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/**
 * Generates pedagogical language coaching feedback using Gemini.
 * @param {Object} params
 * @param {string} params.question - The speaking task prompt
 * @param {string} params.level - Learner level (e.g. Intermediate)
 * @param {string} params.transcript - Text transcribed by Azure
 * @param {Array} params.azureAssessment - Raw Azure pronunciation metrics
 */
async function generateFeedback({ question, level, transcript, azureAssessment }) {
  const prompt = `
You are an English speaking coach for university students.
Analyze the student's transcript and return personalized feedback.

Practice question: ${question}
Target English level: ${level || "Intermediate"}
Transcript:
${transcript}

Azure speech assessment metrics:
${JSON.stringify(azureAssessment)}

Return ONLY a raw JSON object with this exact shape:
{
  "grammar": [{ "original": "string", "correction": "string", "explanation": "string" }],
  "vocabulary": [{ "original": "string", "suggestion": "string", "reason": "string" }],
  "coherence": { "observations": ["string"], "suggestions": ["string"] },
  "strengths": ["string"],
  "improvements": ["string"],
  "exercises": [{ "task": "string", "reason": "string" }]
}
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text);
}

module.exports = { generateFeedback };
