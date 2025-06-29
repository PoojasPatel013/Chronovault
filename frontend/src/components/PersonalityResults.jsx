import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { FaStar, FaFire, FaLightbulb, FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from '../contexts/ThemeContext';

const PersonalityResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  const { theme, toggleTheme } = React.useContext(ThemeContext);

  useEffect(() => {
    // If no result is available, redirect to personality test
    if (!result) {
      navigate('/personality-test');
    }
  }, [navigate, result]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-background-secondary p-8 rounded-lg shadow-lg w-full max-w-4xl text-center"
        >
          <h2 className="text-3xl font-display text-primary-color mb-4">Discovering Your Personality...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-${theme === 'dark' ? 'background-dark' : 'background'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <motion.h1 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-serif font-bold mb-6 text-gradient bg-clip-text bg-gradient-to-r from-primary to-secondary"
              >
                Your Personality Profile
              </motion.h1>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="bg-primary/10 rounded-full p-4">
                  <h2 className="text-4xl font-serif font-bold text-primary">{result.type}</h2>
                </div>
                <p className="text-2xl text-white/80 font-serif italic">{result.name}</p>
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Dimension Scores</h3>
                  <button 
                    onClick={() => toggleTheme()}
                    className="p-2 rounded-lg hover:bg-background/10 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {theme === 'dark' ? (
                      <FaSun className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <FaMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(result.scores).map(([dimension, score]) => (
                    <motion.div
                      key={dimension}
                      initial={{ width: '0%' }}
                      animate={{ width: `${score}%` }}
                      className="relative bg-secondary/20 rounded-full overflow-hidden h-10 relative z-0"
                    >
                      <div className="h-full bg-gradient-to-r from-primary to-secondary flex items-center px-4 relative bg-white/5 dark:bg-gray-800/50">
                        <div className="flex flex-col items-center text-white absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-semibold">{dimension}</span>
                          <span className="text-2xl font-bold">{score}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="bg-gradient-to-b from-background/5 to-background/10 rounded-2xl shadow-xl mb-16">
              <div className="space-y-8 p-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-primary opacity-10 rounded-lg"></div>
                  <div className="relative p-6 rounded-lg bg-secondary">
                    <h3 className="font-serif text-2xl font-semibold mb-4">Your Personality Traits</h3>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-serif text-xl font-semibold">Personality Type</h4>
                        <div className="bg-primary text-white px-6 py-3 rounded-lg text-center">
                          <span className="text-2xl font-serif">{result.type}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-serif text-xl font-semibold">Description</h4>
                        <p className="text-lg text-white/70">{result.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {result.traits.map((trait, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-background/10 to-background/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="space-y-4 p-6">
                        <div className="flex items-center gap-3">
                          <FaStar className="text-yellow-400" />
                          <h4 className="font-serif text-xl font-semibold">Trait {index + 1}</h4>
                        </div>
                        <p className="text-lg text-white/80">{trait}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="fixed bottom-4 right-4 z-50">
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-serif text-xl tracking-wide transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FaLightbulb className="mr-2" />
                Return to Dashboard
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PersonalityResult;