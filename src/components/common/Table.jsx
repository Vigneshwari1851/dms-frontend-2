import { useState } from "react";
import Pagination from "../common/Pagination";
import searchIcon from "../../assets/Common/search.svg";

export default function Table({
  columns = [],
  data = [],
  itemsPerPage = 10,
  title = "Table Title",
  subtitle = "", 
  onSearch,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const roleColors = { 
    Maker: "text-[#33BAA6] bg-[#22998824] border-[#33BAA6] border",
    Checker: "text-[#B47AF4] bg-[#9C4DF424] border-[#B47AF4] border",
  };

  const statusColors = {
    Active: "text-[#82E890] bg-[#10B93524] border-[#82E890] border",
    Inactive: "text-[#F7626E] bg-[#BD404A24] border-[#F7626E] border",
  };

  const renderCell = (col, value, row) => {
    if (col.key === "role") {
      return (
        <span
          className={`px-3 py-1 text-sm font-medium ${roleColors[value] || ""}`}
          style={{ borderRadius: "18px" }}
        >
          {value}
        </span>
      );
    }

    if (col.key === "status") {
      return (
        <span
          className={`px-3 py-1 text-sm font-medium ${statusColors[value] || ""}`}
          style={{ borderRadius: "18px" }}
        >
          {value}
        </span>
      );
    }

    return value;
  };

  return (
    <div className="mt-6 w-full">

      {/*  Header Card */}
      <div className="bg-[#1A1F24] rounded-t-lg px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white text-lg font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearch && onSearch(e.target.value);
            }}
            placeholder="Search..."
            className="bg-[#131619] h-8 text-white text-sm px-9 py-2 rounded-lg border border-[#2A2F33] outline-none w-80"
          />
          <img
            src={searchIcon}
            alt="search"
            className="w-4 h-4 absolute left-3 top-2.5 opacity-70"
          />
        </div>
      </div>

      {/*  Table Card */}
      <div className="bg-[#1A1F24] mt-[1.5px] px-5 py-4">
        <table className="w-full text-left text-[#8F8F8F] font-normal text-[13px]">
          <thead>
            <tr className="text-[#FFFFFF] text-[12px] font-normal">
              {columns.map((col, index) => (
                <th key={index} className="py-3 text-left">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="rounded-2xl hover:bg-[#151517] transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-3 text-left">
                    {col.key === "role" || col.key === "status"
                      ? renderCell(col, row[col.key], row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*  Pagination Card */}
      <div className="bg-[#1A1F24] rounded-b-lg mt-[1.5px] p-4 ">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        />
      </div>
    </div>
  );
}
