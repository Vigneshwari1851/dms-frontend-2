import { useState, useEffect, useRef } from "react";
import down from "../../assets/dashboard/down.svg";
import trash from "../../assets/reconciliation/trash.svg";
import tick from "../../assets/common/tick.svg";
import { fetchCurrencies } from "../../api/currency/currency";
import trashHover from "../../assets/reconciliation/trash_hover.svg";
import NotificationCard from "../../components/common/Notification";

export default function OpeningVaultBalance({ data, setData, type }) {
    const wrapperRef = useRef(null);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [currencyMap, setCurrencyMap] = useState({});
    const [currencySymbols, setCurrencySymbols] = useState({});
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        actionType: "remove",
        title: "",
        message: "",
        sectionId: null,
        rowIndex: null,
    });


    // Initialize with one section if none exists
    useEffect(() => {
        const loadCurrencies = async () => {
            const currencies = await fetchCurrencies({ page: 1, limit: 100 });

            if (currencies && currencies.length > 0) {
                const map = {};
                const symbols = {};

                currencies.forEach((c) => {
                    map[c.code] = c.id;
                    symbols[c.code] = c.symbol || "";
                });

                setCurrencyOptions(currencies.map((c) => c.code));
                setCurrencyMap(map);
                setCurrencySymbols(symbols);

                // Initialize data structure if empty
                const defaultCurrency =
                    currencies.find(c => c.code === "USD") || currencies[0];

                if (!data.sections || data.sections.length === 0) {
                    setData(prev => ({
                        ...prev,
                        sections: [{
                            id: Date.now(),
                            selectedCurrency: defaultCurrency.code,
                            currencyId: defaultCurrency.id,
                            exchangeRate: "",
                            rows: [{ denom: "", qty: "", total: 0, open: false }],
                            currencyOpen: false
                        }]
                    }));
                }
            }
        };

        loadCurrencies();
    }, []);

    useEffect(() => {
    const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setData(prev => ({
            ...prev,
            sections: prev.sections.map(section => ({
            ...section,
            currencyOpen: false,
            rows: section.rows.map(row => ({ ...row, open: false })),
            })),
        }));
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setData]);

    const handleConfirmDelete = () => {
        if (confirmModal.rowIndex !== null) {
            deleteRow(confirmModal.sectionId, confirmModal.rowIndex);
        } else {
            deleteSection(confirmModal.sectionId);
        }

        setConfirmModal({ open: false });
    };

    // Handle currency selection for a specific section
    const handleCurrencySelect = (sectionId, currencyName) => {
        const currencyId = currencyMap[currencyName];

        setData(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId
                    ? {
                        ...section,
                        selectedCurrency: currencyName,
                        currencyId: currencyId,
                        exchangeRate: "",
                        currencyOpen: false
                    }
                    : section
            )
        }));
    };

    // Handle row changes within a specific section
    const handleRowChange = (sectionId, rowIndex, field, value) => {
        setData(prev => ({
            ...prev,
            sections: prev.sections.map(section => {
                if (section.id !== sectionId) return section;

                const updatedRows = [...section.rows];
                updatedRows[rowIndex][field] = value;

                // Recalculate total if denom or qty changes
                if (field === "denom" || field === "qty") {
                    const d = parseFloat(updatedRows[rowIndex].denom || 0);
                    const q = parseFloat(updatedRows[rowIndex].qty || 0);
                    updatedRows[rowIndex].total = d * q;
                }

                return { ...section, rows: updatedRows };
            })
        }));
    };

    // Handle exchange rate change for a specific section
    const handleRateChange = (sectionId, value) => {
        setData(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId
                    ? { ...section, exchangeRate: value }
                    : section
            )
        }));
    };

    // Add a new currency section
    const addNewCurrencySection = () => {
        const defaultCurrency = currencyOptions[0] || "USD";
        const defaultCurrencyId = currencyMap[defaultCurrency] || 1;

        setData(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    id: Date.now(),
                    selectedCurrency: defaultCurrency,
                    currencyId: defaultCurrencyId,
                    exchangeRate: "",
                    rows: [{ denom: "", qty: "", total: 0, open: false }],
                    currencyOpen: false
                }
            ]
        }));
    };


    // Add a row to a specific section
    const addRow = (sectionId) => {
        setData(prev => ({
            ...prev,
            sections: prev.sections.map(section => {
                if (section.id !== sectionId) return section;

                // Always add a fresh empty row instead of copying last row values
                return {
                    ...section,
                    rows: [
                        ...section.rows,
                        {
                            denom: "",
                            qty: "",
                            total: 0,
                            open: false
                        }
                    ]
                };
            })
        }));
    };

    // Delete a row from a specific section
    const deleteRow = (sectionId, rowIndex) => {
        setData(prev => ({
            ...prev,
            sections: prev.sections.map(section => {
                if (section.id !== sectionId) return section;

                // Don't delete the last row, just reset it
                if (section.rows.length <= 1) {
                    const updatedRows = [...section.rows];
                    updatedRows[rowIndex] = { denom: "", qty: "", total: 0, open: false };
                    return { ...section, rows: updatedRows };
                }

                // Delete the row if there's more than one
                const updatedRows = [...section.rows];
                updatedRows.splice(rowIndex, 1);
                return { ...section, rows: updatedRows };
            })
        }));
    };

    // Raw total per section
    const calculateRawSectionTotal = (section) => {
        return section.rows.reduce(
            (sum, item) => sum + Number(item.total || 0),
            0
        );
    };

    // Converted total per section (TZS)
    const calculateConvertedSectionTotal = (section) => {
        const rawTotal = calculateRawSectionTotal(section);
        const rate = Number(section.exchangeRate || 1);
        return rate > 0 ? rawTotal / rate : rawTotal;
    };

    // Grand total (TZS only)
    const calculateGrandTotal = () => {
        if (!data.sections) return 0;

        return data.sections.reduce(
            (sum, section) => sum + calculateConvertedSectionTotal(section),
            0
        );
    };


    // Delete an entire currency section
    const deleteSection = (sectionId) => {
        // Don't delete if it's the last section
        if (data.sections.length <= 1) return;

        setData(prev => ({
            ...prev,
            sections: prev.sections.filter(section => section.id !== sectionId)
        }));
    };

    // Toggle currency dropdown for a specific section
const toggleCurrencyDropdown = (sectionId) => {
  setData(prev => ({
    ...prev,
    sections: prev.sections.map(section => {
      if (section.id === sectionId) {
        // Toggle this one, close all row dropdowns
        return {
          ...section,
          currencyOpen: !section.currencyOpen,
          rows: section.rows.map(row => ({ ...row, open: false }))
        };
      }
      // Close all other sections
      return { ...section, currencyOpen: false, rows: section.rows.map(row => ({ ...row, open: false })) };
    })
  }));
};

// Toggle denomination dropdown
const toggleRowDropdown = (sectionId, rowIndex) => {
  setData(prev => ({
    ...prev,
    sections: prev.sections.map(section => {
      if (section.id !== sectionId) {
        // Close all dropdowns in other sections
        return { ...section, currencyOpen: false, rows: section.rows.map(row => ({ ...row, open: false })) };
      }

      const updatedRows = [...section.rows];
      // Toggle only the clicked row
      updatedRows[rowIndex].open = !updatedRows[rowIndex].open;

      // Close other rows in this section
      updatedRows.forEach((row, idx) => {
        if (idx !== rowIndex) row.open = false;
      });

      // Close currency dropdown of this section if row opens
      return { ...section, rows: updatedRows, currencyOpen: false };
    })
  }));
};

    // Select a denomination for a specific row
    const selectDenomination = (sectionId, rowIndex, value) => {
        setData(prev => ({
            ...prev,
            sections: prev.sections.map(section => {
                if (section.id !== sectionId) return section;

                const updatedRows = [...section.rows];
                updatedRows[rowIndex].denom = value;
                updatedRows[rowIndex].open = false;

                // Recalculate total
                const d = parseFloat(value || 0);
                const q = parseFloat(updatedRows[rowIndex].qty || 0);
                updatedRows[rowIndex].total = d * q;

                return { ...section, rows: updatedRows };
            })
        }));
    };

    // Common denomination options
    const denominationOptions = ["100", "50", "20", "10", "5", "2", "1"];

    // Show sections only if they exist
    if (!data.sections || data.sections.length === 0) {
        return (
            <div className="text-gray-400 text-center py-4">
                Loading currencies...
            </div>
        );
    }

    // Get already selected denominations in a section
    const getUsedDenominations = (section) => {
        return section.rows
            .map(row => row.denom)
            .filter(denom => denom !== "");
    };


    return (
        <div className="mt-4" ref={wrapperRef}>
            {/* Render each currency section */}
            {data.sections.map((section, sectionIndex) => (
                <div key={section.id} className="mb-6">
                    <div className="bg-[#1E2328] border border-[#16191C] rounded-xl p-3 w-full">

                        {/* SECTION HEADER WITH CURRENCY DROPDOWN */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <button
                                        onClick={() => toggleCurrencyDropdown(section.id)}
                                        className="w-auto min-w-[90px] h-6 bg-transparent rounded-lg text-[#E3E3E3] flex items-center text-center justify-between px-4"
                                    >
                                        <span className="text-[#939AF0] text-sm truncate max-w-[180px]">
                                            {section.selectedCurrency || "Select Currency"}
                                        </span>
                                        <img src={down} className="w-3 shrink-0" alt="dropdown" />
                                    </button>

                                    {section.currencyOpen && (
                                        <ul className="absolute left-0 mt-2 w-auto min-w-[90px]
            bg-[#2E3439] border border-[#2A2F33] rounded-lg z-20">
                                            {currencyOptions.map((item) => (
                                                <li
                                                    key={item}
                                                    onClick={() => handleCurrencySelect(section.id, item)}
                                                    className="px-4 py-2 flex items-center justify-between 
                        hover:bg-[#1E2328] cursor-pointer text-white"
                                                >
                                                    <span className="truncate max-w-[200px]">{item}</span>
                                                    {section.selectedCurrency === item && (
                                                        <img src={tick} className="w-4 h-4 shrink-0" alt="selected" />
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* EXCHANGE RATE INPUT */}
                                <div className="flex items-center gap-3 pl-4">
                                    <label className="text-gray-400 text-sm">Rate:</label>
                                    <input
                                        type="number"
                                        // min="0"
                                        // step="0.0001"
                                        value={section.exchangeRate || ""}
                                        onChange={(e) => handleRateChange(section.id, e.target.value)}
                                        className="bg-[#16191C]  text-white rounded-lg px-2 py-1 w-24 text-sm outline-none "
                                    // placeholder="Exchange rate"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                {data.sections.length > 1 && (
                                    <button
                                        onClick={() =>
                                            setConfirmModal({
                                                open: true,
                                                actionType: "remove",
                                                title: "Remove Currency",
                                                message: "Are you sure you want to remove this currency?",
                                                sectionId: section.id,
                                                rowIndex: null,
                                            })
                                        }
                                        className="px-3 py-1 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <img src={trash} className="w-5 h-5" alt="delete" onMouseEnter={(e) => (e.currentTarget.src = trashHover)} onMouseLeave={(e) => (e.currentTarget.src = trash)} />
                                        Remove Currency
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* INNER CARD */}
                        <div className="bg-[#16191C] p-5 rounded-lg mx-auto">
                            {/* TABLE HEADER */}
                            <div className="grid grid-cols-3 gap-6 text-[#ABABAB] text-[14px] mb-2">
                                <p>Denomination</p>
                                <p>Quantity</p>
                                <p>Total</p>
                            </div>

                            {/* ROWS */}
                            {section.rows.map((row, i) => (
                                <div key={i} className="grid grid-cols-3 gap-6 mb-4 border-b border-[#1E2328] pb-4 relative">

                                    {/* DENOMINATION DROPDOWN */}
                                    <div className="relative">
                                        <button
                                            onClick={() => toggleRowDropdown(section.id, i)}
                                            className="w-full bg-[#1E2328] rounded-lg px-3 py-2 text-white flex justify-between items-center"
                                        >
                                            <span>
                                                {row.denom
                                                    ? currencySymbols[section.selectedCurrency] + row.denom
                                                    : currencySymbols[section.selectedCurrency] + "0.00"}
                                            </span>
                                            <img src={down} className="w-3" alt="dropdown" />
                                        </button>

                                        {row.open && (
                                            <ul className="absolute w-full mt-2 bg-[#2E3439] 
                                            border border-[#2A2F33] rounded-lg z-30">
                                                {denominationOptions
                                                    .filter(item => {
                                                        // Allow current row value
                                                        if (row.denom === item) return true;

                                                        // Hide already selected denominations in other rows
                                                        return !getUsedDenominations(section).includes(item);
                                                    })
                                                    .map((item) => (
                                                        <li
                                                            key={item}
                                                            onClick={() => selectDenomination(section.id, i, item)}
                                                            className="px-4 py-2 flex justify-between hover:bg-[#1E2328] text-white cursor-pointer"
                                                        >
                                                            <span>{currencySymbols[section.selectedCurrency]}{item}</span>
                                                            {row.denom === item && (
                                                                <img src={tick} className="w-4 h-4" alt="selected" />
                                                            )}
                                                        </li>
                                                    ))}

                                            </ul>
                                        )}
                                    </div>

                                    {/* QUANTITY */}
                                    <div className="flex items-center bg-[#1E2328] rounded-lg px-2 py-1">
                                        <input
                                            type="number"
                                            value={row.qty}
                                            onChange={(e) =>
                                                handleRowChange(section.id, i, "qty", e.target.value)
                                            }
                                            onWheel={(e) => e.target.blur()}
                                            className="bg-transparent outline-none text-white w-full"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>

                                    {/* TOTAL + DELETE */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            readOnly
                                            value={row.total}
                                            className="w-full bg-[#1E2328] rounded-lg px-3 py-2 text-[#ABABAB]"
                                        />

                                        {/* Show delete button only if there's more than one row */}
                                        {section.rows.length > 1 && (
                                            <img
                                                src={trash}
                                                onClick={() =>
                                                    setConfirmModal({
                                                        open: true,
                                                        actionType: "remove",
                                                        title: "Please Confirm: Delete This Denomination Entry Permanently",
                                                        message: "Are you sure you want to delete this row?",
                                                        sectionId: section.id,
                                                        rowIndex: i,
                                                    })
                                                }
                                                className="cursor-pointer opacity-70 hover:opacity-100 w-7 h-7"
                                                alt="delete"
                                                title="Delete row"
                                                onMouseEnter={(e) => (e.currentTarget.src = trashHover)}
                                                onMouseLeave={(e) => (e.currentTarget.src = trash)}
                                            />
                                        )}
                                        {/* For the last row, show a disabled or hidden delete button */}
                                        {section.rows.length === 1 && (
                                            <div className="w-7 h-7 opacity-30 cursor-not-allowed" title="Cannot delete the last row">
                                                <img src={trash} className="w-7 h-7" alt="delete disabled" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* ADD Row - Always show the Add button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => addRow(section.id)}
                                    className="mt-2 border border-[#ABABAB] text-[#ABABAB] 
                                    px-2 py-1 rounded-lg hover:bg-[#1E2328] transition-colors"
                                >
                                    + Add Row
                                </button>
                            </div>

                            {/* SECTION TOTAL */}
                            <div className="flex justify-between items-center mt-4 pt-3">
                                <h1 className="text-[#2ACC80] font-medium text-[16px]">Total ({section.selectedCurrency})</h1>

                                <input
                                    readOnly
                                    value={calculateRawSectionTotal(section).toFixed(2)}
                                    className="w-[200px] bg-[#1B1E21] border border-[#2A2F33] 
                                    rounded-lg px-3 py-1 text-[#2ACC80] text-right"
                                />
                            </div>
                        </div>

                        {/* ADD REPEATER FIELD */}
                        <div className="h-[35px] bg-[#16191C] mt-2 flex items-center justify-center rounded-lg border border-dashed border-[#2F343A]">
                            <button
                                onClick={addNewCurrencySection}
                                className="bg-transparent text-center text-[#838383] text-[12px] font-normal hover:text-white transition-colors"
                                title="Add a row with same values as last row"
                            >
                                + Add Different Currency
                            </button>
                        </div>



                    </div>

                    {/* ADD NEW CURRENCY SECTION BUTTON (only after last section) */}
                    {/* {sectionIndex === data.sections.length - 1 && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={addNewCurrencySection}
                                className="px-4 py-2 border-2 border-dashed border-[#2F343A] rounded-lg 
                                text-[#838383] hover:text-white hover:border-[#939AF0] 
                                transition-colors bg-[#1E2328]"
                            >
                                + Add Different Currency
                            </button>
                        </div>
                    )} */}
                </div>
            ))}

            {/* GRAND TOTAL */}
            <div className="mt-6">
                <div className="bg-[#152F1F] w-full rounded-xl h-10 
        flex items-center justify-between px-4 text-white 
        font-normal text-[14px]"
                >
                    <p>Total {type === "opening" ? "Opening" : "Closing"} Balance (TZS)</p>
                    <p>{calculateGrandTotal().toFixed(2)}</p>
                </div>
            </div>

            <NotificationCard
                confirmModal={confirmModal}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmModal({ open: false })}
            />
        </div>
    );
}