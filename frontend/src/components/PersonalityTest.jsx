// frontend/src/components/PersonalityTest.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import { FaChevronRight, FaChevronLeft, FaMoon, FaSun, FaFire } from 'react-icons/fa';
import { ThemeContext } from '../contexts/ThemeContext';

export default function PersonalityTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/personality/questions`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('jwt')}`
        }
      });
      if (response.data && Array.isArray(response.data)) {
        setQuestions(response.data);
      } else {
        console.error('Invalid questions data format:', response.data);
        throw new Error('Invalid questions data format');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to load personality questions. Please try again later.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Ensure we have all questions answered
      if (!answers || answers.length !== questions.length) {
        throw new Error('Please answer all questions');
      }

      // Format the answers array
      const formattedAnswers = answers.map((answer, index) => {
        // If answer is undefined or invalid, default to first option (index 0)
        if (answer === undefined || typeof answer !== 'number' || answer < 0 || answer >= questions[index].options.length) {
          return 0; // Default to first option
        }
        return parseInt(answer); // Ensure we're sending a number
      });

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/personality/calculate`, 
        { answers: formattedAnswers },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('jwt')}`
          }
        }
      );
      const resultData = response.data;
      navigate('/personality-result', { state: { result: resultData } });
    } catch (error) {
      console.error('Error calculating personality:', error);
      alert(error.response?.data?.message || 'Failed to calculate personality type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background dark:bg-background-dark rounded-2xl shadow-lg dark:shadow-gray-800/50 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            Personality Assessment
          </h1>
          <p className="text-lg text-text-light-secondary dark:text-text-dark-secondary">
            Discover your unique personality traits and strengths
          </p>
        </motion.div>
        
        {!questions.length && (
          <div className="text-center">
            <motion.button 
              onClick={fetchQuestions}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center px-8 py-4 bg-${theme === 'dark' ? 'gray-800' : 'white'} text-${theme === 'dark' ? 'white' : 'black'} rounded-lg font-serif text-xl tracking-wide transition-all hover:bg-${theme === 'dark' ? 'gray-800' : 'white'}/90`}
            >
              Begin Your Journey
            </motion.button>
          </div>
        )}

        {questions.map((question, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background dark:bg-background-dark rounded-lg shadow-sm mb-6"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">{question.text}</h3>
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <motion.label
                    key={optionIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: optionIndex * 0.1 }}
                    className="flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-background/10 dark:hover:bg-background-dark/30 transition-colors duration-300"
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={answers[index] === optionIndex}
                      onChange={(e) => handleAnswerChange(index, parseInt(e.target.value))}
                      className="accent-primary scale-125"
                    />
                    <div className="flex-1">
                      <span className="text-foreground group-hover:text-foreground-dark font-medium">{option.text}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        answers[index] === optionIndex ? 'bg-primary text-white' : 'bg-background/20 text-white/70'
                      }`}>
                        {option.dimension}
                      </span>
                      <span className="text-text-light-secondary dark:text-text-dark-secondary">{option.weight} pts</span>
                    </div>
                  </motion.label>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div 
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 relative z-10"
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-background/20 text-text-light-primary dark:text-text-dark-primary dark:bg-background-dark/30 rounded-xl font-serif text-lg tracking-wide transition-all hover:bg-background/30 dark:hover:bg-background-dark/40 hover:text-foreground"
              >
                <FaChevronLeft className="mr-2" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-serif text-lg tracking-wide text-text-light-primary dark:text-text-dark-primary transition-all shadow-lg dark:shadow-gray-800/50 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaFire className="mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <FaChevronRight className="mr-2" />
                    Reveal Your Personality
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
