import { useState, useEffect } from "react";
import down from "../../assets/dashboard/down.svg";
import trash from "../../assets/reconciliation/trash.svg";
import tick from "../../assets/common/tick.svg";
import { fetchCurrencies } from "../../api/currency/currency"; 

export default function OpeningVaultBalance() {
    const [rows, setRows] = useState([
        { denom: "", qty: "", total: 0, open: false },
    ]);

    const [currency, setCurrency] = useState("");          // <-- selected currency
    const [currencyOpen, setCurrencyOpen] = useState(false); // <-- dropdown toggle

    const [currencyOptions, setCurrencyOptions] = useState([]); 
    const [currencyMap, setCurrencyMap] = useState({});
    const [currencySymbols, setCurrencySymbols] = useState({});

    useEffect(() => {
        const loadCurrencies = async () => {
            const data = await fetchCurrencies({ page: 1, limit: 100 });

            if (data && data.length > 0) {
                const map = {};
                const symbols = {};

                data.forEach((c) => {
                    map[c.name] = c.id;
                    symbols[c.name] = c.symbol || "";
                });

                setCurrencyOptions(data.map((c) => c.name));  
                setCurrencyMap(map);
                setCurrencySymbols(symbols);

                // Set first currency by default
                if (!currency) {
                    setCurrency(data[0].name);
                }
            }
        };

        loadCurrencies();
    }, []);

    const handleChange = (index, field, value) => {
        const updated = [...rows];
        updated[index][field] = value;

        if (field === "denom" || field === "qty") {
            const d = parseFloat(updated[index].denom || 0);
            const q = parseFloat(updated[index].qty || 0);
            updated[index].total = d * q;
        }

        setRows(updated);
    };

    const addRow = () => {
        setRows([
            ...rows,
            { denom: "", qty: "", total: 0, open: false },
        ]);
    };

    const addRepeatedRow = () => {
    const lastRow = rows[rows.length - 1]; // get last row
        setRows([
            ...rows,
            {
                denom: lastRow.denom,
                qty: lastRow.qty,
                total: lastRow.total,
                open: false
            },
        ]);
    };


    const deleteRow = (index) => {
        const updated = [...rows];
        updated.splice(index, 1);
        setRows(updated);
    };

    const calculateTotal = () => {
        return rows.reduce((sum, item) => sum + Number(item.total || 0), 0);
    };

    return (
        <div className="mt-4">
            <div className="bg-[#1E2328] border border-[#16191C] rounded-xl p-5 w-full">

                {/* INNER CARD */}
                <div
                    className="bg-[#16191C] p-5 rounded-lg mx-auto"
                //   style={{ width: "1097px", minHeight: "248px" }}
                >
                    {/* CURRENCY DROPDOWN */}
                    <div className="flex justify-end mb-4">
                        <div className="relative">
                            <button
                                onClick={() => setCurrencyOpen(!currencyOpen)}
                                className="w-48 h-10 bg-transparent
                rounded-lg text-[#E3E3E3] flex items-center justify-between px-7"
                            >
                                <span className="text-[#939AF0] text-sm">Select Currency</span>
                                <img src={down} className="w-3" />
                            </button>

                            {currencyOpen && (
                                <ul className="absolute right-0 mt-2 w-[258px] 
                                bg-[#2E3439] border border-[#2A2F33] rounded-lg z-20">
                                    {currencyOptions.map((item) => (
                                        <li
                                            key={item}
                                            onClick={() => {
                                                setCurrency(item);
                                                setCurrencyOpen(false);
                                            }}
                                            className="px-4 py-2 flex items-center justify-between 
                                            hover:bg-[#1E2328] cursor-pointer text-white"
                                        >
                                            <span>{item}</span>
                                            {currency === item && (
                                                <img src={tick} className="w-4 h-4" />
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

                    {/* ROWS */}
                    {rows.map((row, i) => (
                        <div key={i} className="grid grid-cols-3 gap-6 mb-4 border-b border-[#1E2328] pb-4 relative">

                            {/* DENOMINATION DROPDOWN */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        const updated = [...rows];
                                        updated[i].open = !updated[i].open;
                                        setRows(updated);
                                    }}
                                    className="w-full bg-[#1E2328]  
                  rounded-lg px-3 py-2 text-white flex justify-between items-center"
                                >
                                    <span>
                                        {row.denom
                                            ? currencySymbols[currency] + row.denom
                                            : currencySymbols[currency] + "0.00"}
                                    </span>
                                    <img src={down} className="w-3" />
                                </button>

                                {row.open && (
                                    <ul className="absolute w-full mt-2 bg-[#2E3439] 
                                    border border-[#2A2F33] rounded-lg z-30">
                                        {["100", "50", "20", "10", "5", "2", "1"].map((item) => (
                                            <li
                                                key={item}
                                                onClick={() => {
                                                    const updated = [...rows];
                                                    updated[i].denom = item;
                                                    updated[i].open = false;
                                                    updated[i].total =
                                                        Number(updated[i].qty || 0) * Number(item);

                                                    setRows(updated);
                                                }}
                                                className="px-4 py-2 flex justify-between hover:bg-[#1E2328] text-white cursor-pointer"
                                            >
                                                <span>{currencySymbols[currency]}{item}</span>
                                                {row.denom === item && (
                                                    <img src={tick} className="w-4 h-4" />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* QUANTITY */}
                            <div className="flex items-center bg-[#1E2328] 
                            rounded-lg px-2 py-1">
                                <input
                                    type="number"
                                    value={row.qty}
                                    onChange={(e) =>
                                        handleChange(i, "qty", e.target.value)
                                    }
                                    className="bg-transparent outline-none text-white w-full"
                                    placeholder="0"
                                />


                            </div>

                            {/* TOTAL + DELETE */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    readOnly
                                    value={row.total}
                                    className="w-full bg-[#1E2328] 
    rounded-lg px-3 py-2 text-[#ABABAB]"
                                />

                                <img
                                    src={trash}
                                    onClick={() => deleteRow(i)}
                                    className="cursor-pointer opacity-70 hover:opacity-100 w-7 h-7"
                                />
                            </div>

                        </div>
                    ))}

                    {/* ADD Row */}
                    <div className="flex justify-end">
                        <button
                            onClick={addRow}
                            className="mt-2 border border-[#ABABAB] text-[#ABABAB] 
                            px-2 py-1 rounded-lg"
                        >
                            + Add
                        </button>
                    </div>

                    {/* TOTAL */}
                    <div className="flex justify-between items-center mt-4  pt-3">
                        <h1 className="text-[#2ACC80] font-medium text-[16px]">Total</h1>

                        <input
                            readOnly
                            value={calculateTotal()}
                            className="w-[200px] bg-[#1B1E21] border border-[#2A2F33] 
                            rounded-lg px-3 py-1 text-[#2ACC80] text-right"
                        />
                    </div>
                </div>

                <div className="h-[35px] bg-[#16191C] mt-2
    flex items-center justify-center rounded-lg border border-dashed border-[#2F343A]"
                >
                    <button
                        onClick={addRepeatedRow}        // <-- ADD THIS
                        className="bg-transparent text-center text-[#838383] text-[12px] font-normal"
                    >
                        + Add Repeater Field
                    </button>
                </div>



                {/* FINAL TOTAL BAR */}
                <div className="bg-[#152F1F] w-full rounded-b-xl h-10
         flex items-center justify-between px-4 text-white font-normal text-[14px] mt-4"
                >
                    <p>Total Opening Balance</p>
                    <p>{calculateTotal()}</p>
                </div>
            </div>
        </div>
    );
}
