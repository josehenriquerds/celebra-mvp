'use client'

import confetti from 'canvas-confetti'

export default function CelebrateButton() {
  const handleClick = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['F2B7B6', '#78A3C5', '#B7CEDE', '#7A9C57', '#E8FFF3'],
      scalar: 1.8,
    })
  }

  return (
    <button
      onClick={handleClick}
      className="relative px-6 py-3 rounded-lg text-white font-semibold bg-[#F2B7B6] text-white hover:bg-[#e39b9a] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
    >
    Comece a Celebrar
    </button>
  )
}
