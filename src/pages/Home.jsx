import React, { useState } from "react";
import { api } from "@/api/client";
import TopNav from "@/components/TopNav";
import PracticeSetup from "@/components/practice/PracticeSetup";
import ResearchPhase from "@/components/practice/ResearchPhase";
import PresentationPhase from "@/components/practice/PresentationPhase";
import EvaluationResults from "@/components/practice/EvaluationResults";

export default function Home() {
  const [stage, setStage] = useState("setup"); // setup | research | presentation | results
  const [session, setSession] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (language, category, speakingTimeLimit, difficulty, evaluationScale) => {
    setGenerating(true);
    setError(null);
    try {
      const data = await api.functions.generateTopic({ language, category, difficulty });
      if (data.error) throw new Error(data.error);

      const created = await api.sessions.create({
        language,
        category,
        difficulty,
        topic: data.topic,
        topic_guidance: data.reading_text || "",
        status: "research",
        research_duration_seconds: 900,
        speaking_time_limit: speakingTimeLimit,
        evaluation_scale: evaluationScale,
      });

      setSession({
        ...created,
        _reading_text: data.reading_text || "",
        _key_facts: data.key_facts || [],
        _vocabulary: data.vocabulary || [],
        _description: data.description || "",
      });
      setStage("research");
    } catch (e) {
      setError(e.message || "Failed to generate topic. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleStartPresentation = async () => {
    if (!session) return;
    setStage("presentation");
    try {
      await api.sessions.update(session.id, { status: "presentation" });
    } catch {
      // non-fatal
    }
  };

  const handleNewTopic = () => {
    if (session?.id) {
      api.sessions.update(session.id, { status: "abandoned" }).catch(() => {});
    }
    setSession(null);
    setError(null);
    setStage("setup");
  };

  const handleComplete = async (audioBlob, durationSeconds) => {
    setAnalyzing(true);
    setError(null);
    try {
      const upload = await api.uploadFile(audioBlob);
      const file_url = upload.file_url;

      const evalData = await api.functions.analyzePresentation({
        audio_url: file_url,
        language: session.language,
        topic: session.topic,
        speaking_duration_seconds: durationSeconds,
        evaluation_scale: session.evaluation_scale,
      });
      if (evalData.error) throw new Error(evalData.error);

      setEvaluation(evalData);

      await api.sessions.update(session.id, {
        status: "completed",
        recording_url: file_url,
        transcript: evalData.transcript,
        speaking_duration_seconds: durationSeconds,
        overall_score: evalData.overall_score ?? null,
        overall_band: evalData.overall_band ?? null,
        content_score: evalData.content_score ?? null,
        fluency_score: evalData.fluency_score,
        grammar_score: evalData.grammar_score,
        vocabulary_score: evalData.vocabulary_score,
        pronunciation_score: evalData.pronunciation_score ?? null,
        feedback_summary: evalData.feedback_summary,
        strengths: evalData.strengths,
        improvements: evalData.improvements,
        filler_words_notes: evalData.filler_words_notes,
      });

      setStage("results");
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewSession = () => {
    setSession(null);
    setEvaluation(null);
    setError(null);
    setStage("setup");
  };

  return (
    <div className="min-h-screen">
      <TopNav />

      {error && (
        <div className="mx-auto mt-4 max-w-2xl px-6">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        </div>
      )}

      {stage === "setup" && <PracticeSetup onGenerate={handleGenerate} loading={generating} />}
      {stage === "research" && (
        <ResearchPhase session={session} onStart={handleStartPresentation} onNewTopic={handleNewTopic} />
      )}
      {stage === "presentation" && (
        <PresentationPhase session={session} onComplete={handleComplete} analyzing={analyzing} />
      )}
      {stage === "results" && (
        <EvaluationResults evaluation={evaluation} session={session} onNewSession={handleNewSession} />
      )}
    </div>
  );
}
