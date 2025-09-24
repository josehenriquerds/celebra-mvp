"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginCadastro() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e9e6f7] to-[#c3b6e6] px-2">
      <div className="relative w-full max-w-4xl h-[600px] md:h-[500px] shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row bg-white">
        {/* Painel Lateral Roxo */}
        <motion.div
          initial={false}
          animate={{ x: isLogin ? 0 : '-100%' }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute md:static z-20 md:z-10 top-0 left-0 w-full md:w-1/2 h-2/5 md:h-full bg-gradient-to-br from-[#7b2ff2] to-[#f357a8] text-white flex flex-col justify-center items-center p-8 md:p-12 rounded-b-3xl md:rounded-l-3xl md:rounded-br-none shadow-lg"
          style={{ boxShadow: '0 8px 32px 0 rgba(123,47,242,0.2)' }}
        >
          <motion.h2
            key={isLogin ? 'welcome' : 'join'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-extrabold mb-2 md:mb-4 text-center drop-shadow-lg"
          >
            {isLogin ? "Welcome back!" : "Join us!"}
          </motion.h2>
          <motion.p
            key={isLogin ? 'desc-login' : 'desc-cadastro'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center max-w-xs md:max-w-sm text-base md:text-lg opacity-90"
          >
            {isLogin
              ? "You can sign in to access with your existing account."
              : "Create your account and enjoy managing your events in style."}
          </motion.p>
        </motion.div>

        {/* Formulários */}
        <div className="relative flex-1 flex items-center justify-center h-full z-30">
          <AnimatePresence mode="wait" initial={false}>
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl p-8 md:p-12 shadow-lg flex flex-col justify-center"
                autoComplete="off"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-[#222] mb-6 text-center">Sign In</h2>
                <label className="mb-2 text-sm font-medium text-gray-700">Username or email</label>
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  className="border border-gray-300 p-3 rounded-lg mb-4 w-full focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] transition"
                />
                <label className="mb-2 text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="border border-gray-300 p-3 rounded-lg mb-2 w-full focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] transition"
                />
                <div className="flex justify-between items-center text-xs mb-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 accent-[#7b2ff2]" /> Remember me
                  </label>
                  <button type="button" className="text-[#7b2ff2] hover:underline font-medium">Forgot password?</button>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#7b2ff2] to-[#f357a8] text-white py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform mb-2"
                >
                  Sign In
                </button>
                <p className="text-sm mt-4 text-center">
                  New here?{' '}
                  <button
                    type="button"
                    className="text-[#7b2ff2] hover:underline font-semibold"
                    onClick={() => setIsLogin(false)}
                  >
                    Create an Account
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl p-8 md:p-12 shadow-lg flex flex-col justify-center"
                autoComplete="off"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-[#222] mb-6 text-center">Sign Up</h2>
                <label className="mb-2 text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="border border-gray-300 p-3 rounded-lg mb-4 w-full focus:outline-none focus:ring-2 focus:ring-[#f357a8] transition"
                />
                <label className="mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border border-gray-300 p-3 rounded-lg mb-4 w-full focus:outline-none focus:ring-2 focus:ring-[#f357a8] transition"
                />
                <label className="mb-2 text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="border border-gray-300 p-3 rounded-lg mb-4 w-full focus:outline-none focus:ring-2 focus:ring-[#f357a8] transition"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#f357a8] to-[#7b2ff2] text-white py-3 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform mb-2"
                >
                  Create Account
                </button>
                <p className="text-sm mt-4 text-center">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="text-[#f357a8] hover:underline font-semibold"
                    onClick={() => setIsLogin(true)}
                  >
                    Sign In
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
