const { GoogleGenAI } = require('@google/genai');

let client = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

const clamp100 = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
const strings = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).slice(0, 5) : []);

/**
 * Asks Gemini to grade WHAT the student said (content, vocabulary, grammar, coherence).
 * HOW it sounded (fluency, pronunciation) comes from Azure and is passed in only as context.
 *
 * Returns 0–100 scores plus written feedback. Throws if Gemini is unavailable —
 * the caller must not replace a failure with made-up numbers.
 */
async function generateFeedback({ topic, language, level, transcript, durationSeconds, wordCount, wpm, azure }) {
  const prompt = `
You are a strict but kind examiner of spoken ${language} for university students.
Grade ONLY what is in the transcript. Do not reward things the student did not say.

Speaking task: ${topic}
Learner level: ${level || 'intermediate'}
Speaking time: ${Math.round(durationSeconds)} seconds, ${wordCount} words, ${wpm} words per minute
Speech-recognition metrics (0-100): fluency ${azure.fluency ?? 'n/a'}, pronunciation ${azure.pronunciation ?? 'n/a'}
Words that were hard to understand: ${azure.mispronounced.map((w) => w.word).join(', ') || 'none'}

Transcript (automatic speech recognition, may contain small recognition errors):
"""
${transcript}
"""

Scoring rules (each score is an integer 0-100):
- content: relevance to the task, development of ideas, examples. Off-topic or very short answers score low.
- vocabulary: range and accuracy of words for this topic.
- grammar: range and accuracy of grammar. Count real errors.
- coherence: logical order, linking words, a clear ending.
A one-sentence answer cannot score above 30 on content. Be consistent: the same answer must get the same scores.

Write all feedback in English, addressed to the student ("you").
Return ONLY a JSON object with exactly this shape:
{
  "content": 0,
  "vocabulary": 0,
  "grammar": 0,
  "coherence": 0,
  "feedback_summary": "2-3 sentences",
  "strengths": ["specific strength quoting the transcript"],
  "improvements": ["specific, actionable tip"],
  "grammar_errors": [{ "original": "", "correction": "" }],
  "filler_words_notes": "one sentence about fillers (um, uh, like) and pauses"
}`;

  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json', temperature: 0.2 },
  });

  let data;
  try {
    data = JSON.parse(response.text);
  } catch {
    throw new Error('Gemini returned invalid JSON');
  }

  return {
    content: clamp100(data.content),
    vocabulary: clamp100(data.vocabulary),
    grammar: clamp100(data.grammar),
    coherence: clamp100(data.coherence),
    feedback_summary: typeof data.feedback_summary === 'string' ? data.feedback_summary : '',
    strengths: strings(data.strengths),
    improvements: strings(data.improvements),
    grammar_errors: Array.isArray(data.grammar_errors) ? data.grammar_errors.slice(0, 10) : [],
    filler_words_notes: typeof data.filler_words_notes === 'string' ? data.filler_words_notes : '',
  };
}

module.exports = { generateFeedback };
