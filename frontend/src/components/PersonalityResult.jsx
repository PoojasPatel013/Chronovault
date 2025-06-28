// frontend/src/components/PersonalityResult.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PersonalityResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, personalityType } = useAuth();
  const result = location.state?.result || personalityType;

  useEffect(() => {
    // If no personality type is available, redirect to personality test
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
    <div className="min-h-screen bg-secondary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-bold mb-4">Your Personality Profile</h1>
            <h2 className="text-3xl font-serif font-semibold text-primary mb-8">{result.type}</h2>
            <p className="text-xl text-white/70 mb-8">{result.name}</p>
          </div>

          <div className="bg-primary/5 rounded-lg shadow-lg mb-16">
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
                {result.keyTraits.map((trait, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary rounded-lg shadow-sm"
                  >
                    <div className="space-y-4 p-6">
                      <h4 className="font-serif text-xl font-semibold">{trait.title}</h4>
                      <p className="text-lg text-white/70">{trait.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg font-serif text-xl tracking-wide transition-all hover:bg-primary-hover"
            >
              Return to Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalityResult;
