// frontend/src/components/PersonalityTest.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';

export default function PersonalityTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <div className="max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-4xl font-serif font-bold text-center text-primary mb-8">Personality Assessment</h1>
        
        {!questions.length && (
          <div className="text-center">
            <motion.button 
              onClick={fetchQuestions}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg font-serif text-xl tracking-wide transition-all hover:bg-primary-hover"
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
            className="bg-secondary rounded-lg shadow-sm mb-6"
          >
            <div className="space-y-4 p-6">
              <h3 className="font-serif text-xl font-semibold">{question.text}</h3>
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <label 
                    key={optionIndex}
                    className="flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={answers[index] === optionIndex}
                      onChange={() => handleAnswerChange(index, optionIndex)}
                      className="h-5 w-5 text-primary border-2 border-primary/30"
                    />
                    <span className="text-lg flex-1">{option.text}</span>
                  </label>
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
            <motion.button
              type="submit"
              disabled={loading || answers.length !== questions.length}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white rounded-lg py-4 font-serif text-xl tracking-wide transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Reveal Your Personality'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
