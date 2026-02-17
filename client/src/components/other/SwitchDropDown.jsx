import React from 'react';

const SwitchDropDown = ({ open }) => {
  return (
    <svg
      className={`ml-2 -mr-1 h-5 w-5 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
};

export default SwitchDropDown;
