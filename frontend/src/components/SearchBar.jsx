import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ onSearch, placeholder = "Search news..." }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'scale-105' : 'scale-100'
      }`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-lg bg-white dark:bg-gray-700 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:text-white placeholder-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                       text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}

export default SearchBar;