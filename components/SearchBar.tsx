'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  onStatusFilter: (status: 'all' | 'healthy' | 'stressed' | 'critical') => void;
}

export default function SearchBar({ onSearchChange, onStatusFilter }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search plants by name..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <select
          onChange={(e) => onStatusFilter(e.target.value as 'all' | 'healthy' | 'stressed' | 'critical')}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="stressed">Stressed</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>
  );
}
