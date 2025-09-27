import React from 'react';

export default function Question({ question, options, onSelect, selected }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl md:text-2xl font-bold leading-snug">{question}</h2>
      <div className="grid gap-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={selected !== null}
            className={`text-left w-full rounded-xl border px-4 py-3 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-primary ${selected === idx ? 'border-bb-primary bg-white/10' : 'border-white/10 bg-white/5'}`}
          >
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-sm font-semibold">{String.fromCharCode(65 + idx)}</span>
            <span className="align-middle">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}