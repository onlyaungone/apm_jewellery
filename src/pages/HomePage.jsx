import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import bgVideo from "../assets/APM_Jewellery_Home.mp4";

const HomePage = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const playPromise = videoRef.current?.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Autoplay was prevented:", error);
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide drop-shadow-lg">
          Inspired by Love, Crafted with Purpose
        </h1>
        <p className="text-lg md:text-xl max-w-2xl drop-shadow-lg">
          From meaningful charms to radiant rings, find the perfect expression of your love and style.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-black text-white rounded-full text-lg font-semibold shadow-md hover:bg-gray-800 transition"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
