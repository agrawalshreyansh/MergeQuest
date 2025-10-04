'use client';

import { useState } from 'react';

export default function Filters({ filters, setFilters }) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isStarOpen, setIsStarOpen] = useState(false);
  const [isForkOpen, setIsForkOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);

  const languages = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'Go',
    'Rust',
    'Ruby',
    'PHP',
    'Swift',
    'Kotlin',
    'C++',
    'C',
    'C#',
  ];

  const starRanges = [
    { label: 'Any', value: null },
    { label: '1-100', value: '1..100' },
    { label: '100-500', value: '100..500' },
    { label: '500-1000', value: '500..1000' },
    { label: '1k-5k', value: '1000..5000' },
    { label: '5k-10k', value: '5000..10000' },
    { label: '10k+', value: '>=10000' },
  ];

  const forkRanges = [
    { label: 'Any', value: null },
    { label: '1-50', value: '1..50' },
    { label: '50-100', value: '50..100' },
    { label: '100-500', value: '100..500' },
    { label: '500-1000', value: '500..1000' },
    { label: '1k-5k', value: '1000..5000' },
    { label: '5k+', value: '>=5000' },
  ];

  const issueRanges = [
    { label: 'Any', value: null },
    { label: '1-5', value: '1..5' },
    { label: '5-10', value: '5..10' },
    { label: '10-20', value: '10..20' },
    { label: '20-50', value: '20..50' },
    { label: '50+', value: '>=50' },
  ];

  const toggleLanguage = (lang) => {
    const currentLanguages = filters.languages || [];
    if (currentLanguages.includes(lang)) {
      setFilters({
        ...filters,
        languages: currentLanguages.filter(l => l !== lang)
      });
    } else {
      setFilters({
        ...filters,
        languages: [...currentLanguages, lang]
      });
    }
  };

  return (
    <div className="bg-[#2a2a3e] rounded-lg p-5">
      <h3 className="text-white font-semibold mb-6">Filters</h3>

      {/* Language Filter - Multi-select */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-3 block">
          Languages {filters.languages?.length > 0 && `(${filters.languages.length})`}
        </label>
        <div className="relative">
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="w-full px-4 py-2 bg-[#1e1e2e] text-white rounded-lg text-left flex items-center justify-between hover:bg-[#252535] transition-colors"
          >
            <span className="text-sm truncate">
              {filters.languages?.length > 0 
                ? filters.languages.join(', ') 
                : 'Select languages...'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isLanguageOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLanguageOpen && (
            <div className="absolute z-10 w-full mt-2 bg-[#1e1e2e] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {languages.map((lang) => (
                <label
                  key={lang}
                  className="flex items-center px-4 py-2 hover:bg-[#252535] transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.languages?.includes(lang) || false}
                    onChange={() => toggleLanguage(lang)}
                    className="w-4 h-4 rounded bg-[#2a2a3e] border-gray-600 text-purple-600 focus:ring-purple-600 focus:ring-offset-0"
                  />
                  <span className="ml-3 text-sm text-gray-300">{lang}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Star Count Filter */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-3 block">
          Star Count
        </label>
        <div className="relative">
          <button
            onClick={() => setIsStarOpen(!isStarOpen)}
            className="w-full px-4 py-2 bg-[#1e1e2e] text-white rounded-lg text-left flex items-center justify-between hover:bg-[#252535] transition-colors"
          >
            <span className="text-sm">
              {starRanges.find(r => r.value === filters.starCount)?.label || 'Any'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isStarOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isStarOpen && (
            <div className="absolute z-10 w-full mt-2 bg-[#1e1e2e] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {starRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    setFilters({ ...filters, starCount: range.value });
                    setIsStarOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#252535] transition-colors ${
                    filters.starCount === range.value ? 'text-purple-400' : 'text-gray-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fork Count Filter */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-3 block">
          Fork Count
        </label>
        <div className="relative">
          <button
            onClick={() => setIsForkOpen(!isForkOpen)}
            className="w-full px-4 py-2 bg-[#1e1e2e] text-white rounded-lg text-left flex items-center justify-between hover:bg-[#252535] transition-colors"
          >
            <span className="text-sm">
              {forkRanges.find(r => r.value === filters.forkCount)?.label || 'Any'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isForkOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isForkOpen && (
            <div className="absolute z-10 w-full mt-2 bg-[#1e1e2e] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {forkRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    setFilters({ ...filters, forkCount: range.value });
                    setIsForkOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#252535] transition-colors ${
                    filters.forkCount === range.value ? 'text-purple-400' : 'text-gray-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Good First Issues Filter */}
      <div className="mb-6">
        <label className="text-gray-300 text-sm font-medium mb-3 block">
          Good First Issues
        </label>
        <div className="relative">
          <button
            onClick={() => setIsIssueOpen(!isIssueOpen)}
            className="w-full px-4 py-2 bg-[#1e1e2e] text-white rounded-lg text-left flex items-center justify-between hover:bg-[#252535] transition-colors"
          >
            <span className="text-sm">
              {issueRanges.find(r => r.value === filters.goodFirstIssues)?.label || 'Any'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isIssueOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isIssueOpen && (
            <div className="absolute z-10 w-full mt-2 bg-[#1e1e2e] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {issueRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    setFilters({ ...filters, goodFirstIssues: range.value });
                    setIsIssueOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#252535] transition-colors ${
                    filters.goodFirstIssues === range.value ? 'text-purple-400' : 'text-gray-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
