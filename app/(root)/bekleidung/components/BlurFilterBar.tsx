import React, { useState } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';

export default function BlurFilterBar() {
  const [viewOpen, setViewOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-8">
      {/* Background content for blur effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-300 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-300 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300 rounded-full opacity-30 blur-3xl"></div>
      </div>

      {/* Frosted glass bar */}
      <div className="relative max-w-4xl mx-auto mt-20">
        <div className="flex items-center gap-4 px-6 py-4 backdrop-blur-xl bg-white/30 border border-white/20 rounded-2xl shadow-2xl">
          {/* View all dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setViewOpen(!viewOpen);
                setSortOpen(false);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-white/40 backdrop-blur-sm hover:bg-white/50 transition-all duration-200 rounded-xl border border-white/30 shadow-lg"
            >
              <span className="text-gray-800 font-medium">View all</span>
              <sup className="text-xs text-gray-600">1115</sup>
              <ChevronDown className="w-4 h-4 text-gray-700" />
            </button>
            
            {viewOpen && (
              <div className="absolute top-full mt-2 w-48 backdrop-blur-xl bg-white/40 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-10">
                <div className="p-2 space-y-1">
                  <div className="px-4 py-2 hover:bg-white/30 rounded-lg cursor-pointer text-gray-800">All items</div>
                  <div className="px-4 py-2 hover:bg-white/30 rounded-lg cursor-pointer text-gray-800">Active</div>
                  <div className="px-4 py-2 hover:bg-white/30 rounded-lg cursor-pointer text-gray-800">Archived</div>
                </div>
              </div>
            )}
          </div>

          {/* Sort by dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setSortOpen(!sortOpen);
                setViewOpen(false);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-white/40 backdrop-blur-sm hover:bg-white/50 transition-all duration-200 rounded-xl border border-white/30 shadow-lg"
            >
              <span className="text-gray-800 font-medium">Sort by</span>
              <ArrowUpDown className="w-4 h-4 text-gray-700" />
            </button>
            
            {sortOpen && (
              <div className="absolute top-full mt-2 w-48 backdrop-blur-xl bg-white/40 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-10">
                <div className="p-2 space-y-1">
                  <div className="px-4 py-2 hover:bg-white/30 rounded-lg cursor-pointer text-gray-800">Name</div>
                  <div className="px-4 py-2 hover:bg-white/30 rounded-lg cursor-pointer text-gray-800">Date</div>
                  <div className="px-4 py-2 hover:bg-white/30 rounded-lg cursor-pointer text-gray-800">Size</div>
                </div>
              </div>
            )}
          </div>

          {/* Filter button */}
          <button className="ml-auto px-8 py-3 bg-black hover:bg-gray-900 transition-all duration-200 text-white font-medium rounded-xl shadow-lg">
            Filter
          </button>
        </div>

        {/* Sample content below to show the blur effect */}
        <div className="mt-8 p-6 backdrop-blur-md bg-white/20 border border-white/20 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Sample Content</h2>
          <p className="text-white/90">
            This demonstrates how the frosted glass effect works with content behind it. 
            The backdrop-blur creates that beautiful iOS-style glassmorphism effect.
          </p>
        </div>
      </div>
    </div>
  );
}