import { useState } from "react";
import down from "../../assets/dashboard/down.svg";
import download from "../../assets/dashboard/download.svg";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";
import Dropdown from "../common/Dropdown";
import leftArrow from "../../assets/Common/left.svg";
import rightArrow from "../../assets/Common/right.svg";
import Pagination from "../common/Pagination";

export default function DealsTable() {
  const data = [
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "30,000",
      currency1: "TZS",
      status: "Pending",
    },
    {
      id: "D002",
      date: "2025/01/26",
      type: "Sell",
      customer: "XYZ",
      buyAmt: "--------",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "40,000",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D002",
      date: "2025/01/26",
      type: "Sell",
      customer: "XYZ",
      buyAmt: "30,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "40,000",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D002",
      date: "2025/01/26",
      type: "Sell",
      customer: "XYZ",
      buyAmt: "30,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "--------",
      currency1: "EUR",
      status: "Completed",
    },
    {
      id: "D002",
      date: "2025/01/26",
      type: "Sell",
      customer: "XYZ",
      buyAmt: "30,000",
      currency: "GBP",
      rate: "92.10",
      sellAmt: "40,000",
      currency1: "USD",
      status: "Completed",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
    {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Completed",
    },
     {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
     {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
     {
      id: "D001",
      date: "2025/01/26",
      type: "Buy",
      customer: "Krishna",
      buyAmt: "50,000",
      currency: "USD",
      rate: "81.90",
      sellAmt: "60,000",
      currency1: "EUR",
      status: "Pending",
    },
  ];

  const statusColors = {
    Pending: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
    Completed: "bg-[#1D4CB53D] text-[##88ACFC] border border-[#88ACFC]",
  };

  const typeColors = {
    Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
    Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
  };

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies");

  const [sortBy, setSortBy] = useState(null);     // "type" | "currency"
  const [sortAsc, setSortAsc] = useState(true);   // true = asc, false = desc

  const statuses = ["All Status", "Pending", "Completed"];
  const currencies = ["All Currencies", "USD", "EUR", "GBP"];

  const filteredData = data.filter(
    (item) =>
      (statusFilter === "All Status" || item.status === statusFilter) &&
      (currencyFilter === "All Currencies" ||
        item.currency === currencyFilter)
  );

  let filteredAndSortedData = [...filteredData];

  if (sortBy === "type") {
    filteredAndSortedData.sort((a, b) =>
      sortAsc
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type)
    );
  }

  if (sortBy === "currency") {
    filteredAndSortedData.sort((a, b) =>
      sortAsc
        ? a.currency.localeCompare(b.currency)
        : b.currency.localeCompare(a.currency)
    );
  }


  // -------- Pagination Logic --------
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  // -----------------------------------

  return (
    <div className="mt-6 bg-[#1A1F24] p-5 rounded-xl border border-[#2A2F33]">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-[16px] font-semibold">
          Today’s Deals
        </h2>

        <div className="flex items-center gap-3">
          <Dropdown
            label="All Status"
            options={statuses}
            selected={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          />

          <Dropdown
            label="All Currencies"
            options={currencies}
            selected={currencyFilter}
            onChange={(value) => setCurrencyFilter(value)}
          />

          <button className="px-5 py-2 bg-[#1D4CB5] rounded-lg text-white font-medium flex items-center gap-2">
            <img src={download} alt="download" className="w-6 h-6" />
            Export
          </button>
        </div>
      </div>

      <div className="w-[1156px] border-b-[3px] border-[#16191C] m-2"></div>

      {/* Table */}
      <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px]">
        <thead>
          <tr className="text-[#FFFFFF] text-[12px] font-normal">
            <th className="py-3">Deal ID</th>
            <th>Date</th>

            {/* TYPE SORT */}
            <th
              className="py-3  cursor-pointer select-none "
              onClick={() => {
                if (sortBy === "type") setSortAsc(!sortAsc);
                else {
                  setSortBy("type");
                  setSortAsc(true);
                }
              }}
            >
              <div className="flex items-center gap-1 ml-2 justify-center ">
                Type
                <span className="flex flex-col ">
                  <img
                    src={uparrowIcon}
                    className={`w-3 h-3 -mt-[5px] ${!sortAsc  ? "opacity-100" : "opacity-30"
                      }`}
                  />
                  <img
                    src={downarrowIcon}
                    className={`w-3 h-3 -mt-3 ml-1.5 ${sortAsc ? "opacity-100" : "opacity-30"
                      }`}
                  />
                </span>
              </div>
            </th>

            <th>Customer Name</th>
            <th>Buy Amount</th>

            {/* CURRENCY SORT */}
            <th
              className="py-3 cursor-pointer select-none"
              onClick={() => {
                if (sortBy === "currency") setSortAsc(!sortAsc);
                else {
                  setSortBy("currency");
                  setSortAsc(true);
                }
              }}

            >
              <div className="flex items-center gap-1 ml-2 justify-center">
                Currency
                <span className="flex flex-col">
                  <img
                    src={uparrowIcon}
                    className={`w-3 h-3 -mt-[5px] ${!sortAsc ? "opacity-100" : "opacity-30"
                      }`}
                  />
                  <img
                    src={downarrowIcon}
                    className={`w-3 h-3 -mt-3 ml-1.5 ${sortAsc ? "opacity-100" : "opacity-30"
                      }`}
                  />
                </span>
              </div>
            </th>

            <th>Rate</th>
            <th>Sell Amount</th>
            <th>Currency</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={index} className="rounded-2xl border-b border-gray-800 hover:bg-[#151517] transition-colors">
              <td className="py-3 text-[#92B4FF] font-bold text-[14px]">{item.id}</td>
              <td>{item.date}</td>

              <td>
                <div className="flex justify-center items-center">
                  <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                </div>
              </td>

              <td>{item.customer}</td>
              <td>{item.buyAmt}</td>
              <td>{item.currency}</td>
              <td>{item.rate}</td>
              <td>{item.sellAmt}</td>
              <td>{item.currency1}</td>

              <td>
                <div className="flex justify-center items-center">
                  <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ------------ Pagination (Right-Aligned) ------------ */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      />
      {/* ------------------------------------------------------ */}
    </div>
  );
}
