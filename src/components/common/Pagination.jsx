import React from "react";
import leftArrow from "../../assets/Common/left.svg";
import rightArrow from "../../assets/Common/right.svg";

export default function Pagination({ currentPage, totalPages, onPrev, onNext }) {
  return (
    <div className="flex justify-end mt-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className={`px-2 py-1 border border-[#2A2F33] rounded-lg text-white flex items-center gap-2 ${
            currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          <img src={leftArrow} className="w-3 h-3" alt="prev" />
        </button>
        
        <span className="text-sm text-[#8F8F8F]">
          <span className="text-white mr-1">{currentPage}</span>
          <span className="mx-1">of</span>
          <span className="text-white ml-1">{totalPages}</span>
        </span>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 border border-[#2A2F33] rounded-lg text-white flex items-center gap-2 ${
            currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          <img src={rightArrow} className="w-3 h-3" alt="next" />
        </button>
      </div>
    </div>
  );
}
