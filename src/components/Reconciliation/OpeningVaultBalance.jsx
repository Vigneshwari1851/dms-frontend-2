import { useState, useEffect } from "react";
import down from "../../assets/dashboard/down.svg";
import trash from "../../assets/reconciliation/trash.svg";
import tick from "../../assets/common/tick.svg";
import { fetchCurrencies } from "../../api/currency/currency"; 

export default function OpeningVaultBalance({ data, setData, type }) {
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [currencyOptions, setCurrencyOptions] = useState([]); 
    const [currencyMap, setCurrencyMap] = useState({});
    const [currencySymbols, setCurrencySymbols] = useState({});

    useEffect(() => {
        const loadCurrencies = async () => {
            const currencies = await fetchCurrencies({ page: 1, limit: 100 });

            if (currencies && currencies.length > 0) {
                const map = {};
                const symbols = {};

                currencies.forEach((c) => {
                    map[c.name] = c.id;
                    symbols[c.name] = c.symbol || "";
                });

                setCurrencyOptions(currencies.map((c) => c.name));  
                setCurrencyMap(map);
                setCurrencySymbols(symbols);

                // Set first currency by default if not already set
                if (!data.selectedCurrency) {
                    setData(prev => ({
                        ...prev,
                        selectedCurrency: currencies[0].name,
                        currencyId: currencies[0].id
                    }));
                }
            }
        };

        loadCurrencies();
    }, []);

    const handleChange = (index, field, value) => {
        const updatedRows = [...data.rows];
        updatedRows[index][field] = value;

        if (field === "denom" || field === "qty") {
            const d = parseFloat(updatedRows[index].denom || 0);
            const q = parseFloat(updatedRows[index].qty || 0);
            updatedRows[index].total = d * q;
        }

        setData(prev => ({
            ...prev,
            rows: updatedRows
        }));
    };

    const addRow = () => {
        setData(prev => ({
            ...prev,
            rows: [
                ...prev.rows,
                { denom: "", qty: "", total: 0, open: false },
            ]
        }));
    };

    const addRepeatedRow = () => {
        if (data.rows.length === 0) {
            // If no rows exist, add a default row first
            setData(prev => ({
                ...prev,
                rows: [{ denom: "", qty: "", total: 0, open: false }]
            }));
            return;
        }
        
        const lastRow = data.rows[data.rows.length - 1];
        setData(prev => ({
            ...prev,
            rows: [
                ...prev.rows,
                {
                    denom: lastRow.denom,
                    qty: lastRow.qty,
                    total: lastRow.total,
                    open: false
                },
            ]
        }));
    };

    const deleteRow = (index) => {
        // Don't allow deletion if it's the last row
        if (data.rows.length <= 1) {
            // Instead of deleting, reset the last row to empty values
            const updatedRows = [...data.rows];
            updatedRows[index] = { denom: "", qty: "", total: 0, open: false };
            setData(prev => ({
                ...prev,
                rows: updatedRows
            }));
            return;
        }
        
        const updatedRows = [...data.rows];
        updatedRows.splice(index, 1);
        setData(prev => ({
            ...prev,
            rows: updatedRows
        }));
    };

    const calculateTotal = () => {
        return data.rows.reduce((sum, item) => sum + Number(item.total || 0), 0);
    };

    // Update currency selection
    const handleCurrencySelect = (currencyName) => {
        const currencyId = currencyMap[currencyName];
        setData(prev => ({
            ...prev,
            selectedCurrency: currencyName,
            currencyId: currencyId
        }));
    };

    return (
        <div className="mt-4">
            <div className="bg-[#1E2328] border border-[#16191C] rounded-xl p-5 w-full">

                {/* INNER CARD */}
                <div className="bg-[#16191C] p-5 rounded-lg mx-auto">
                    {/* CURRENCY DROPDOWN */}
                    <div className="flex justify-end mb-4">
                        <div className="relative">
                            <button
                                onClick={() => setCurrencyOpen(!currencyOpen)}
                                className="w-48 h-10 bg-transparent rounded-lg text-[#E3E3E3] flex items-center justify-between px-7"
                            >
                                <span className="text-[#939AF0] text-sm">
                                    {data.selectedCurrency || "Select Currency"}
                                </span>
                                <img src={down} className="w-3" alt="dropdown" />
                            </button>

                            {currencyOpen && (
                                <ul className="absolute right-0 mt-2 w-[258px] 
                                bg-[#2E3439] border border-[#2A2F33] rounded-lg z-20">
                                    {currencyOptions.map((item) => (
                                        <li
                                            key={item}
                                            onClick={() => {
                                                handleCurrencySelect(item);
                                                setCurrencyOpen(false);
                                            }}
                                            className="px-4 py-2 flex items-center justify-between 
                                            hover:bg-[#1E2328] cursor-pointer text-white"
                                        >
                                            <span>{item}</span>
                                            {data.selectedCurrency === item && (
                                                <img src={tick} className="w-4 h-4" alt="selected" />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* TABLE HEADER */}
                    <div className="grid grid-cols-3 gap-6 text-[#ABABAB] text-[14px] mb-2">
                        <p>Denomination</p>
                        <p>Quantity</p>
                        <p>Total</p>
                    </div>

                    {/* ROWS - Always show at least one row */}
                    {data.rows.map((row, i) => (
                        <div key={i} className="grid grid-cols-3 gap-6 mb-4 border-b border-[#1E2328] pb-4 relative">

                            {/* DENOMINATION DROPDOWN */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        const updatedRows = [...data.rows];
                                        updatedRows[i].open = !updatedRows[i].open;
                                        setData(prev => ({ ...prev, rows: updatedRows }));
                                    }}
                                    className="w-full bg-[#1E2328] rounded-lg px-3 py-2 text-white flex justify-between items-center"
                                >
                                    <span>
                                        {row.denom
                                            ? currencySymbols[data.selectedCurrency] + row.denom
                                            : currencySymbols[data.selectedCurrency] + "0.00"}
                                    </span>
                                    <img src={down} className="w-3" alt="dropdown" />
                                </button>

                                {row.open && (
                                    <ul className="absolute w-full mt-2 bg-[#2E3439] 
                                    border border-[#2A2F33] rounded-lg z-30">
                                        {["100", "50", "20", "10", "5", "2", "1"].map((item) => (
                                            <li
                                                key={item}
                                                onClick={() => {
                                                    const updatedRows = [...data.rows];
                                                    updatedRows[i].denom = item;
                                                    updatedRows[i].open = false;
                                                    updatedRows[i].total =
                                                        Number(updatedRows[i].qty || 0) * Number(item);

                                                    setData(prev => ({ ...prev, rows: updatedRows }));
                                                }}
                                                className="px-4 py-2 flex justify-between hover:bg-[#1E2328] text-white cursor-pointer"
                                            >
                                                <span>{currencySymbols[data.selectedCurrency]}{item}</span>
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
                                        handleChange(i, "qty", e.target.value)
                                    }
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
                                {data.rows.length > 1 && (
                                    <img
                                        src={trash}
                                        onClick={() => deleteRow(i)}
                                        className="cursor-pointer opacity-70 hover:opacity-100 w-7 h-7"
                                        alt="delete"
                                        title="Delete row"
                                    />
                                )}
                                {/* For the last row, show a disabled or hidden delete button */}
                                {data.rows.length === 1 && (
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
                            onClick={addRow}
                            className="mt-2 border border-[#ABABAB] text-[#ABABAB] 
                            px-2 py-1 rounded-lg hover:bg-[#1E2328] transition-colors"
                        >
                            + Add Row
                        </button>
                    </div>

                    {/* TOTAL */}
                    <div className="flex justify-between items-center mt-4 pt-3">
                        <h1 className="text-[#2ACC80] font-medium text-[16px]">Total</h1>

                        <input
                            readOnly
                            value={calculateTotal().toFixed(2)}
                            className="w-[200px] bg-[#1B1E21] border border-[#2A2F33] 
                            rounded-lg px-3 py-1 text-[#2ACC80] text-right"
                        />
                    </div>
                </div>

                {/* ADD REPEATER FIELD */}
                <div className="h-[35px] bg-[#16191C] mt-2 flex items-center justify-center rounded-lg border border-dashed border-[#2F343A]">
                    <button
                        onClick={addRepeatedRow}
                        className="bg-transparent text-center text-[#838383] text-[12px] font-normal hover:text-white transition-colors"
                        title="Add a row with same values as last row"
                    >
                        + Add Repeater Field
                    </button>
                </div>

                {/* FINAL TOTAL BAR */}
                <div className="bg-[#152F1F] w-full rounded-b-xl h-10 flex items-center justify-between px-4 text-white font-normal text-[14px] mt-4">
                    <p>Total {type === 'opening' ? 'Opening' : 'Closing'} Balance</p>
                    <p>{calculateTotal().toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}