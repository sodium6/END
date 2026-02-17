import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxShown = 5;

    if (totalPages <= maxShown) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const pageItems = getPageNumbers();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex justify-center items-center w-8 h-8 rounded-md bg-gray-100 text-gray-700 
            hover:bg-gray-200 disabled:opacity-50"
      >
        <ChevronLeft size={22} />
      </button>

      {pageItems.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`
            w-8 h-8 rounded-md text-sm font-medium
            ${
              page === currentPage
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
            ${page === '...' && 'cursor-default'}
          `}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex justify-center items-center w-8 h-8 rounded-md bg-gray-100 text-gray-700 
            hover:bg-gray-200 disabled:opacity-50"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
};

export default Pagination;
