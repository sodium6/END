/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from 'react';
import SwitchDropDown from '../other/SwitchDropDown';

const DefaultInput = ({ type, placeholder, className, ...props }) => {
  return (
    <input
      className={`${className} input-field w-full`}
      type={type}
      placeholder={placeholder}
      {...props}
    />
  );
};

const TextAreaInput = ({ className, placeholder, ...props }) => {
  return (
    <textarea
      placeholder={placeholder}
      className={`${className} input-field h-[120px] rounded-md`}
      {...props}
    />
  );
};

const SearchInput = ({ className, ...props }) => {
  return <input className={`${className} rounded-lg text-gray-700 `} type="search" {...props} />;
};

const CheckBoxInput = ({ className, text, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={props.id}
        className={`input-checkbox ${className || ''} `}
        {...props}
      />
      <label
        htmlFor={props.id}
        className="ml-2 text-sm 
        text-gray-700 font-medium cursor-pointer"
      >
        {text}
      </label>
    </div>
  );
};

const DropdownInput = ({ label, items, onSelect, from = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const handleItemClick = (item) => {
    onSelect(item);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`relative ${from === 'sign-up' ? `block` : `inline-block`} text-left cursor-pointer`}
      ref={ref}
    >
      <div
        tabIndex="0"
        onClick={() => setOpen((o) => !o)}
        className={`flex ${from === 'sign-up' ? `items-center justify-between h-[46px] p-4` : `p-2 justify-center`}  
           w-full rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50
           focus-within:ring-2 focus-within:ring-[#5932EA] focus-within:border-transparent transition`}
      >
        {label}
        <SwitchDropDown open={open} />
      </div>

      {open && (
        <div
          className={`origin-top-left absolute right-0 mt-2 ${from === 'sign-up' ? `w-full` : `w-56`} 
           rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5 z-20`}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <div
                key={index}
                onClick={() => handleItemClick(item)}
                className={`block px-4 py-2 text-sm cursor-pointer  
                text-gray-700 hover:bg-gray-100`}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Input = {
  DefaultInput: DefaultInput,
  SearchInput: SearchInput,
  CheckBoxInput: CheckBoxInput,
  DropdownInput: DropdownInput,
  TextAreaInput: TextAreaInput,
};
