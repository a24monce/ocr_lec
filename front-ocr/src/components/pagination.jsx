import React from "react";

export default function Pagination({ current, total, onPageChange }) {
  const pages = [];
  const maxPagesToShow = 5;
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  if (current <= 3) {
    end = Math.min(total, maxPagesToShow);
  } else if (current >= total - 2) {
    start = Math.max(1, total - maxPagesToShow + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center gap-2 justify-center py-4">
      <button
        className="text-gray-500 hover:text-black px-2"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        &larr; Précédent
      </button>

      {start > 1 && (
        <>
          <button
            className={`px-3 py-1 rounded ${current === 1 ? "bg-gray-800 text-white" : ""}`}
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {start > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded ${current === page ? "bg-gray-800 text-white" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {end < total && (
        <>
          {end < total - 1 && <span className="px-2">...</span>}
          <button
            className={`px-3 py-1 rounded ${current === total ? "bg-gray-800 text-white" : ""}`}
            onClick={() => onPageChange(total)}
          >
            {total}
          </button>
        </>
      )}

      <button
        className="text-gray-500 hover:text-black px-2"
        disabled={current === total}
        onClick={() => onPageChange(current + 1)}
      >
        Suivant &rarr;
      </button>
    </div>
  );
}
