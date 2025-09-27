import React from 'react';
import { motion } from 'framer-motion'

export default function Question({ text, question, options, onSelect, selected }) {
  const title = typeof text === 'string' && text.length > 0 ? text : question;
  return (
    <div className="space-y-3">
      <h2 className="text-lg md:text-xl font-bold leading-snug break-words">{title}</h2>
      <motion.div className="grid gap-2" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}>
        {options.map((opt, idx) => (
          <motion.button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={selected !== null}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: selected === null ? 1.01 : 1 }}
            whileTap={{ scale: selected === null ? 0.99 : 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            className={`text-left w-full rounded-xl border px-4 py-3 text-sm md:text-base transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-primary break-words ${selected === idx ? 'border-bb-primary bg-white/10' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-sm font-semibold">{String.fromCharCode(65 + idx)}</span>
            <span className="align-middle">{opt}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}