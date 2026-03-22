import React from 'react';

const SearchBox = ({ query, onChange, onSubmit }) => {
  return (
    <div className="relative w-full">
      <form onSubmit={onSubmit} className="relative w-full group">
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Search Icon with Hover Animation */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg 
            shadow-lg group-hover:from-blue-600 group-hover:to-blue-700 
            group-hover:scale-110 group-hover:rotate-12
            transition-all duration-300">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Search Input with Glass Effect */}
        <input
          type="text"
          placeholder="समाचार खोजें..."
          value={query}
          onChange={onChange}
          className="w-full pl-14 pr-24 py-4 text-lg text-gray-800 
            bg-white/90 border-2 border-gray-100 rounded-2xl
            backdrop-blur-sm shadow-lg
            focus:outline-none focus:border-blue-500 focus:ring-4 
            focus:ring-blue-100/50 transition-all duration-300 
            hover:shadow-xl group-hover:border-blue-100 relative z-0
            placeholder:text-gray-400 placeholder:font-normal"
        />

        {/* Search Button with Gradient and Animation */}
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10
            bg-gradient-to-r from-blue-500 to-blue-600 
            px-6 py-2.5 rounded-xl text-white font-medium
            shadow-md hover:shadow-lg group-hover:translate-x-1
            hover:from-blue-600 hover:to-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-300 
            active:scale-95 transition-all duration-300"
        >
          <span className="group-hover:scale-105 inline-block transition-transform duration-300">खोजें</span>
        </button>

        {/* Decorative Elements */}
        <div className="absolute -right-3 -top-3 w-6 h-6 bg-blue-200 rounded-full 
          opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500" />
        <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-indigo-200 rounded-full 
          opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500" />
      </form>
    </div>
  );
};

export default SearchBox;