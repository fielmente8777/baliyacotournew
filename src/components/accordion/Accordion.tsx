// "use client"

import { FaqSectionProps } from "@/@types/landingPageTypes";

// import { useState } from "react";

const Accordion: React.FC<FaqSectionProps["items"][0]> = ({
  q: question,
  a: answer,
}) => {
  // Accordion component implementation goes here
  // const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="py-4 cursor-pointer group">
      <div className="flex justify-between items-center">
        <h3 className="text-background-dark ">{question}</h3>
        <span className="mt-2 transition-transform duration-300 ease-in-out group-hover:rotate-180">
          <DropDownIcon  />
        </span>
      </div>
      <p className="hidden group-hover:block group-active:block transition-transform group-hover:translate-y-1 group-active:translate-y-1 group-active:opacity-100 group-hover:opacity-100 opacity-0 transform duration-1000 ease-in-out mt-2 text-secondary text-sm">
        {answer}
      </p>
    </div>
  );
};

export default Accordion;

export const DropDownIcon = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="#635B54"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
