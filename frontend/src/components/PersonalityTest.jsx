"use client"

import { useState } from "react";
import { motion } from "framer-motion";

const questions = [
  { id: 1, text: "You regularly make new friends.", trait: "extraversion" },
  {
    id: 2,
    text: "You spend a lot of your free time exploring various random topics that pique your interest.",
    trait: "intuition",
  },
  { id: 3, text: "Seeing other people cry can easily make you feel like you want to cry too.", trait: "feeling" },
  { id: 4, text: "You often make a backup plan for a backup plan.", trait: "judging" },
  { id: 5, text: "You usually stay calm, even under a lot of pressure.", trait: "turbulent" },
];

const PersonalityTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [personalityType, setPersonalityType] = useState("");

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculatePersonality();
    }
  };

  const calculatePersonality = () => {
    const traits = {
      extraversion: 0,
      intuition: 0,
      feeling: 0,
      judging: 0,
      turbulent: 0,
    };

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find((q) => q.id === Number(questionId));
      if (question) {
        traits[question.trait] += answer;
      }
    });

    const type = [
      traits.extraversion > 0 ? "E" : "I",
      traits.intuition > 0 ? "N" : "S",
      traits.feeling > 0 ? "F" : "T",
      traits.judging > 0 ? "J" : "P",
      traits.turbulent > 0 ? "T" : "A",
    ].join("");

    setPersonalityType(type);
    setShowResult(true);
  };

  const progressPercentage = (currentQuestion / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          Personality Test
        </motion.h1>

        {!showResult ? (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <p className="text-xl mb-6">{questions[currentQuestion].text}</p>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value)}
                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                  >
                    {value === 1 && "Strongly Disagree"}
                    {value === 2 && "Disagree"}
                    {value === 3 && "Neutral"}
                    {value === 4 && "Agree"}
                    {value === 5 && "Strongly Agree"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded-lg shadow-md text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Your Personality Type</h2>
            <p className="text-5xl font-bold text-blue-500 mb-6">{personalityType}</p>
            <p className="text-xl">
              Congratulations! You've completed the personality test. Your result indicates that you're a {personalityType} type.
            </p>
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setShowResult(false);
              }}
              className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition-colors"
            >
              Retake Test
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PersonalityTest;