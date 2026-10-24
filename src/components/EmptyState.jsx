import { motion } from 'framer-motion'
import { HeartShape, Sparkle } from './illustrations/Doodles'

/**
 * Designed placeholder used whenever a section has no content yet.
 * Never shows broken images or invented personal content.
 */
export default function EmptyState({ title, message, icon: Icon, action, className = '', headingLevel = 2 }) {
  const Heading = `h${headingLevel}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-paper relative mx-auto max-w-md overflow-hidden px-6 py-10 text-center ${className}`}
    >
      <Sparkle className="absolute top-5 left-6 size-4 text-butter-deep" />
      <Sparkle className="absolute right-8 bottom-6 size-3 text-lavender-deep" />
      <div className="relative mx-auto mb-5 grid size-20 place-items-center rounded-full bg-blush">
        {Icon ? (
          <Icon className="size-9 text-berry-deep" aria-hidden="true" />
        ) : (
          <HeartShape className="size-9 text-berry" />
        )}
        <HeartShape className="absolute -top-1 -right-1 size-5 rotate-12 text-berry/60" />
      </div>
      <Heading className="font-hand text-3xl font-bold text-ink">{title}</Heading>
      {message && <p className="mx-auto mt-2 max-w-xs text-ink-soft">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
