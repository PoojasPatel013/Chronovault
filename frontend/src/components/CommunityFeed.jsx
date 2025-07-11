"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { FaHeart, FaComment, FaShare, FaRegHeart } from "react-icons/fa";

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/community-feed", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      
      // Randomize posts for varied viewing experience
      const randomizedPosts = [...data].sort(() => Math.random() - 0.5);
      
      setPosts(randomizedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/community-feed/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

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

        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg"
            >
              {/* Post Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    {post.user.avatar ? (
                      <img
                        src={post.user.avatar}
                        alt={`${post.user.username} avatar`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">{post.user.username[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{post.user.username}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="text-gray-400 hover:text-white">
                    <FaShare size={20} />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <p className="mb-4">{post.content}</p>

                {post.file && post.file.type.startsWith('image') && (
                  <img
                    src={post.file.url}
                    alt="Post"
                    className="w-full rounded-lg"
                  />
                )}

                {post.file && post.file.type === 'application/pdf' && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">PDF Document</h4>
                    <a
                      href={post.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      View PDF
                    </a>
                  </div>
                )}
              </div>

              {/* Post Footer */}
              <div className="border-t border-gray-700 p-4 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white"
                  >
                    <FaHeart size={20} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
                    <FaComment size={20} />
                    <span>{post.comments}</span>
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button className="text-gray-400 hover:text-white">
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-8 h-8 border-4 border-white rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;