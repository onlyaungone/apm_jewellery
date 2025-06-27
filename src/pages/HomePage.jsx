import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 relative overflow-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-32 space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide">
          Discover Timeless Elegance
        </h1>
        <p className="text-lg md:text-xl max-w-2xl">
          Explore our handcrafted collections of charms, rings, necklaces, and more — made to celebrate your moments of love and individuality.
        </p>

        <Link
          to="/shop"
          className="mt-4 px-6 py-3 bg-black text-white rounded-full text-lg font-semibold shadow-md hover:bg-gray-800 transition"
        >
          Shop Now
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gray-400/10 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gray-500/10 rounded-full blur-3xl animate-pulse -z-10"></div>
    </div>
  );
};

export default HomePage;
