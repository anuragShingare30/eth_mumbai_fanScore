"use client";

import { useState } from "react";

interface SearchFormProps {
  onSearch: (handle: string) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [handle, setHandle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      const trimmedHandle = handle.trim();
      onSearch(trimmedHandle);
      // Clear input after submission
      setHandle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md" role="search" aria-label="Check your ETHMumbai fan score">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="twitter-handle" className="sr-only">
            Twitter/X Username
          </label>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-body text-lg pointer-events-none" aria-hidden="true">
            @
          </span>
          <input
            id="twitter-handle"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="username"
            className="w-full pl-10 pr-4 py-4 rounded-2xl border-3 border-white bg-white/90 backdrop-blur-sm text-(--ethmumbai-black) placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-(--ethmumbai-yellow) focus:border-white transition-all font-body text-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            required
            aria-required="true"
            aria-label="Enter your Twitter or X username without the @ symbol"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !handle.trim()}
          className="px-8 py-4 bg-(--ethmumbai-yellow) hover:bg-(--ethmumbai-yellow)/90 text-(--ethmumbai-black) font-header text-lg rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-4 focus:ring-(--ethmumbai-cyan)"
          aria-label={isLoading ? "Checking your score..." : "Check your fan score"}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Checking...
            </>
          ) : (
            "CHECK SCORE"
          )}
        </button>
      </div>
    </form>
  );
}
