'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function LoginCadastro() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e9e6f7] to-[#c3b6e6] px-2">
      <div className="relative flex h-[600px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:h-[500px] md:flex-row">
        {/* Painel Lateral Roxo */}
        <motion.div
          initial={false}
          animate={{ x: isLogin ? 0 : '-100%' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute left-0 top-0 z-20 flex h-2/5 w-full flex-col items-center justify-center rounded-b-3xl bg-gradient-to-br from-[#7b2ff2] to-[#f357a8] p-8 text-white shadow-lg md:static md:z-10 md:h-full md:w-1/2 md:rounded-l-3xl md:rounded-br-none md:p-12"
          style={{ boxShadow: '0 8px 32px 0 rgba(123,47,242,0.2)' }}
        >
          <motion.h2
            key={isLogin ? 'welcome' : 'join'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-2 text-center text-3xl font-extrabold drop-shadow-lg md:mb-4 md:text-4xl"
          >
            {isLogin ? 'Welcome back!' : 'Join us!'}
          </motion.h2>
          <motion.p
            key={isLogin ? 'desc-login' : 'desc-cadastro'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xs text-center text-base opacity-90 md:max-w-sm md:text-lg"
          >
            {isLogin
              ? 'You can sign in to access with your existing account.'
              : 'Create your account and enjoy managing your events in style.'}
          </motion.p>
        </motion.div>

        {/* Formulários */}
        <div className="relative z-30 flex h-full flex-1 items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="flex w-full max-w-md flex-col justify-center rounded-2xl bg-white p-8 shadow-lg md:p-12"
                autoComplete="off"
              >
                <h2 className="mb-6 text-center text-2xl font-bold text-[#222] md:text-3xl">
                  Sign In
                </h2>
                <label className="mb-2 text-sm font-medium text-gray-700">Username or email</label>
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  className="mb-4 w-full rounded-lg border border-gray-300 p-3 transition focus:outline-none focus:ring-2 focus:ring-[#7b2ff2]"
                />
                <label className="mb-2 text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="mb-2 w-full rounded-lg border border-gray-300 p-3 transition focus:outline-none focus:ring-2 focus:ring-[#7b2ff2]"
                />
                <div className="mb-4 flex items-center justify-between text-xs">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 accent-[#7b2ff2]" /> Remember me
                  </label>
                  <button type="button" className="font-medium text-[#7b2ff2] hover:underline">
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="mb-2 rounded-lg bg-gradient-to-r from-[#7b2ff2] to-[#f357a8] py-3 font-semibold text-white shadow-md transition-transform hover:scale-105"
                >
                  Sign In
                </button>
                <p className="mt-4 text-center text-sm">
                  New here?{' '}
                  <button
                    type="button"
                    className="font-semibold text-[#7b2ff2] hover:underline"
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
                className="flex w-full max-w-md flex-col justify-center rounded-2xl bg-white p-8 shadow-lg md:p-12"
                autoComplete="off"
              >
                <h2 className="mb-6 text-center text-2xl font-bold text-[#222] md:text-3xl">
                  Sign Up
                </h2>
                <label className="mb-2 text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="mb-4 w-full rounded-lg border border-gray-300 p-3 transition focus:outline-none focus:ring-2 focus:ring-[#f357a8]"
                />
                <label className="mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="mb-4 w-full rounded-lg border border-gray-300 p-3 transition focus:outline-none focus:ring-2 focus:ring-[#f357a8]"
                />
                <label className="mb-2 text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="mb-4 w-full rounded-lg border border-gray-300 p-3 transition focus:outline-none focus:ring-2 focus:ring-[#f357a8]"
                />
                <button
                  type="submit"
                  className="mb-2 rounded-lg bg-gradient-to-r from-[#f357a8] to-[#7b2ff2] py-3 font-semibold text-white shadow-md transition-transform hover:scale-105"
                >
                  Create Account
                </button>
                <p className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="font-semibold text-[#f357a8] hover:underline"
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
  )
}
