import { useState, useEffect, useMemo } from "react";
import StatCard from "../../components/dashboard/StatCard";
import Table from "../../components/common/Table";
import Dropdown from "../../components/common/Dropdown";
import profitIcon from "../../assets/dashboard/profit.svg";
import dealstodayIcon from "../../assets/dashboard/dealstoday.svg";
import buyamountIcon from "../../assets/dashboard/buyamount.svg";
import sellamountIcon from "../../assets/dashboard/sellamount.svg";
import addIcon from "../../assets/Common/HPlus.svg";
import { fetchReconcoliation, exportReconciliation, fetchPnLOverview } from "../../api/reconcoliation";
import { fetchExpenses } from "../../api/expense";
import { fetchCurrencies } from "../../api/currency/currency";
import { fetchOpenSetRates, upsertOpenSetRate } from "../../api/openSetRate";
import Toast from "../../components/common/Toast";
import emptyPnL from "../../assets/common/empty/pnl-bg.svg";
import CalendarMini from "../../components/common/CalendarMini";
import calendarIcon from "../../assets/Common/calendar.svg";
import { useRef } from "react";

export default function PnLList() {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("All Months");
    const [currencies, setCurrencies] = useState([]);
    const [todayRates, setTodayRates] = useState({});
    const [previousRate, setPreviousRate] = useState(0);
    const [showRateModal, setShowRateModal] = useState(false);
    const [rateForm, setRateForm] = useState({
        currency_id: "",
        set_rate: "",
        date: new Date().toISOString().split('T')[0]
    });
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCalendar(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        limit: 100,
    });

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const loadPnLData = async () => {
        setLoading(true);
        try {
            const [reconResponse, expenseResponse, currencyResponse, rateResponse] = await Promise.all([
                fetchReconcoliation({ page: 1, limit: 100 }),
                fetchExpenses({ limit: 100 }),
                fetchCurrencies({ limit: 100 }),
                fetchOpenSetRates()
            ]);

            if (reconResponse.data) {
                const processedData = reconResponse.data.map(item => {
                    const date = item.created_at || item.createdAt;
                    return {
                        ...item,
                        profitLoss: Number(item.profitLoss || 0),
                        date: new Date(date).toLocaleDateString("en-GB"),
                        rawDate: date,
                        monthKey: new Date(date).toLocaleString('default', { month: 'long', year: 'numeric' })
                    };
                });
                setData(processedData);
            }

            if (rateResponse.success) {
                const ratesMap = (rateResponse.data || []).reduce((acc, r) => {
                    acc[r.currency.code] = { setRate: Number(r.set_rate) };
                    return acc;
                }, {});
                setTodayRates(ratesMap);
                setPreviousRate(rateResponse.previousRate || 0);
            }

            if (expenseResponse.data) {
                setExpenseData(expenseResponse.data.map(e => ({
                    ...e,
                    monthKey: new Date(e.date).toLocaleString('default', { month: 'long', year: 'numeric' })
                })));
            }

            if (currencyResponse) {
                setCurrencies(currencyResponse);
                const usd = currencyResponse.find(c => c.code === "USD");
                if (usd) setRateForm(prev => ({ ...prev, currency_id: usd.id }));
            }
        } catch (err) {
            console.error("Error loading P&L data:", err);
            setToast({ show: true, message: "Failed to load P&L data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPnLData();
    }, []);

    const handleSaveRate = async () => {
        if (!rateForm.currency_id || !rateForm.set_rate || !rateForm.date) {
            setToast({ show: true, message: "Please fill all fields", type: "error" });
            return;
        }

        try {
            const res = await upsertOpenSetRate(rateForm);
            if (res.success) {
                setToast({ show: true, message: "Rates saved successfully", type: "success" });
                setShowRateModal(false);
                loadPnLData();
            } else {
                setToast({ show: true, message: res.error, type: "error" });
            }
        } catch (err) {
            setToast({ show: true, message: "Failed to save rates", type: "error" });
        }
    };

    const months = useMemo(() => {
        const reconMonths = data.map(item => item.monthKey);
        const expenseMonths = expenseData.map(item => item.monthKey);
        const uniqueMonths = ["All Months", ...new Set([...reconMonths, ...expenseMonths])];
        return uniqueMonths;
    }, [data, expenseData]);

    const filteredRecon = useMemo(() => {
        if (selectedMonth === "All Months") return data;
        return data.filter(item => item.monthKey === selectedMonth);
    }, [data, selectedMonth]);

    const filteredExpenses = useMemo(() => {
        if (selectedMonth === "All Months") return expenseData;
        return expenseData.filter(item => item.monthKey === selectedMonth);
    }, [expenseData, selectedMonth]);

    const stats = useMemo(() => {
        if (data.length === 0) return {
            prevRate: previousRate || 0,
            currRate: todayRates["USD"]?.setRate || 0,
            dailyPnL: 0,
            netPnL: 0,
            totalDeals: 0,
            totalAmount: 0,
            todayBuyAmount: 0,
            todaySellAmount: 0,
            buyByCurrency: {},
            sellByCurrency: {},
            expensesByCurrency: {}
        };

        const sortedRecon = [...data].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
        const latest = sortedRecon[0];
        const previous = sortedRecon[1];

        const grossPnL_Period = filteredRecon.reduce((acc, curr) => acc + curr.profitLoss, 0);

        const expensesByCurrency = filteredExpenses.reduce((acc, curr) => {
            const code = curr.currency?.code || "TZS";
            acc[code] = (acc[code] || 0) + Number(curr.amount);
            return acc;
        }, {});

        const todayStr = new Date().toISOString().split('T')[0];
        const latestDateStr = latest?.rawDate ? new Date(latest.rawDate).toISOString().split('T')[0] : "";
        const isToday = latestDateStr === todayStr;

        const usdRateToday = todayRates["USD"]?.setRate || 0;

        const todayDeals = isToday ? (latest?.total_transactions || 0) : 0;
        const todayTotalAmount = isToday ? (Number(latest?.totalForeignBought || 0) + Number(latest?.totalForeignSold || 0)) : 0;
        const todayBuyAmount = isToday ? (latest?.totalForeignBought || 0) : 0;
        const todaySellAmount = isToday ? (latest?.totalForeignSold || 0) : 0;

        const totalExpensesInTZS = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

        const buyByCurrency = {};
        const sellByCurrency = {};

        if (isToday && latest?.deals) {
            latest.deals.forEach(rd => {
                const deal = rd.deal;
                if (!deal) return;
                const buyCode = deal.buyCurrency?.code;
                const sellCode = deal.sellCurrency?.code;
                const amount = Number(deal.amount || 0);
                const amountPaid = Number(deal.amount_to_be_paid || 0);

                if (deal.deal_type === "buy") {
                    if (buyCode && buyCode !== "TZS") buyByCurrency[buyCode] = (buyByCurrency[buyCode] || 0) + amount;
                } else {
                    if (sellCode && sellCode !== "TZS") sellByCurrency[sellCode] = (sellByCurrency[sellCode] || 0) + amount;
                }
            });
        }

        return {
            prevRate: previous?.setRate || previousRate || 0,
            currRate: isToday ? (latest?.setRate || 0) : (usdRateToday || latest?.setRate || 0),
            dailyPnL: isToday ? (latest?.profitLoss || 0) : 0,
            netPnL: grossPnL_Period - totalExpensesInTZS,
            todayDeals,
            todayTotalAmount,
            todayBuyAmount,
            todaySellAmount,
            buyByCurrency,
            sellByCurrency,
            expensesByCurrency
        };
    }, [data, filteredRecon, filteredExpenses, previousRate, todayRates]);

    const handleExport = async (format) => {
        try {
            setExporting(true);
            const blob = await exportReconciliation(format);
            if (!blob) {
                setToast({ show: true, message: "Export failed", type: "error" });
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `pnl_report_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setToast({ show: true, message: "Report exported successfully", type: "success" });
        } catch (err) {
            console.error("Export error:", err);
            setToast({ show: true, message: "Export failed", type: "error" });
        } finally {
            setExporting(false);
        }
    };

    const columns = [
        { label: "Date", key: "date", align: "left" },
        { label: "Deals", key: "total_transactions", align: "left" },
        {
            label: "Valuation Rate",
            key: "setRate",
            align: "left",
            render: (v, row) => (
                <span className={row.hasCustomRates ? "text-[#82E890]" : "text-gray-400"}>
                    {Number(v).toFixed(2)}
                </span>
            )
        },
        {
            label: "Opening Value",
            key: "totalOpeningValue",
            align: "left",
            render: (v) => `TZS ${Number(v).toLocaleString()}`
        },
        {
            label: "Closing Value",
            key: "totalClosingValue",
            align: "left",
            render: (v) => `TZS ${Number(v).toLocaleString()}`
        },
        {
            label: "Profit / Loss",
            key: "profitLoss",
            align: "left",
            render: (v) => (
                <div className="flex items-center gap-2">
                    <span className={v >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                        {v >= 0 ? "▲" : "▼"} TZS {Math.abs(Number(v)).toLocaleString()}
                    </span>
                </div>
            )
        },
    ];

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-white text-16px lg:text-[20px] font-semibold">
                        Profit & Loss Analysis
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 hidden lg:block">
                        Detailed breakdown of trading performance
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowRateModal(true)}
                        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <img src={addIcon} alt="add" className="w-5 h-5" />
                        Set Rates
                    </button>
                    <div className="w-full md:w-64">
                        <Dropdown
                            label="Filter by Month"
                            options={months}
                            selected={selectedMonth}
                            onChange={setSelectedMonth}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Prev Day Avg Rate"
                    subtitle="Previous Session"
                    value={Number(stats.prevRate).toFixed(2)}
                    icon={profitIcon}
                />
                <StatCard
                    title="Current Avg Rate"
                    subtitle="Latest Session"
                    value={Number(stats.currRate).toFixed(2)}
                    icon={dealstodayIcon}
                    color="text-[#939AF0]"
                />
                <StatCard
                    title="Daily P&L"
                    subtitle="Trading Profit"
                    value={`TZS ${Number(stats.dailyPnL).toLocaleString()}`}
                    icon={buyamountIcon}
                    color={stats.dailyPnL >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
                />
                <StatCard
                    title="Net P&L"
                    subtitle="After Expenses"
                    value={`TZS ${Number(stats.netPnL).toLocaleString()}`}
                    icon={sellamountIcon}
                    color={stats.netPnL >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                {/* CARD 2: BUY BREAKDOWN */}
                <div className="bg-[#1A1F24] border border-[#2A2F33] rounded-xl flex flex-col shadow-lg overflow-hidden h-[130px]">
                    <div className="p-4 border-b border-[#2A2F33] bg-[#1E2328] flex justify-between items-center">
                        <span className="text-white">Buy Deals</span>
                        <span className="text-[10px] text-[#8F8F8F]">{Object.keys(stats.buyByCurrency).length} currencies</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-grey p-4 space-y-3">
                        {Object.keys(stats.buyByCurrency).length > 0 ? (
                            Object.entries(stats.buyByCurrency).map(([curr, amt]) => (
                                <div key={curr} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium text-sm">{curr}</span>
                                    </div>
                                    <span className="text-[#8F8F8F] text-sm group-hover:text-white transition-colors">{Number(amt || 0).toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <span className="text-gray-500 italic text-xs">No buy deals today</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 3: SELL BREAKDOWN */}
                <div className="bg-[#1A1F24] border border-[#2A2F33] rounded-xl flex flex-col shadow-lg overflow-hidden h-[130px]">
                    <div className="p-4 border-b border-[#2A2F33] bg-[#1E2328] flex justify-between items-center">
                        <span className="text-white">Sell Deals</span>
                        <span className="text-[10px] text-[#8F8F8F]">{Object.keys(stats.sellByCurrency).length} currencies</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-grey p-4 space-y-3">
                        {Object.keys(stats.sellByCurrency).length > 0 ? (
                            Object.entries(stats.sellByCurrency).map(([curr, amt]) => (
                                <div key={curr} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium text-sm">{curr}</span>
                                    </div>
                                    <span className="text-[#8F8F8F] text-sm group-hover:text-white transition-colors">{Number(amt || 0).toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <span className="text-gray-500 italic text-xs">No sell deals today</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CARD 4: EXPENSES BREAKDOWN */}
                <div className="bg-[#1A1F24] border border-[#2A2F33] rounded-xl flex flex-col shadow-lg overflow-hidden h-[130px]">
                    <div className="p-4 border-b border-[#2A2F33] bg-[#1E2328] flex justify-between items-center">
                        <span className="text-white text-sm">Total Expenses</span>
                        <span className="text-[10px] text-[#8F8F8F]">{Object.keys(stats.expensesByCurrency).length} currencies</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-grey p-4 space-y-3">
                        {Object.keys(stats.expensesByCurrency).length > 0 ? (
                            Object.entries(stats.expensesByCurrency).map(([curr, amt]) => (
                                <div key={curr} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium text-sm">{curr}</span>
                                    </div>
                                    <span className="text-[#8F8F8F] text-sm group-hover:text-white transition-colors">{Number(amt || 0).toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <span className="text-gray-500 italic text-xs">No expenses found</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <Table
                    columns={columns}
                    data={filteredRecon}
                    title="Trading History"
                    subtitle={`Performance for ${selectedMonth}`}
                    loading={loading || exporting}
                    showPagination={false}
                    showExport={true}
                    onExport={handleExport}
                    emptyStateProps={{
                        imageSrc: emptyPnL,
                        message: "No trading history found for this period",
                    }}
                />
            </div>

            {showRateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1A1F24] p-6 rounded-lg w-full max-w-[400px] text-white">
                        <h2 className="text-xl">Set Rate</h2>
                        <p className="text-gray-400 mt-1 text-sm">Specify rates used for P&L valuation</p>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm text-[#ABABAB] mb-1">Currency</label>
                                <Dropdown
                                    label="Select Currency"
                                    options={currencies.map(c => `${c.code} - ${c.name}`)}
                                    selected={currencies.find(c => c.id === rateForm.currency_id)?.code ? `${currencies.find(c => c.id === rateForm.currency_id).code} - ${currencies.find(c => c.id === rateForm.currency_id).name}` : ""}
                                    onChange={(val) => {
                                        const code = val.split(" - ")[0];
                                        const curr = currencies.find(c => c.code === code);
                                        if (curr) setRateForm(prev => ({ ...prev, currency_id: curr.id }));
                                    }}
                                />
                            </div>

                            <div className="relative" ref={calendarRef}>
                                <label className="block text-sm text-[#ABABAB] mb-1">Date</label>
                                <div
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className="w-full bg-[#2A2F34] rounded-lg px-4 py-2 text-white flex items-center justify-between cursor-pointer border border-transparent hover:border-[#1D4CB588] transition-all"
                                >
                                    <span>{new Date(rateForm.date).toLocaleDateString("en-GB")}</span>
                                    <img src={calendarIcon} alt="calendar" className="w-4 h-4 opacity-70" />
                                </div>

                                {showCalendar && (
                                    <div className="absolute top-full left-0 mt-2 z-[110] bg-[#1A1F24] border border-[#2A2F33] rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200 origin-top-left">
                                        <CalendarMini
                                            selectedDate={new Date(rateForm.date)}
                                            onDateSelect={(date) => {
                                                setRateForm(prev => ({
                                                    ...prev,
                                                    date: date.toISOString().split('T')[0]
                                                }));
                                                setShowCalendar(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1">
                                <div>
                                    <label className="block text-sm text-[#ABABAB] mb-1">Set Rate</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={rateForm.set_rate}
                                        onChange={(e) => setRateForm(prev => ({ ...prev, set_rate: e.target.value }))}
                                        className="w-full bg-[#2A2F34]  rounded-lg px-4 py-2 text-white outline-none focus:border-[#1D4CB5]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setShowRateModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRate}
                                className="flex-1 px-4 py-2 bg-[#1D4CB5] hover:bg-[#173B8B] rounded-lg text-white font-medium transition-colors"
                            >
                                Save Rates
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </>
    );
}
