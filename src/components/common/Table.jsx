import { useState, useMemo } from "react";
import Pagination from "../common/Pagination";
import searchIcon from "../../assets/Common/search.svg";
import SortableHeader from "../common/SortableHeader";
import download from "../../assets/dashboard/download.svg";
import Dropdown from "../../components/common/Dropdown";
import pdf from "../../assets/common/pdf.svg";
import excel from "../../assets/common/excel.svg";
import DateFilter from "./DateFilter";

export default function Table({
  columns = [],
  data = [],
  itemsPerPage = 10,
  title = "Table Title",
  subtitle = "",
  onSearch,
  sortableKeys = [],
  showRightSection = true,
}) {
  const [statusFilter, setStatusFilter] = useState("All Status");
  const statuses = ["All Status", "Pending", "Completed"];
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, asc: true });
  const [exportOpen, setExportOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: null, to: null });

  const roleColors = {
    Maker: "text-[#33BAA6] bg-[#22998824] border-[#33BAA6] border",
    Checker: "text-[#B47AF4] bg-[#9C4DF424] border-[#B47AF4] border",
  };

  const statusColors = {
    Active: "text-[#82E890] bg-[#10B93524] border-[#82E890] border",
    Inactive: "text-[#F7626E] bg-[#BD404A24] border-[#F7626E] border",
    Tallied: "text-[#82E890] bg-[#10B93524] border-[#82E890] border",
    Excess: "text-[#D8AD00] bg-[#302700] border-[#D8AD00] border",
    Short: "text-[#F7626E] bg-[#BD404A24] border-[#F7626E] border",
  };

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, asc: !sortConfig.asc });
    } else {
      setSortConfig({ key, asc: true });
    }
  };

  const renderCell = (col, value) => {
    if (col.key === "role")
      return (
        <span
          className={`px-3 py-1 text-sm font-medium ${roleColors[value] || ""}`}
          style={{ borderRadius: "18px" }}
        >
          {value}
        </span>
      );

    if (col.key === "status")
      return (
        <span
          className={`px-3 py-1 text-sm font-medium ${statusColors[value] || ""}`}
          style={{ borderRadius: "18px" }}
        >
          {value}
        </span>
      );

    if (col.key === "variance") {
      const sign = value?.trim().startsWith("+")
        ? "+"
        : value?.trim().startsWith("-")
        ? "-"
        : "0";

      const color =
        sign === "+"
          ? "text-[#D8AD00] mr-2"
          : sign === "-"
          ? "text-[#F93535] mr-2"
          : "text-[#8F8F8F]";

      return <span className={`font-medium ${color}`}>{value}</span>;
    }

    return value;
  };

  // --------- Filtered Data with Search, Status, and Date ----------
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Search Filter
      const matchesSearch = Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      );

      // Status Filter
      const matchesStatus =
        statusFilter === "All Status" || row.status === statusFilter;

      // Date Filter (created_at column)
      let matchesDate = true;
      if (dateFilter.from && dateFilter.to) {
        const rowDate = new Date(row.date);
        matchesDate =
          rowDate >= dateFilter.from && rowDate <= dateFilter.to;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, search, statusFilter, dateFilter]);

  // --------- Sorting ----------
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortConfig.key]?.toString().toLowerCase() || "";
      const valB = b[sortConfig.key]?.toString().toLowerCase() || "";
      if (valA < valB) return sortConfig.asc ? -1 : 1;
      if (valA > valB) return sortConfig.asc ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mt-6 w-full">
      {/* HEADER */}
      <div className="bg-[#1A1F24] rounded-t-lg px-5 py-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="text-white text-lg font-semibold">{title}</h2>
            {subtitle && (
              <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
            )}
          </div>

          {showRightSection && (
            <div className="flex items-center gap-4">
              {/* Date Filter */}
              <DateFilter onApply={(range) => setDateFilter(range)} />

              {/* Status Filter */}
              <Dropdown
                label="All Status"
                options={statuses}
                selected={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              />

              {/* Export */}
              <div className="relative">
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="px-5 py-2 bg-[#1D4CB5] rounded-lg text-white font-medium flex items-center gap-2 cursor-pointer"
                >
                  <img src={download} className="w-5 h-5" />
                  Export
                </button>

                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-28 bg-[#2E3439] border border-[#2A2D31] rounded-lg shadow-lg z-20 cursor-pointer">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#2A2F34] ">
                      <img src={pdf} className="w-4 h-4" />
                      PDF
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#2A2F34]">
                      <img src={excel} className="w-4 h-4" />
                      Excel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search (if Right Section hidden) */}
          {!showRightSection && (
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  onSearch && onSearch(e.target.value);
                }}
                placeholder="Search..."
                className="bg-[#131619] h-9 text-white text-sm px-9 rounded-lg border border-[#2A2F33] outline-none w-80"
              />
              <img
                src={searchIcon}
                alt="search"
                className="w-4 h-4 absolute left-3 top-2.5 opacity-70"
              />
            </div>
          )}
        </div>
      </div>

      {/* TABLE BODY */}
      <div className="bg-[#1A1F24] mt-[1.5px] py-4">
        <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px]">
          <thead>
            <tr className="text-[#FFFFFF] text-[12px] font-normal">
              {columns.map((col, index) =>
                sortableKeys.includes(col.key) ? (
                  <SortableHeader
                    key={index}
                    label={col.label}
                    columnKey={col.key}
                    sortBy={sortConfig.key}
                    sortAsc={sortConfig.asc}
                    onSort={handleSort}
                  />
                ) : (
                  <th key={index} className="py-3 text-center">
                    {col.label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="rounded-2xl hover:bg-[#151517] transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-3 text-center">
                    {renderCell(col, row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="bg-[#1A1F24] rounded-b-lg mt-[1.5px] p-4">
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
