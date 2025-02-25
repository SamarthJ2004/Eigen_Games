"use client";

import ImageSlider from "../components/home/carousel";
import Live from "../components/home/live";
import Category from "@/components/home/category";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import Individual from "../components/home/individual";
import Navbar from "../components/common-components/navbar";
import { VortexDemo } from "../components/hard-ui/final_vortex";
import Leaderboard from "@/components/common-components/leaderboard";

export default function Home() {
  const { login, logout, user, ready } = usePrivy();
  const [isMinimized, setIsMinimized] = useState(false);
  const [display, setDisplay] = useState(false);
  const categories = ["Gaming", "Sports", "Politics", "Movies", "Casual"];

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <Navbar
          user={user}
          setDisplay={setDisplay}
          logout={logout}
          display={display}
        />
        <div className={`${isMinimized ? "pl-24" : "pl-80"} pt-16 px-6 transition-all duration-300`}>
          <div className="max-w-7xl mx-auto">
            <ImageSlider />
          </div>
          <Live />
          <Category />
          <hr className="border-black" />
          {categories.map((categorie, index) => (
            <Individual label={categorie} key={index} />
          ))}
          <VortexDemo />
        </div>
      </div>
      <Leaderboard isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
    </>
  );
}
