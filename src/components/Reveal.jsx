import { motion } from 'framer-motion'

/** Scroll-triggered fade/slide reveal. */
export default function Reveal({ children, delay = 0, y = 24, x = 0, className = '', as = 'div', once = true, amount = 0.2 }) {
  const Component = motion[as] ?? motion.div
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}
