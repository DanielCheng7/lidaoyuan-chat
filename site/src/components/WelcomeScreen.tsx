"use client";

import { useState } from "react";
import { getExampleQuestions, SITE_TITLE, SITE_SUBTITLE, FAMOUS_QUOTE, WELCOME_HINT } from "@/lib/constants";

interface WelcomeScreenProps {
  onExampleClick: (question: string) => void;
}

export default function WelcomeScreen({ onExampleClick }: WelcomeScreenProps) {
  const [questions] = useState(() => getExampleQuestions(6));

  return (
    <div className="flex flex-col items-center justify-center px-4 pt-[15vh] pb-12">
      {/* Title */}
      <h1 className="text-5xl font-bold font-[family-name:var(--font-serif)] text-ink tracking-widest mb-3">
        {SITE_TITLE}
      </h1>
      <p className="text-base text-pencil mb-8">{SITE_SUBTITLE}</p>

      {/* Famous quote */}
      <blockquote className="drop-cap text-lg text-pencil italic font-[family-name:var(--font-serif)] max-w-md text-center leading-relaxed mb-10">
        {FAMOUS_QUOTE}
      </blockquote>

      {/* Example questions */}
      <div className="w-full max-w-md space-y-2.5 mb-10">
        <p className="text-sm text-pencil/60 text-center mb-4">试试这些问题：</p>
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onExampleClick(q)}
            className="w-full text-left paper-card px-4 py-3 text-[15px] text-ink
                       hover:bg-paper-warm cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className="text-sm text-pencil/40">{WELCOME_HINT}</p>
    </div>
  );
}
