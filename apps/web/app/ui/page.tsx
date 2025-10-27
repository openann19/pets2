/**
 * UI Showcase Page
 * Demonstrates all shared UI components with variants and states
 */

'use client';

import React, { useState } from 'react';

export default function UIDemoPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'en' | 'bg'>('en');
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Controls Bar */}
      <div
        className="sticky top-0 z-50 border-b p-4 backdrop-blur-sm"
        data-testid="ui-controls"
        style={{
          backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Theme:</span>
          <button
            data-testid="ui-theme-light"
            onClick={() => setTheme('light')}
            className={`px-3 py-1 rounded ${!isDark ? 'bg-blue-600 text-white' : 'bg-transparent hover:bg-gray-100 text-gray-600'}`}
          >
            Light
          </button>
          <button
            data-testid="ui-theme-dark"
            onClick={() => setTheme('dark')}
            className={`px-3 py-1 rounded ${isDark ? 'bg-blue-600 text-white' : 'bg-transparent hover:bg-gray-100 text-gray-600'}`}
          >
            Dark
          </button>

          <span className={`text-sm ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Lang:</span>
          <button
            data-testid="ui-lang-en"
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-transparent hover:bg-gray-100 text-gray-600'}`}
          >
            EN
          </button>
          <button
            data-testid="ui-lang-bg"
            onClick={() => setLang('bg')}
            className={`px-3 py-1 rounded ${lang === 'bg' ? 'bg-blue-600 text-white' : 'bg-transparent hover:bg-gray-100 text-gray-600'}`}
          >
            BG
          </button>
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="p-6 space-y-12" data-testid="ui-demo">
        <section data-testid="ui-buttons">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Button</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Primary actions and interactions</p>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Primary</button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Secondary</button>
            <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50">Outline</button>
            <button className="px-4 py-2 text-blue-600 rounded hover:bg-gray-100">Ghost</button>
          </div>
        </section>

        <section data-testid="ui-badges">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Badge</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Labels and status indicators</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full bg-blue-600 text-white text-sm">Primary</span>
            <span className="px-2 py-1 rounded-full bg-purple-600 text-white text-sm">Secondary</span>
            <span className="px-2 py-1 rounded-full bg-green-500 text-white text-sm">Success</span>
            <span className="px-2 py-1 rounded-full bg-yellow-500 text-white text-sm">Warning</span>
            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-sm">Danger</span>
          </div>
        </section>
      </div>
    </div>
  );
}

