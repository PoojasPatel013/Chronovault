"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CommunityFeed = () => {
  const [capsules, setCapsules] = useState([]);
  const [publicSessions, setPublicSessions] = useState([]);
  const [credits, setCredits] = useState(0);
  const [appUpdates, setAppUpdates] = useState([]);

  useEffect(() => {
    // Fetch public capsules, sessions, and app updates from the backend
    const fetchData = async () => {
      // Simulated API calls
      const capsulesResponse = await fetch("/api/timecapsules/public");
      const capsulesData = await capsulesResponse.json();
      setCapsules(capsulesData);

      const sessionsResponse = await fetch("/api/public-sessions");
      const sessionsData = await sessionsResponse.json();
      setPublicSessions(sessionsData);

      const creditsResponse = await fetch("/api/user");
      const creditsData = await creditsResponse.json();
      setCredits(creditsData.credits);

      const updatesResponse = await fetch("/api/app-updates");
      const updatesData = await updatesResponse.json();
      setAppUpdates(updatesData);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          Community Feed
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-2 space-y-8"
          >
            <div>
              <h2 className="text-2xl font-semibold mb-4">Public Capsules</h2>
              <div className="space-y-4">
                {capsules.map((capsule) => (
                  <motion.div
                    key={capsule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 p-4 rounded-lg shadow-md"
                  >
                    <p className="text-lg mb-2">{capsule.content}</p>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>By {capsule.createdBy}</span>
                      <span>{new Date(capsule.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span>❤️ {capsule.likes}</span>
                      <span>💬 {capsule.comments}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">App Updates</h2>
              <div className="space-y-4">
                {appUpdates.map((update) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 p-4 rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
                    <p className="text-sm text-gray-300 mb-2">{update.description}</p>
                    <p className="text-xs text-gray-400">Released on {new Date(update.date).toLocaleDateString()}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Chrono-Credits</h2>
              <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-3xl font-bold">{credits}</p>
                <p className="text-sm text-gray-400">Available credits</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Upcoming Public Sessions</h2>
              <div className="space-y-4">
                {publicSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 p-4 rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                    <p className="text-sm text-gray-400 mb-1">Host: {session.host}</p>
                    <p className="text-sm text-gray-400 mb-1">
                      Date: {new Date(session.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-400 mb-1">Age Group: {session.ageGroup}</p>
                    <p className="text-sm text-gray-400">
                      Participants: {session.participants}/{session.maxParticipants}
                    </p>
                    <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors">
                      Join Session
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;