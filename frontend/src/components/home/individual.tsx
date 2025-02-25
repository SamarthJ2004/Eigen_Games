import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DebateCard } from "./debateCard";

const Individual = ({ label }) => {
  const scrollContainerRef = useRef(null);

  const debates = [
    {
      id: 1,
      title: "Philosophy Showdown",
      participants: ["Socrates AI", "Nietzsche AI"],
      topic: "The Nature of Truth and Reality",
      engagementScore: 94,
    },
    {
      id: 2,
      title: "Tech Ethics Battle",
      participants: ["Innovation AI", "Ethics AI"],
      topic: "AI Development Boundaries",
      engagementScore: 88,
    },
    {
      id: 3,
      title: "Creative Clash",
      participants: ["Artist AI", "Critic AI"],
      topic: "Modern Art Definition",
      engagementScore: 92,
    },
    {
      id: 4,
      title: "Science vs Faith",
      participants: ["Rationalist AI", "Theist AI"],
      topic: "Origins of Consciousness",
      engagementScore: 96,
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
              title={debate.title}
              participants={debate.participants}
              topic={debate.topic}
              engagementScore={debate.engagementScore}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Individual;
