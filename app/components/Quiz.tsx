"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, Trophy, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

type Question = { question: string; choices: string[]; answer: string };

export default function Quiz() {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [start, setStart] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState(3);

  const hasUsedFree = useCallback(() => localStorage.getItem("freeUsed") === "true", []);

  const startQuiz = useCallback(async () => {
    if (!topic.trim()) return;
    if (!isSignedIn && hasUsedFree()) {
      alert("You've used your free quiz. Sign in to generate more.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isSignedIn ? {} : { "x-free-used": hasUsedFree().toString() }),
        },
        body: JSON.stringify({ topic, level }),
      });
      if (!res.ok) {
        const err = await res.text();
        alert(err || "Something went wrong.");
        setLoading(false);
        return;
      }
      const data: Question[] = await res.json();
      setQuestions(data);
      setStart(true);
      setShowScore(false);
      setScore(0);
      setCurrent(0);
      setSelected(null);
    } catch {
      alert("Error generating quiz. Please try again.");
    } finally {
      setLoading(false);
    }
    if (!isSignedIn) localStorage.setItem("freeUsed", "true");
  }, [topic, level, isSignedIn, hasUsedFree]);

  const restartQuiz = useCallback(() => {
    setScore(0);
    setCurrent(0);
    setStart(false);
    setShowScore(false);
    setSelected(null);
    setQuestions([]);
  }, []);

  const handleAnswer = useCallback(
    (choice: string) => {
      if (selected) return;
      setSelected(choice);
      if (choice === questions[current].answer) setScore((s) => s + 1);
      setTimeout(() => {
        if (current + 1 < questions.length) {
          setCurrent((prev) => prev + 1);
          setSelected(null);
        } else {
          setShowScore(true);
        }
      }, 800);
    },
    [questions, current, selected]
  );

  const currentQ = questions[current];

  return (
    <div>
      {/* Top-right auth buttons */}
      <div className="absolute top-4 right-4 z-50">
        {!isSignedIn ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => signIn()}
              className="text-gray-300 hover:text-white font-medium rounded-lg px-4 py-2 transition hover:bg-gray-800"
            >
              Sign In
            </button>
            <button
              onClick={() => signIn()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm sm:text-base h-10 px-5 cursor-pointer transition shadow-lg hover:shadow-indigo-500/20"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Image
              src={session.user?.image || "/placeholder-avatar.png"}
              alt="User Avatar"
              width={36}
              height={36}
              className="rounded-full border border-gray-600"
            />
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg px-3 py-1.5 transition hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Quiz UI below */}
      <div className="flex flex-col items-center justify-center w-full px-4 py-10">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-2xl bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-6 md:p-8"
        >
        {/* Start Form */}
        {!start && !loading && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              startQuiz();
            }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col items-center mb-4">
              <div>
                <Image src="/logo.png" alt="Logo" width={175} height={100} className="rounded-lg" />
              </div>
              <p className="text-gray-400 text-center max-w-md">
                Generate custom quizzes on any topic in seconds
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Topic</label>
              <input
                type="text"
                className="w-full rounded-lg bg-gray-700/50 border border-gray-600 px-5 py-3.5 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-medium"
                placeholder="e.g., Quantum Physics, French Revolution..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">
                Difficulty
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full rounded-lg bg-slate-800 border border-gray-600 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none"
              >
                <option value={1}>Beginner</option>
                <option value={2}>Easy</option>
                <option value={3}>Intermediate</option>
                <option value={4}>Hard</option>
                <option value={5}>Expert</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl py-3.5 text-lg shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
            >
              Generate Quiz 
              <motion.span
                initial={{ x: -5 }}
                animate={{ x: 0 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
          </motion.form>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="h-10 w-10 border-3 border-indigo-500 border-t-transparent rounded-full"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-gray-400 font-medium text-center"
            >
              Crafting your <span className="text-indigo-300">{topic}</span>{" "}
              quiz...
              <br />
              <span className="text-sm text-gray-500">Powered by AI</span>
            </motion.p>
          </motion.div>
        )}

        {/* Quiz In Progress */}
        {start && !showScore && !loading && currentQ && (
          <AnimatePresence mode="wait">
            <motion.section
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-indigo-400">
                  Question {current + 1} of {questions.length}
                </div>
                <div className="text-sm font-medium text-gray-400">
                  Score: {score}
                </div>
              </div>

              <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((current + 1) / questions.length) * 100}%`,
                  }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-100 leading-snug">
                {currentQ.question}
              </h2>

              <div className="space-y-3">
                {currentQ.choices.map((choice, idx) => {
                  const isCorrect = choice === currentQ.answer;
                  const isWrong = selected === choice && !isCorrect;
                  const isSelected = selected === choice;
                  const isDisabled = !!selected;

                  let buttonClass =
                    "bg-gray-700/70 hover:bg-gray-700 text-gray-100";
                  if (selected) {
                    if (isCorrect) {
                      buttonClass = "bg-green-600/90 text-white";
                    } else if (isWrong) {
                      buttonClass = "bg-red-600/90 text-white";
                    } else {
                      buttonClass = "bg-gray-800/50 text-gray-500";
                    }
                  }

                  return (
                    <motion.button
                      key={`${current}-${idx}`}
                      disabled={isDisabled}
                      onClick={() => handleAnswer(choice)}
                      whileHover={!isDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      className={`w-full text-left rounded-xl px-5 py-3.5 font-medium transition-all flex items-center justify-between ${buttonClass}`}
                    >
                      <span>{choice}</span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <XCircle className="w-5 h-5 text-white" />
                          )}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          </AnimatePresence>
        )}

        {/* Score screen */}
        {showScore && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-2">
              Quiz Completed!
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              You scored{" "}
              <span className="text-2xl font-bold text-white">{score}</span> out
              of <span className="text-white">{questions.length}</span>
            </p>

            <div className="w-full bg-gray-700/50 h-3 rounded-full overflow-hidden mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(score / questions.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className={`h-full ${
                  score / questions.length > 0.7
                    ? "bg-green-500"
                    : score / questions.length > 0.4
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={restartQuiz}
              className="w-full max-w-xs mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl px-6 py-3.5 text-lg shadow-lg transition-all"
            >
              Start New Quiz
            </motion.button>
          </motion.section>
        )}
        </motion.div>
      </div>
    </div>
  );
}