"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserAuth } from "../contexts/AuthContext";
import api from "../api/api";

const Register = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [Username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = UserAuth();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post(`/users/registration`, {
        Username,
        Email,
        Password,
        role,
      });
      if (response.status === 201 && response.data) {
        const { token, user } = response.data;
        if (token) {
          localStorage.setItem("token", token);
        }
        if (setUser) setUser(user);
        alert("Registration successful & logged in!");
        navigate("/login");
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      alert("Registration failed. Please try again.");
      console.error("Registration failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 120,
        damping: 10,
      },
    },
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    blur: {
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 400,
      },
    },
    tap: { scale: 0.95 },
    loading: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 1,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  };

  const blobVariants = {
    animate: {
      x: [0, 100, -50, 0],
      y: [0, -100, 50, 0],
      scale: [1, 1.2, 0.8, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: 20,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  };

  const selectVariants = {
    closed: { rotate: 0 },
    open: { rotate: 180 },
  };

  return (
    <motion.div
      className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 via-white to-pink-100 px-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          variants={blobVariants}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          variants={blobVariants}
          animate="animate"
          transition={{
            delay: 2,
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-40 left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          variants={blobVariants}
          animate="animate"
          transition={{
            delay: 4,
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <motion.form
        onSubmit={submitHandler}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          transition: { duration: 0.3 },
        }}
      >
        {/* Header with animation */}
        <motion.div className="text-center mb-8" variants={headerVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-neutral-800 rounded-full mb-4 shadow-lg"
            whileHover={{
              rotate: 360,
              scale: 1.1,
              transition: { duration: 0.5, type: "spring" },
            }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">🙋🏻‍♀️</span>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Hey there!
          </motion.h2>
          <motion.p
            className="text-gray-600 uppercase tracking-wide text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Create your account
          </motion.p>
        </motion.div>

        <div className="space-y-5">
          {/* Username Input */}
          <motion.div className="group" variants={itemVariants}>
            <motion.label
              className="block text-sm font-semibold mb-2 uppercase text-gray-700 group-focus-within:text-purple-600 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Username
            </motion.label>
            <motion.div className="relative">
              <motion.input
                type="text"
                value={Username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-gray-50/50 hover:bg-white hover:border-gray-300 placeholder-gray-400"
                required
                variants={inputVariants}
                whileFocus="focus"
                whileHover={{ borderColor: "#A855F7" }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 pointer-events-none"
                initial={{ opacity: 0 }}
                whileFocus={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>

          {/* Email Input */}
          <motion.div className="group" variants={itemVariants}>
            <motion.label
              className="block text-sm font-semibold mb-2 uppercase text-gray-700 group-focus-within:text-purple-600 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Email
            </motion.label>
            <motion.div className="relative">
              <motion.input
                type="email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-gray-50/50 hover:bg-white hover:border-gray-300 placeholder-gray-400"
                required
                variants={inputVariants}
                whileFocus="focus"
                whileHover={{ borderColor: "#A855F7" }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 pointer-events-none"
                initial={{ opacity: 0 }}
                whileFocus={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>

          {/* Password Input */}
          <motion.div className="group" variants={itemVariants}>
            <motion.label
              className="block text-sm font-semibold mb-2 uppercase text-gray-700 group-focus-within:text-purple-600 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Password
            </motion.label>
            <motion.div className="relative">
              <motion.input
                type="password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength="6"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-gray-50/50 hover:bg-white hover:border-gray-300 placeholder-gray-400"
                required
                variants={inputVariants}
                whileFocus="focus"
                whileHover={{ borderColor: "#A855F7" }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 pointer-events-none"
                initial={{ opacity: 0 }}
                whileFocus={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>

          {/* Role Select */}
          <motion.div className="group" variants={itemVariants}>
            <motion.label
              className="block text-sm font-semibold mb-2 uppercase text-gray-700 group-focus-within:text-purple-600 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Register as
            </motion.label>
            <motion.div className="relative">
              <motion.select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-gray-50/50 hover:bg-white hover:border-gray-300 appearance-none cursor-pointer"
                required
                variants={inputVariants}
                whileFocus="focus"
                whileHover={{ borderColor: "#A855F7" }}
              >
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
              </motion.select>
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                variants={selectVariants}
                whileFocus="open"
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 pointer-events-none"
                initial={{ opacity: 0 }}
                whileFocus={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-600 to-blue-950 text-white py-3 rounded-xl font-semibold shadow-lg relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
            variants={buttonVariants}
            initial="idle"
            whileHover={!isLoading ? "hover" : "loading"}
            whileTap={!isLoading ? "tap" : {}}
            animate={isLoading ? "loading" : "idle"}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key="loading"
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.svg
                    className="-ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </motion.svg>
                  Creating Account...
                </motion.span>
              ) : (
                <motion.span
                  key="register"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  Register
                </motion.span>
              )}
            </AnimatePresence>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-6 text-center text-sm text-gray-700"
          variants={itemVariants}
        >
          <motion.p
            className="mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Already have an account?
          </motion.p>
          <Link to="/login">
            <motion.span
              className="inline-flex items-center text-purple-600 hover:text-pink-600 font-semibold transition-all duration-300 hover:underline decoration-2 underline-offset-4 cursor-pointer"
              whileHover={{
                scale: 1.05,
                color: "#EC4899",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              Login
              <svg
                className="ml-1 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.span>
          </Link>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default Register;
