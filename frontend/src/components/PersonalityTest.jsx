// frontend/src/components/PersonalityTest.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PersonalityTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/personality/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/personality/calculate', { answers });
      setResult(response.data);
      navigate('/personality-result');
    } catch (error) {
      console.error('Error calculating personality:', error);
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
