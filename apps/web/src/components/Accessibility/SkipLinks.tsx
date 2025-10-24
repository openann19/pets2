'use client';
import React from 'react';
export const SkipLinks = () => {
    return (<div className="sr-only focus:not-sr-only">
      <a href="#main-content" className="fixed top-4 left-4 z-[9999] bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
        Skip to main content
      </a>
      <a href="#navigation" className="fixed top-4 left-4 z-[9999] bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 mt-16">
        Skip to navigation
      </a>
    </div>);
};
export default SkipLinks;
//# sourceMappingURL=SkipLinks.jsx.map