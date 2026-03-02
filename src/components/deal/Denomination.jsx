import { useState } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/Common/tick.svg";
import trash from "../../assets/reconciliation/trash.svg";
import trashHover from "../../assets/reconciliation/trash_hover.svg";
import NotificationCard from "../../components/common/Notification";
import Dropdown from "../../components/common/Dropdown";
import deleteIcon from "../../assets/dashboard/delete.svg";
import addDenomination from "../../assets/dashboard/adddeno.svg";

export default function Denomination({
  denominationReceived: propReceived,
  setDenominationReceived: setPropReceived,
  denominationPaid: propPaid,
  setDenominationPaid: setPropPaid,
  receivedCurrency = "",
  paidCurrency = "",
  currencySymbols = {},
  isEditable = true,
  receivedReadOnly = true,
  paidReadOnly = false,
  hideAddReceived = false,
  hideAddPaid = false,
  receivedAmount = 0,
  paidAmount = 0,
  transactionType = "",
}) {
  const [activeTab, setActiveTab] = useState("received");
  // Use props if provided, otherwise use local state
  const [denominationReceived, setDenominationReceived] = propReceived
    ? [propReceived, setPropReceived]
    : useState([{ price: 0, quantity: 0, currency_id: 1 }]);

  const [denominationPaid, setDenominationPaid] = propPaid
    ? [propPaid, setPropPaid]
    : useState([{ price: 0, quantity: 0, currency_id: 1 }]);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    actionType: "",
    rowIndex: null,
    listType: null
  });

  const handleChange = (list, setList, index, field, value) => {
    const updated = [...list];
    updated[index][field] = value;

    if (field === "price" || field === "quantity") {
      const p = parseFloat(updated[index].price || 0);
      const q = parseFloat(updated[index].quantity || 0);
      updated[index].total = p * q;
    }

    setList(updated);
  };

  const handleAdd = (list, setList, isReadOnly) => {
    if (isReadOnly) return;
    setList([...list, { price: 0, quantity: 0, total: 0, currency_id: 1 }]);
  };

  const calculateTotal = (list) => {
    return list.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  };

  // Get available denomination options excluding already selected ones
  const getAvailableOptions = (list, currentIndex) => {
    const allOptions = ["10000", "5000", "2000", "1000", "500", "200", "100", "50"];

    // Get all selected prices except the current row's price
    const selectedPrices = list
      .map((item, index) => index === currentIndex ? null : String(item.price))
      .filter(price => price && price !== "0" && price !== "undefined" && price !== "null");

    return allOptions.filter((option) => !selectedPrices.includes(option));
  };

  // Open confirmation modal on trash click
  const handleDeleteClick = (listType, index) => {
    setConfirmModal({
      open: true,
      title: "Please Confirm: Delete This Denomination Entry Permanently",
      message: "Are you sure you want to delete this denomination?",
      actionType: "remove",
      rowIndex: index,
      listType
    });
  };


  const handleConfirmDelete = () => {
    const { rowIndex, listType } = confirmModal;

    if (listType === "received") {
      if (denominationReceived.length > 1) {
        setDenominationReceived((prev) =>
          prev.filter((_, i) => i !== rowIndex)
        );
      }
    } else if (listType === "paid") {
      if (denominationPaid.length > 1) {
        setDenominationPaid((prev) =>
          prev.filter((_, i) => i !== rowIndex)
        );
      }
    }

    setConfirmModal({ open: false });
  };

  const handleCancelDelete = () => {
    setConfirmModal({ open: false });
  };

  const shouldHideAddMobile = (list, listType) => {
    const denominationTotal = calculateTotal(list);

    if (listType === "received") {
      return Number(denominationTotal) === Number(receivedAmount);
    }

    if (listType === "paid") {
      return Number(denominationTotal) === Number(paidAmount);
    }

    return false;
  };


  const renderTable = (
    title,
    list,
    setList,
    currency,
    currencySymbol,
    isReadOnly = false,
    listType
  ) => (
    <div className="bg-[#16191C] px-3 py-4 lg:p-4 rounded-xl lg:rounded-lg">
      {/* MOBILE HEADER */}
      <div className="flex lg:hidden justify-between items-center mb-2">
        <h3 className="text-[14px] font-medium text-white">{title}</h3>
        <span className="text-[#939AF0] text-sm font-semibold">
          {currencySymbol || currency}
        </span>
      </div>
      <hr className="block lg:hidden border-[#2A2F33] opacity-80 mb-3" />

      {/* DESKTOP HEADER */}
      <div className="hidden lg:flex justify-between items-center mb-4">
        <h3 className="font-medium text-white">{title}</h3>
        <div className="h-10 flex items-center">
          <span className="text-[#939AF0] text-sm">
            {currencySymbol || ""}
          </span>
        </div>
      </div>

      {/* MOBILE CONTENT (Compact Grid) */}

      {!isReadOnly && !shouldHideAddMobile(list, listType) && (
        <div className="flex justify-end mb-2 lg:hidden">
          <button
            onClick={() => handleAdd(list, setList, isReadOnly)}
            className="transition-all hover:scale-105 active:scale-95 p-1"
          >
            <img src={addDenomination} alt="add" className="h-7 w-7" />
          </button>
        </div>
      )}



      <div className="lg:hidden">
        <div className="space-y-4">
          <div className="grid grid-cols-[1.2fr_0.8fr_1fr_40px] gap-2 items-center mb-2">
            <label className="text-[#ABABAB] text-[11px] font-medium">Denomination</label>
            <label className="text-[#ABABAB] text-[11px] font-medium text-center">Qty</label>
            <label className="text-[#ABABAB] text-[11px] font-medium text-center">Total</label>
            <span></span>
          </div>

          <div className="space-y-3">
            {list.map((row, i) => (
              <div key={i} className="grid grid-cols-[1.2fr_0.8fr_1fr_40px] gap-2 items-center">
                <div className="min-w-0">
                  {isReadOnly ? (
                    <div className="w-full h-[30px] bg-[#14171A] border! border-[#4B5563]! rounded-[4px] px-2 flex items-center text-white text-[12px]">
                      {row.price || "0"}
                    </div>
                  ) : (
                    <Dropdown
                      label="0"
                      options={getAvailableOptions(list, i)}
                      selected={row.price?.toString()}
                      onChange={(val) => {
                        const price = typeof val === "string" ? val : val?.label;
                        const updated = [...list];
                        updated[i].price = price;
                        updated[i].total = Number(updated[i].quantity || 0) * Number(price || 0);
                        setList(updated);
                      }}
                      className="w-full"
                      renderOption={(opt) => opt}
                      buttonClassName="bg-[#14171A] !border !border-[#4B5563] h-[30px] !rounded-[4px] text-white text-[12px] !py-0 !px-2"
                    />
                  )}
                </div>


                <div className="min-w-0">
                  <input
                    type="number"
                    value={row.quantity === 0 ? "" : row.quantity}
                    onChange={(e) => !isReadOnly && handleChange(list, setList, i, "quantity", e.target.value)}
                    onFocus={(e) => {
                      if (!isReadOnly && (row.quantity === 0 || row.quantity === "0")) {
                        handleChange(list, setList, i, "quantity", "");
                      }
                    }}
                    className={`w-full h-[30px] bg-[#14171A] border! border-[#4B5563]! rounded-[4px] px-2 text-white text-[12px] outline-none focus:border-[#4B5563] ${isReadOnly ? " cursor-not-allowed" : ""}`}
                    readOnly={isReadOnly}
                  />
                </div>


                <div className="min-w-0">
                  <div className="w-full h-[30px] bg-[#14171A] border! border-[#4B5563]! rounded-[4px] px-2 flex items-center text-white text-[12px] overflow-hidden">
                    <span className="truncate">{(Number(row.total) || 0).toLocaleString()}</span>
                  </div>
                </div>

                {!isReadOnly && list.length > 1 ? (
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleDeleteClick(listType, i)}
                      className="flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                    >
                      <img src={deleteIcon} alt="delete" className="w-7 h-7" />
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            ))}
          </div>


          <div className="pt-4">
            <div className="bg-[#1B1E21]/80 flex justify-between items-center px-4 py-2 rounded-lg border border-[#1B1E21]">
              <span className={`${Math.abs(calculateTotal(list) - (listType === "received" ? receivedAmount : paidAmount)) > 0.01 ? "text-red-500" : "text-[#00C853]"} font-medium text-[13px]`}>Total</span>
              <span className={`${Math.abs(calculateTotal(list) - (listType === "received" ? receivedAmount : paidAmount)) > 0.01 ? "text-red-500" : "text-[#00C853]"} font-semibold text-[14px]`}>
                {calculateTotal(list).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP CONTENT (Table Grid) */}
      <div className={`hidden lg:block bg-[#1E2328] p-3 rounded-md ${isReadOnly ? 'opacity-70' : ''}`}>
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="text-[#ABABAB] border-b border-[#1B1E21]">
              <th className="py-2 px-2 text-left">Denomination</th>
              <th className="py-2 px-2 text-left">Quantity</th>
              <th className="py-2 px-2 text-left">Total</th>
              <th className="py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((row, i) => (
              <tr key={i} className="border-b border-[#1B1E21]">
                <td className="py-2 px-2">
                  {isReadOnly ? (
                    <div className="w-full h-10 bg-[#1B1E21] border border-[#2A2F33] rounded-md px-3 flex items-center">
                      <span>{row.price || "0.00"}</span>
                    </div>
                  ) : (
                    <Dropdown
                      label={row.price || "0.00"}
                      options={getAvailableOptions(list, i)}
                      selected={row.price?.toString()}
                      onChange={(val) => {
                        const price = typeof val === "string" ? val : val?.label;
                        const updated = [...list];
                        updated[i].price = price;
                        updated[i].total = Number(updated[i].quantity || 0) * Number(price || 0);
                        setList(updated);
                      }}
                      className="w-full"
                      renderOption={(opt) => `${opt}`}
                    />
                  )}
                </td>
                <td className="py-2 px-2">
                  <div className={`flex items-center bg-[#16191C] h-9 rounded-md px-2 py-1 ${isReadOnly ? "opacity-70" : ""}`}>
                    <input
                      type="number"
                      value={row.quantity === 0 ? "" : row.quantity}
                      onChange={(e) => !isReadOnly && handleChange(list, setList, i, "quantity", e.target.value)}
                      onFocus={(e) => {
                        if (!isReadOnly && (row.quantity === 0 || row.quantity === "0")) {
                          handleChange(list, setList, i, "quantity", "");
                        }
                      }}
                      onWheel={(e) => e.target.blur()}
                      className="bg-transparent outline-none text-white w-full"
                      readOnly={isReadOnly}
                      disabled={isReadOnly}
                    />
                  </div>
                </td>
                <td className="py-2 px-2">
                  <input type="number" readOnly value={row.total} className="w-full h-9 bg-[#16191C] rounded-md px-2 py-1 text-[#ABABAB] cursor-not-allowed" />
                </td>
                <td className="py-2 px-2">
                  {!isReadOnly && (
                    <button onClick={() => handleDeleteClick(listType, i)} className="text-sm flex items-center gap-2" disabled={list.length === 1}>
                      <img
                        src={trash}
                        className="w-8 h-8"
                        alt="delete"
                        {...(list.length > 1 ? { onMouseEnter: (e) => (e.currentTarget.src = trashHover), onMouseLeave: (e) => (e.currentTarget.src = trash) } : {})}
                      />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ADD BUTTON - Only show if not read-only */}
        {!isReadOnly &&
          !(
            (listType === "received" && hideAddReceived) ||
            (listType === "paid" && hideAddPaid)
          ) && (
            <div className="flex justify-end">
              <button
                className="mt-4 w-20 border border-[#ABABAB] bg-transparent py-2 rounded-lg text-[#ABABAB]"
                onClick={() => handleAdd(list, setList, isReadOnly)}
              >
                + Add
              </button>
            </div>
          )}

        {/* TOTAL FIELD */}
        <div className="flex justify-between items-center mt-4">
          <h1 className={`${Math.abs(calculateTotal(list) - (listType === "received" ? receivedAmount : paidAmount)) > 0.01 ? "text-red-500" : "text-[#00C853]"} font-medium`}>Total</h1>
          <input type="number" readOnly value={calculateTotal(list)} className={`w-[140px] bg-[#16191C] rounded-md px-2 py-1 ${Math.abs(calculateTotal(list) - (listType === "received" ? receivedAmount : paidAmount)) > 0.01 ? "text-red-500" : "text-[#00C853]"} text-right cursor-not-allowed`} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex lg:hidden bg-[#1E2328] p-1 rounded-xl mb-6 mt-4">
        <button
          onClick={() => setActiveTab("received")}
          className={`flex-1 py-1 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === "received"
            ? "bg-[#2A2F34] text-white shadow-lg"
            : "text-[#ABABAB] hover:text-white"
            }`}
        >
          Received
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`flex-1 py-1 px-3 text-sm font-medium rounded-lg transition-all ${activeTab === "paid"
            ? "bg-[#2A2F34] text-white shadow-lg"
            : "text-[#ABABAB] hover:text-white"
            }`}
        >
          Paid
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-0 lg:mt-8">
        {/* DENOMINATION RECEIVED SECTION */}
        <div className={activeTab === "received" ? "block" : "hidden lg:block"}>
          {renderTable(
            "Denomination Received",
            denominationReceived,
            setDenominationReceived,
            receivedCurrency,
            currencySymbols[receivedCurrency] || "",
            receivedReadOnly,
            "received"
          )}
        </div>

        {/* DENOMINATION PAID SECTION */}
        <div className={activeTab === "paid" ? "block" : "hidden lg:block"}>
          {renderTable(
            "Denomination Paid",
            denominationPaid,
            setDenominationPaid,
            paidCurrency,
            currencySymbols[paidCurrency] || "",
            paidReadOnly,
            "paid"
          )}
        </div>

        <NotificationCard
          confirmModal={confirmModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </>
  );
}