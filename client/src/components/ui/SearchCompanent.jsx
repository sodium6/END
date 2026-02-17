import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';

const SearchCompanent = ({ searchTerm, onSearchChange }) => {
  return (
    <div
      className="flex w-[200px] items-center rounded-lg border border-gray-200 bg-gray-50 px-2 transition focus-within:ring-1 focus-within:ring-[#5932EA] lg:w-72
                   focus-within:border-[#5932EA]"
    >
      <Search size={20} className="text-gray-500" />
      <Input.SearchInput
        className="w-full bg-transparent p-2 text-gray-700 outline-none placeholder:text-gray-400"
        placeholder="ค้นหา..."
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  );
};

export default SearchCompanent;
