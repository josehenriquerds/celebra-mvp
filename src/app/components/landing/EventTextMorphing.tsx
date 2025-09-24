'use client'
import { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

const eventData = [
  { name: 'Chá de Bebê', color: '#A3D1FF' },
  { name: 'Cerveja', color: '#FBBF24' },
  { name: 'Churrasco', color: '#22C55E' },
  { name: 'Aniversário', color: '#FF4444' },
  { name: 'Casamento', color: '#863F44' },
]

export default function EventTextMorphing() {
  const [index, setIndex] = useState(0)
  const text = useMotionValue(eventData[0].name)
  const springX = useSpring(0, { stiffness: 90, damping: 15, mass: 0.6 })

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (index + 1) % eventData.length
      setIndex(next)
      springX.set(-60)
      setTimeout(() => {
        springX.set(50)
        text.set(eventData[next].name)
        springX.set(0)
      }, 100)
    }, 3000)
    return () => clearInterval(interval)
  }, [index])

  return (
    <motion.div
      className="inline-block min-w-[10ch] font-semibold text-clip whitespace-nowrap"
      style={{
        x: springX,
        color: eventData[index].color,
        willChange: 'transform',
      }}
    >
      {eventData[index].name}
    </motion.div>
  )
}
