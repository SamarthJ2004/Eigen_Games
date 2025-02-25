"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = ["/assets/Frame2.jpeg" , "/assets/Frame1.png"];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setFade(true);
    }, 300);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
      setFade(true);
    }, 300);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-6 group">
      <div className="relative overflow-hidden rounded-xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-[5]"></div>

        <div className="aspect-[16/9] relative">
          <Image
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
            className={`object-cover transition-opacity duration-300 ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            priority
          />
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-[9] p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-[9] p-2 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-[9]">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setFade(true);
                }, 300);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
