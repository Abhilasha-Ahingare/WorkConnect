"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { UserAuth } from "../contexts/AuthContext"
import api from "../api/api"
import { toast } from "react-toastify"

const Login = () => {
  const [Email, setEmail] = useState("")
  const [Password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, StoreToken } = UserAuth()
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data } = await api.post(`/users/login`, { Email, Password })
      StoreToken(data.token)
      setUser(data.user)
      toast.success("Login successful!")
      if (data.user.role === "admin") navigate("/get_admin")
      else if (data.user.role === "organizer") navigate("/dashboard")
      else navigate("/home")
    } catch (err) {
      console.error("Login failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

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
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 },
    },
  }

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
  }

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
  }

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    blur: {
      scale: 1,
      transition: { duration: 0.2 },
    },
  }

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
  }

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
  }

  return (
    <motion.div
      className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-cyan-100 px-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          variants={blobVariants}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          variants={blobVariants}
          animate="animate"
          transition={{ delay: 2, duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          variants={blobVariants}
          animate="animate"
          transition={{ delay: 4, duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg"
            whileHover={{
              rotate: 360,
              scale: 1.1,
              transition: { duration: 0.5, type: "spring" },
            }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-2xl">💬</span>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Welcome Back!
          </motion.h2>
          <motion.p
            className="text-gray-600 uppercase tracking-wide text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Login to your account
          </motion.p>
        </motion.div>

        <div className="space-y-6">
          {/* Email Input */}
          <motion.div className="group" variants={itemVariants}>
            <motion.label
              className="block text-sm font-semibold mb-2 uppercase text-gray-700 group-focus-within:text-blue-600 transition-colors duration-200"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-gray-50/50 hover:bg-white hover:border-gray-300 placeholder-gray-400"
                placeholder="Enter your email"
                required
                variants={inputVariants}
                whileFocus="focus"
                onFocus={() => {}}
                onBlur={() => {}}
                whileHover={{ borderColor: "#3B82F6" }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 pointer-events-none"
                initial={{ opacity: 0 }}
                whileFocus={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>

          {/* Password Input */}
          <motion.div className="group" variants={itemVariants}>
            <motion.label
              className="block text-sm font-semibold mb-2 uppercase text-gray-700 group-focus-within:text-blue-600 transition-colors duration-200"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-gray-50/50 hover:bg-white hover:border-gray-300 placeholder-gray-400"
                placeholder="Enter your password"
                minLength="6"
                required
                variants={inputVariants}
                whileFocus="focus"
                whileHover={{ borderColor: "#3B82F6" }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 pointer-events-none"
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
            className="w-full bg-gradient-to-r from-neutral-800 to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
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
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </motion.svg>
                  Logging in...
                </motion.span>
              ) : (
                <motion.span
                  key="login"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  Login
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
        <motion.div className="mt-8 text-center text-sm text-gray-700" variants={itemVariants}>
          <motion.p
            className="mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Don't have an account?
          </motion.p>
          <Link to="/registration">
            <motion.span
              className="inline-flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-all duration-300 hover:underline decoration-2 underline-offset-4 cursor-pointer"
              whileHover={{
                scale: 1.05,
                color: "#7C3AED",
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              Create Account
              <motion.svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </motion.span>
          </Link>
        </motion.div>
      </motion.form>
    </motion.div>
  )
}

export default Login
