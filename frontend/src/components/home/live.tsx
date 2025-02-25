import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import tut from "../../../public/assets/w2.jpg";
import Link from "next/link";

const LiveCard = ({ room }) => (
  <Link
    href={room.link}
    className="flex-shrink-0 w-[360px] group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="relative aspect-video overflow-hidden">
      <Image
        src={tut}
        alt={room.topic}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

      <div className="absolute top-3 left-3 flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
        <Flame className="w-4 h-4" />
        <span>LIVE</span>
      </div>

      <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
        Battle Arena
      </div>
    </div>

    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{room.topic}</h3>
      <p className="text-sm text-gray-600">{room.bots.join(" 🆚 ")}</p>
    </div>
  </Link>
);

const Live = () => {
  const scrollContainerRef = useRef(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "/api/rooms/all?limit=10&sortBy=createdAt&sortOrder=desc"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch rooms");
        }
        const data = await response.json();
        setRooms(data.rooms);
        console.log("rooms:", rooms);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load battle rooms");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 380; // card width + gap
      const currentScroll = container.scrollLeft;

      container.scrollTo({
        left:
          currentScroll +
          (direction === "right" ? scrollAmount : -scrollAmount),
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-4xl font-bold bg-gradient-to-br from-[#FF5F6D] to-[#7D00FF] bg-clip-text text-transparent">
            Live Battles
          </h1>
          <div className="animate-pulse">
            <Flame className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No active battles right now</p>
        </div>
      ) : (
        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 shadow-lg text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white disabled:opacity-0"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 shadow-lg text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white disabled:opacity-0"
            style={{ transform: "translate(50%, -50%)" }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-5 pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {rooms.map((room) => (
              <LiveCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Live;
