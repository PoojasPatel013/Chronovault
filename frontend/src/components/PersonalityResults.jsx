// frontend/src/components/PersonalityResults.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const PersonalityResults = () => {
  const { user } = useAuth();
  const [personality, setPersonality] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersonality();
  }, []);

  const fetchPersonality = async () => {
    try {
      const response = await fetch('/api/personality/me');
      const data = await response.json();
      setPersonality(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching personality:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!personality) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">No personality data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-lg p-8"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">{personality.niceName}</h1>
            <p className="text-gray-300 text-lg">{personality.snippet}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {personality.traits.map((trait) => (
              <motion.div
                key={trait.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-700 rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{trait.trait}</h3>
                <div className="relative h-2 bg-gray-600 rounded-full mb-4">
                  <div
                    className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full"
                    style={{ width: `${trait.pct}%` }}
                  ></div>
                </div>
                <p className="text-gray-300">{trait.snippet}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/personality/test"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Take Test Again
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalityResults;