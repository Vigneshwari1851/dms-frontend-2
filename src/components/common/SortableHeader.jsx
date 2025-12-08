import React from "react";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";

export default function SortableHeader({ 
  label, 
  sortBy, 
  sortAsc, 
  columnKey, 
  onSort 
}) {
  const isActive = sortBy === columnKey;

  return (
    <th
      className="py-3 text-center cursor-pointer select-none"
      onClick={() => onSort(columnKey)}
    >
      <div className="flex items-center justify-center gap-1 w-full">
        {label}
        <span className="flex flex-col ml-1">
          <img
            src={uparrowIcon}
            className="w-3 h-3 -mt-[5px]"
            style={{
              filter: isActive && sortAsc ? "brightness(1.5)" : "brightness(1)",
            }}
            alt="asc"
          />
          <img
            src={downarrowIcon}
            className="w-3 h-3 -mt-3 ml-1.5"
            style={{
              filter:
                isActive && !sortAsc ? "brightness(1.5)" : "brightness(1)",
            }}
            alt="desc"
          />
        </span>
      </div>
    </th>
  );
}
