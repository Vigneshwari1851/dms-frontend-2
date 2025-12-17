import { useState } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/common/tick.svg";
import trash from "../../assets/reconciliation/trash.svg";


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
      .map((item, index) => index === currentIndex ? null : item.price)
      .filter(price => price && price !== "0" && price !== 0);

    // Filter out already selected prices
    return allOptions.filter(option => !selectedPrices.includes(option));
  };

  const handleDelete = (list, setList, index, isReadOnly) => {
    if (isReadOnly) return;
    if (list.length === 1) return;
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
  };



  // ------------------------------------------------------

  const renderTable = (
    title,
    list,
    setList,
    currency,
    currencySymbol,
    isReadOnly = false
  ) => (
    <div className="bg-[#16191C] p-4 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-white">{title}</h3>

        {/* Currency Display (Read-only) */}
        <div className="h-10">
          <span className="text-[#939AF0] text-sm">
            {currency || ""}
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
                    <div className="relative w-full">
                      <button
                        onClick={() => {
                          if (isReadOnly) return;
                          const updated = [...list];
                          updated[i].open = !updated[i].open;
                          setList(updated);
                        }}
                        className={`
                          w-full h-10
                          bg-[#1B1E21]
                          border border-[#2A2F33]
                          rounded-md
                          px-3
                          text-left text-white
                          flex items-center justify-between
                          ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                        `}
                        disabled={isReadOnly}
                      >
                        <span>
                          {row.price
                            ? `${currencySymbol}${row.price}`
                            : `${currencySymbol}0.00`}
                        </span>

                        {!isReadOnly && <img src={down} className="w-3" />}
                      </button>

                      {row.open && !isReadOnly && (
                        <ul
                          className="
                            absolute left-0 right-0 mt-2 z-20
                            bg-[#2E3439]
                            border border-[#2A2F33]
                            rounded-lg
                          "
                        >
                          {availableOptions.map((item) => (
                            <li
                              key={item}
                              onClick={() => {
                                const updated = [...list];
                                updated[i].price = item;
                                updated[i].open = false;
                                updated[i].total =
                                  Number(updated[i].quantity || 0) * Number(item);

                                setList(updated);
                              }}
                              className="
                                px-4 py-2 
                                flex items-center justify-between
                                hover:bg-[#1E2328] cursor-pointer text-white
                              "
                            >
                              <span>
                                {currencySymbol}
                                {item}
                              </span>

                              {row.price === item && (
                                <img src={tick} className="w-4 h-4" />
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </td>

                  {/* QUANTITY */}
                  <td className="py-2 px-2">
                    <div className={`flex items-center bg-[#1B1E21] border border-[#2A2F33] rounded-md px-2 py-1 ${isReadOnly ? 'opacity-70' : ''}`}>
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => {
                          if (isReadOnly) return;
                          handleChange(list, setList, i, "quantity", e.target.value);
                        }}
                        className="bg-transparent outline-none text-white w-full"
                        placeholder="0"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />

                      {/* UP / DOWN BUTTONS - Only show if not read-only */}
                      {!isReadOnly && (
                        <div className="flex flex-col ml-2">
                          <button
                            onClick={() =>
                              handleChange(
                                list,
                                setList,
                                i,
                                "quantity",
                                Number(row.quantity || 0) + 1
                              )
                            }
                            className="w-3 h-3 flex items-center justify-center"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="#E3E3E3"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 15l6-6 6 6" />
                            </svg>
                          </button>

                          <button
                            onClick={() =>
                              handleChange(
                                list,
                                setList,
                                i,
                                "quantity",
                                Math.max(0, Number(row.quantity || 0) - 1)
                              )
                            }
                            className="w-3 h-3 flex items-center justify-center"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="#E3E3E3"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 9l-6 6-6-6" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* TOTAL */}
                  <td className="py-2 pl-2">
                    <input
                      type="number"
                      readOnly
                      value={row.total}
                      className="
                        w-full bg-[#1B1E21] border border-[#2A2F33]
                        rounded-md px-2 py-1 text-[#ABABAB] cursor-not-allowed
                      "
                    />
                  </td>

                  {/* DELETE BUTTON - Only show if not read-only */}
                  <td className="py-2 pl-2">
                    {!isReadOnly && (
                      <button
                        onClick={() => handleDelete(list, setList, i, isReadOnly)}
                        className="text-sm flex items-center gap-2"
                      >
                        <img src={trash} className="w-6 h-6" alt="delete" />
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
            className="
              w-[140px] bg-[#1B1E21] border border-[#2A2F33]
              rounded-md px-2 py-1 text-[#00C853] text-right cursor-not-allowed
            "
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
        receivedReadOnly
      )}
      {renderTable(
        "Denomination Paid",
        denominationPaid,
        setDenominationPaid,
        paidCurrency,
        currencySymbols[paidCurrency] || "",
        paidReadOnly
      )}
    </div>
  );
}