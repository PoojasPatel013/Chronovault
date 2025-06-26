// frontend/src/components/PersonalityTest.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ANSWER_VALUES = {
  'Disagree strongly': -3,
  'Disagree moderately': -2,
  'Disagree a little': -1,
  'Neither agree nor disagree': 0,
  'Agree a little': 1,
  'Agree moderately': 2,
  'Agree strongly': 3
};

const ANSWER_OPTIONS = Object.entries(ANSWER_VALUES).map(([text, value]) => ({
  text,
  value
}));

const PersonalityTest = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/personality/questions');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load questions');
      }
      setQuestions(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
      setLoading(false);
    }
  };

  const handleAnswer = (value) => {
    const questionId = questions[currentQuestion].id;
    const existingAnswer = answers.find(a => a.id === questionId);
    
    if (existingAnswer) {
      existingAnswer.value = value;
    } else {
      answers.push({ id: questionId, value });
    }
    
    setAnswers([...answers]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to take the personality test');
      return;
    }

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/personality/type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers,
          gender: user.gender || 'Other'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get personality type');
      }

      const data = await response.json();
      window.location.href = '/personality/results';
    } catch (err) {
      setError(err.message);
      console.error('Error submitting personality test:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">No questions loaded</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Personality Test</h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-8">
            <p className="text-gray-300">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <h2 className="text-xl font-semibold text-white mt-2">
              {questions[currentQuestion].text}
            </h2>
          </div>
          <div className="space-y-4">
            {ANSWER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-md text-white hover:bg-gray-700 transition-colors"
              >
                {option.text}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 border border-gray-700 rounded-md text-white hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex space-x-4">
              {currentQuestion < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 border border-gray-700 rounded-md text-white hover:bg-gray-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityTest;