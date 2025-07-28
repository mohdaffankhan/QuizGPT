"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
type Question = {
  question: string;
  choices: string[];
  answer: string;
};

export default function Quiz() {
  const { isSignedIn } = useUser();

  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [start, setStart] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState(3);

  const hasUsedFree = () => {
    return localStorage.getItem("freeUsed") === "true";
  };

  const startQuiz = async () => {
    if (!topic.trim()) return;

    if (!isSignedIn && hasUsedFree()) {
      alert("You've used your free quiz. Sign in to generate more.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(isSignedIn ? {} : { "x-free-used": hasUsedFree().toString() }),
      },
      body: JSON.stringify({ topic, level }),
    });

    if (!res.ok) {
      const errText = await res.text();
      alert(errText || "Something went wrong.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setQuestions(data);
    setStart(true);
    setLoading(false);

    if (!isSignedIn) {
      localStorage.setItem("freeUsed", "true");
    }
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrent(0);
    setStart(false);
    setShowScore(false);
    setSelected(null);
    setTopic("");
    setQuestions([]);
  };

  const handleAnswer = (choice: string) => {
    setSelected(choice);
    if (choice === questions[current].answer) setScore((s) => s + 1);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((prev) => prev + 1);
        setSelected(null);
      } else {
        setShowScore(true);
      }
    }, 1000);
  };

  const currentQ = questions[current];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-2xl backdrop-blur-xl bg-slate-800/60 border border-slate-600/30 rounded-2xl shadow-2xl p-6 sm:p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-indigo-200">
            AI Quiz Generator
          </h1>
        </div>

        {/* Start Screen */}
        {!start && !loading && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startQuiz();
            }}
          >
            <input
              className="w-full px-4 py-3 rounded-lg border border-slate-500 mb-4 bg-slate-700/40 placeholder:text-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter a topic (e.g., JavaScript)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            {/* Difficulty Level Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-500 bg-slate-700/40 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value={1}>1 - Beginner</option>
                <option value={2}>2 - Easy</option>
                <option value={3}>3 - Intermediate</option>
                <option value={4}>4 - Hard</option>
                <option value={5}>5 - Expert</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 transition-all duration-200 px-4 py-3 rounded-lg font-medium text-white text-lg"
            >
              Generate Quiz
            </button>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-400 mx-auto mb-6" />
            <p className="text-base text-slate-300">
              Generating quiz on{" "}
              <span className="text-indigo-200">{topic}</span>...
            </p>
          </div>
        )}

        {/* Quiz in Progress */}
        {start && !showScore && !loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-6 text-indigo-200">
                {currentQ.question}
              </h2>
              <div className="grid gap-4">
                {currentQ.choices.map((choice) => {
                  const isCorrect = choice === currentQ.answer;
                  const isWrong = selected === choice && !isCorrect;

                  return (
                    <button
                      key={choice}
                      onClick={() => handleAnswer(choice)}
                      disabled={!!selected}
                      className={`w-full flex items-center justify-between px-5 py-3 text-left rounded-xl border text-base font-medium transition-all duration-200
                        ${
                          selected
                            ? isCorrect
                              ? "bg-emerald-400/10 border-emerald-300/40 text-emerald-300"
                              : isWrong
                              ? "bg-rose-400/10 border-rose-300/40 text-rose-300"
                              : "bg-slate-700/30 border-slate-600 text-slate-400 opacity-60"
                            : "bg-slate-700/40 hover:bg-slate-600/40 hover:border-indigo-300 hover:text-indigo-200 border-slate-600 text-slate-200"
                        }`}
                    >
                      <span>{choice}</span>
                      {selected &&
                        (isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-emerald-300" />
                        ) : isWrong ? (
                          <XCircle className="w-5 h-5 text-rose-300" />
                        ) : null)}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 text-sm text-slate-400 text-right">
                Question <span className="font-medium">{current + 1}</span> of{" "}
                {questions.length}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Score screen */}
        {showScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-10"
          >
            <h2 className="text-3xl font-semibold mb-4 text-violet-200">
              🎉 Quiz Completed
            </h2>
            <p className="mb-6 text-lg text-slate-200">
              You got <span className="text-cyan-300 font-bold">{score}</span>{" "}
              out of{" "}
              <span className="text-slate-100 font-bold">
                {questions.length}
              </span>
            </p>
            <button
              onClick={restartQuiz}
              className="bg-indigo-500 hover:bg-indigo-600 hover:ring-2 hover:ring-indigo-300 transition-all duration-200 px-6 py-3 rounded-lg font-medium text-white text-lg"
            >
              Try Another Topic
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
