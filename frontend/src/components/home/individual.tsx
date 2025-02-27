import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DebateCard } from "./debateCard";

const Individual = ({ label }) => {
  const scrollContainerRef = useRef(null);

  const debates = [
    {
      id: 1,
      participants: ["Donald Trump", "Elon Musk"],
      topic: "The Nature of Truth and Reality",
    },
    {
      id: 2,
      participants: ["Narendra Modi", "Elon Musk"],
      topic: "AI Development Boundaries",
    },
    {
      id: 3,
      participants: ["Andrew Tate", "Narendra Modi"],
      topic: "Modern Art Definition",
    },
    {
      id: 4,
      participants: ["Donald Trump", "Andrew Tate"],
      topic: "Origins of Consciousness",
    },
  ];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 470; // Adjusted for new card width + gap
      container.scrollTo({
        left:
          container.scrollLeft +
          (direction === "right" ? scrollAmount : -scrollAmount),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="pt-8" id={label}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent">
          {label}
        </h1>
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[4] p-3 rounded-full bg-white shadow-xl text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 border border-gray-200"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[4] p-3 rounded-full bg-white shadow-xl text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50 border border-gray-200"
          style={{ transform: "translate(50%, -50%)" }}
        >
          <ChevronRight className="w-7 h-7" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {debates.map((debate) => (
            <DebateCard
              key={debate.id}
              participants={debate.participants}
              topic={debate.topic}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Individual;
