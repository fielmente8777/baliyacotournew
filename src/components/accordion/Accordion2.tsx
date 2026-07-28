"use client";
import { useState } from "react";

interface Props {
  question: string;
  answer: string;
}

const Accordion2: React.FC<Props> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-new-secondary/20 py-4">
      
      {/* Question */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left text-white"
      >
        <h3 className="text-lg">{question}</h3>

        <span
          className={`transition-transform duration-300 ${
            open ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      {/* Answer */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
        }`}
      >
        <p className="overflow-hidden text-white/80">{answer}</p>
      </div>
    </div>
  );
};

export default Accordion2;