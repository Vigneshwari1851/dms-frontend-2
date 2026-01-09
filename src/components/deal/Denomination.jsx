import { useState } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/Common/tick.svg";
import trash from "../../assets/reconciliation/trash.svg";
import trashHover from "../../assets/reconciliation/trash_hover.svg";
import NotificationCard from "../../components/common/Notification";
import Dropdown from "../../components/common/Dropdown";

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
  paidReadOnly = false
}) {
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
    const allOptions = ["100", "50", "20", "10", "5", "2", "1"];

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

  const renderTable = (
    title,
    list,
    setList,
    currency,
    currencySymbol,
    isReadOnly = false,
    listType
  ) => (
    <div className="bg-[#16191C] p-4 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-white">{title}</h3>

        {/* Currency Display (Read-only) */}
        <div className="h-10">
          <span className="text-[#939AF0] text-sm">
            {currencySymbol || ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className={`bg-[#1E2328] p-3 rounded-md ${isReadOnly ? 'opacity-70' : ''}`}>
        <table className="w-full text-sm text-white">
          <thead>
            <tr className="text-[#ABABAB] border-b border-[#1B1E21]">
              <th className="py-2 pr-6 text-left">Denomination</th>
              <th className="py-2 px-4 text-left">Quantity</th>
              <th className="py-2 pl-3 text-left">Total</th>
            </tr>
          </thead>

          <tbody>
            {list.map((row, i) => {
              const availableOptions = getAvailableOptions(list, i);

              return (
                <tr key={i} className="border-b border-[#1B1E21]">
                  {/* DENOMINATION DROPDOWN */}
                  <td className="py-2 pr-2">
                    {isReadOnly ? (
                      <div className="w-full h-10 bg-[#1B1E21] border border-[#2A2F33] rounded-md px-3 flex items-center">
                        <span>
                          {currencySymbol}
                          {row.price || "0.00"}
                        </span>
                      </div>
                    ) : (
                      <Dropdown
                        label={`${currencySymbol}0.00`}
                        options={availableOptions}
                        selected={row.price?.toString()}
                        onChange={(val) => {
                          const price =
                            typeof val === "string" ? val : val?.label;
                          const updated = [...list];
                          updated[i].price = price;
                          updated[i].total =
                            Number(updated[i].quantity || 0) *
                            Number(price || 0);
                          setList(updated);
                        }}
                        className="w-full"
                        renderOption={(opt) => `${currencySymbol}${opt}`}
                      />
                    )}
                  </td>

                  {/* QUANTITY */}
                  <td className="py-2 px-2">
                    <div
                      className={`flex items-center h-9 bg-[#16191C] rounded-md px-2 py-1 ${
                        isReadOnly ? "opacity-70" : ""
                      }`}
                    >
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => {
                          if (isReadOnly) return;
                          handleChange(list, setList, i, "quantity", e.target.value);
                        }}
                        onWheel={(e) => e.target.blur()}
                        className="bg-transparent outline-none text-white w-full"
                        placeholder="0"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>
                  </td>

                  {/* TOTAL */}
                  <td className="py-2 pl-2">
                    <input
                      type="number"
                      readOnly
                      value={row.total}
                      className="w-full h-9 bg-[#16191C] rounded-md px-2 py-1 text-[#ABABAB] cursor-not-allowed"
                    />
                  </td>

                  {/* DELETE BUTTON - Only show if not read-only */}
                  <td className="py-2 pl-2">
                    {!isReadOnly && (
                      <button
                        onClick={() => handleDeleteClick(listType, i)}
                        className="text-sm flex items-center gap-2"
                        disabled={list.length === 1}
                      >
                        <img
                          src={trash}
                          className="w-6 h-6"
                          alt="delete"
                          {...(list.length > 1
                            ? {
                              onMouseEnter: (e) => (e.currentTarget.src = trashHover),
                              onMouseLeave: (e) => (e.currentTarget.src = trash),
                              }
                            : {})}
                        />
                      </button>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {/* ADD BUTTON - Only show if not read-only */}
        {!isReadOnly && (
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
          <h1 className="text-[#00C853] font-medium">Total</h1>

          <input
            type="number"
            readOnly
            value={calculateTotal(list)}
            className="w-[140px] bg-[#1B1E21] border border-[#2A2F33] rounded-md px-2 py-1 text-[#00C853] text-right cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6 mt-8">
      {renderTable(
        "Denomination Received",
        denominationReceived,
        setDenominationReceived,
        receivedCurrency,
        currencySymbols[receivedCurrency] || "",
        receivedReadOnly,
        "received"
      )}
      {renderTable(
        "Denomination Paid",
        denominationPaid,
        setDenominationPaid,
        paidCurrency,
        currencySymbols[paidCurrency] || "",
        paidReadOnly,
        "paid"
      )}

      <NotificationCard
        confirmModal={confirmModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}