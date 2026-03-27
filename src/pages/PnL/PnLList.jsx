import { useState, useEffect, useMemo, useRef } from "react";
import { isSameDay, format } from "date-fns";
import StatCard from "../../components/dashboard/StatCard";
import Dropdown from "../../components/common/Dropdown";
import DateFilter from "../../components/common/DateFilter";
import PnLExpandableRow from "../../components/PnL/PnLExpandableRow";
import download from "../../assets/dashboard/download.svg";
import profitIcon from "../../assets/dashboard/profit.svg";
import dealstodayIcon from "../../assets/dashboard/dealstoday.svg";
import buyamountIcon from "../../assets/dashboard/buyamount.svg";
import sellamountIcon from "../../assets/dashboard/sellamount.svg";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import dealsIcon from "../../assets/Common/deals.svg";
import addIcon from "../../assets/Common/HPlus.svg";
import { fetchReconcoliation, exportReconciliation, fetchPnLOverview } from "../../api/reconcoliation";
import { fetchExpenses } from "../../api/expense";
import emptyPnL from "../../assets/Common/empty/pnl-bg.svg";
import CalendarMini from "../../components/common/CalendarMini";
import calendarIcon from "../../assets/Common/calendar.svg";
import { fetchCurrencies } from "../../api/currency/currency";
import { fetchOpenSetRates, upsertOpenSetRate } from "../../api/openSetRate";
import Toast from "../../components/common/Toast";

export default function PnLList() {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999))
    });
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

    const loadPnLData = async (dr = dateRange) => {
        setLoading(true);
        try {
            const [reconResponse, expenseResponse, currencyResponse, rateResponse] = await Promise.all([
                fetchReconcoliation({ page: 1, limit: 100, dateFilter: "custom", dateRange: dr }),
                fetchExpenses({ limit: 100, dateRange: dr }),
                fetchCurrencies({ limit: 100 }),
                fetchOpenSetRates()
            ]);

            if (reconResponse.data) {
                const processedData = reconResponse.data.map(item => {
                    const date = item.created_at || item.createdAt;
                    return {
                        ...item,
                        profitLoss: Number(item.profitLoss || 0),
                        date: format(new Date(date), "dd/MM/yyyy"),
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
                if (!ratesMap["TZS"] && rateResponse.currentRate != null) {
                    ratesMap["TZS"] = { setRate: rateResponse.currentRate };
                }
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
                const tzs = currencyResponse.find(c => c.code === "TZS");
                if (tzs) setRateForm(prev => ({ ...prev, currency_id: tzs.id }));
            }
        } catch (err) {
            console.error("Error loading P&L data:", err);
            setToast({ show: true, message: "Failed to load P&L data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPnLData(dateRange);
    }, [dateRange]);

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


    const stats = useMemo(() => {
        if (data.length === 0) return {
            prevRate: previousRate || 0,
            currRate: todayRates["TZS"]?.setRate || 0,
            dailyPnL: 0,
            netPnL: 0,
            totalDeals: 0,
            totalAmount: 0,
            todayBuyAmount: 0,
            todaySellAmount: 0,
            buyByCurrency: {},
            sellByCurrency: {},
            expensesByCurrency: {},
            chartData: []
        };

        const sortedRecon = [...data].sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
        const latest = sortedRecon[0];
        const previous = sortedRecon[1];

        const grossPnL_Period = data.reduce((acc, curr) => acc + curr.profitLoss, 0);

        const expensesByCurrency = expenseData.reduce((acc, curr) => {
            const code = curr.currency?.code || "TZS";
            acc[code] = (acc[code] || 0) + Number(curr.amount);
            return acc;
        }, {});

        const todayStr = new Date().toISOString().split('T')[0];
        const latestDateStr = latest?.rawDate ? new Date(latest.rawDate).toISOString().split('T')[0] : "";
        const isToday = latestDateStr === todayStr;

        const manualRateToday = todayRates["TZS"]?.setRate;

        const todayDeals = isToday ? (latest?.total_transactions || 0) : 0;
        const todayTotalAmount = isToday ? (Number(latest?.totalForeignBought || 0) + Number(latest?.totalForeignSold || 0)) : 0;
        const todayBuyAmount = isToday ? (latest?.totalForeignBought || 0) : 0;
        const todaySellAmount = isToday ? (latest?.totalForeignSold || 0) : 0;

        const totalExpensesInTZS = expenseData.reduce((acc, curr) => acc + Number(curr.amount), 0);

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

        const perDayExpense = data.length > 0 ? totalExpensesInTZS / data.length : 0;
        const chartData = [...data].reverse().map(item => {
            const date = new Date(item.rawDate);
            return {
                name: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                pnl: item.profitLoss,
                net: item.profitLoss - perDayExpense,
                expenses: Math.round(perDayExpense),
                fullDate: item.date
            };
        });

        // Show 0 if no deals exist yet (first time system is used)
        const hasDeals = data.some(d => (d.total_transactions || 0) > 0);
        const dailyPnL = isToday && hasDeals ? (latest?.profitLoss || 0) : 0;
        const netPnL = hasDeals ? (grossPnL_Period - totalExpensesInTZS) : 0;

        return {
            prevRate: previous?.setRate || previousRate || 0,
            currRate: isToday ? (latest?.valuationRate || manualRateToday || 0) : (manualRateToday || latest?.valuationRate || 0),
            dailyPnL,
            netPnL,
            todayDeals,
            todayTotalAmount,
            todayBuyAmount,
            todaySellAmount,
            buyByCurrency,
            sellByCurrency,
            expensesByCurrency,
            chartData
        };
    }, [data, expenseData, previousRate, todayRates]);

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
            label: "Average Rate",
            key: "valuationRate",
            align: "left",
            render: (v, row) => (
                <span className={Number(v) > 0 ? "text-[#82E890]" : "text-gray-400"}>
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
            render: (v, row) => {
                const hasRowDeals = (row?.total_transactions || 0) > 0;
                const pnl = hasRowDeals ? Number(v) : 0;
                return (
                    <div className="flex items-center gap-2">
                        <span className={pnl >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                            {pnl >= 0 ? "▲" : "▼"} TZS {Math.abs(pnl).toLocaleString()}
                        </span>
                    </div>
                );
            }
        },
    ];

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-white text-16px lg:text-[20px] font-semibold">
                        Profit & Loss Analysis - {
                            isSameDay(dateRange.start, dateRange.end)
                                ? format(dateRange.start, "dd/MM/yyyy")
                                : `${format(dateRange.start, "dd/MM/yyyy")} - ${format(dateRange.end, "dd/MM/yyyy")}`
                        }
                    </h1>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <DateFilter
                        initialOption="Today"
                        onApply={(range) => setDateRange({ start: range.from, end: range.to })}
                    />
                </div>
            </div>

            {/* Opening Rate Inline Card */}
            {(() => {
                const displayRate = todayRates["TZS"]?.setRate || previousRate || null;
                const isManual = !!todayRates["TZS"]?.setRate;
                return (
                    <div className="flex items-center justify-between bg-[#1A1F24] border border-[#2A2F33] rounded-xl px-6 py-4 mb-6">
                        <div>
                            <p className="text-[#8F8F8F] text-xs font-medium">System Opening Rate (TZS)</p>
                            {displayRate ? (
                                <p className="text-white text-2xl font-semibold">
                                    {Number(displayRate).toLocaleString()}
                                    <span className="text-xs font-normal text-[#8F8F8F] ml-2">
                                        {isManual ? "manually set" : "based on yesterday's avg deal rate"}
                                    </span>
                                </p>
                            ) : (
                                <>
                                    <p className="text-[#555] text-2xl font-semibold ml-40">Not Set</p>
                                    <p className="text-[#8F8F8F] text-xs mt-0.5">Note: Click "Edit" to enter your opening rate</p>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                const existingRate = todayRates["TZS"]?.setRate || previousRate || "";
                                setRateForm(prev => ({ ...prev, set_rate: existingRate }));
                                setShowRateModal(true);
                            }}
                            className="w-full lg:w-auto px-3 sm:px-5 py-2 h-10 border border-white rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm whitespace-nowrap  hover:bg-[#173B8B] hover:border-[#173B8B] transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            {displayRate ? "Edit Rate" : "Edit Rate"}
                        </button>
                    </div>
                );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Prev Day Avg Rate"
                    value={`TZS ${Number(todayRates["TZS"]?.setRate || previousRate || stats.prevRate).toLocaleString()}`}
                    icon={profitIcon}
                />
                <StatCard
                    title="Current Avg Fx Rate"
                    value={`TZS ${Number(stats.currRate).toFixed(2)}`}
                    icon={dealstodayIcon}
                />
                <StatCard
                    title="Daily P&L"
                    value={(`TZS ${Number(Math.abs(stats.dailyPnL)).toLocaleString()}`)}
                    icon={buyamountIcon}
                    color={stats.dailyPnL >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
                />
                <StatCard
                    title="Net P&L (After Expenses)"
                    value={`TZS ${Number(Math.abs(stats.netPnL)).toLocaleString()}`}
                    icon={sellamountIcon}
                    color={stats.netPnL >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
                />
            </div>

            {/* CHART SECTION */}
            {!isSameDay(dateRange.start, dateRange.end) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    <div className="bg-[#1A1F24] border border-[#2A2F33] rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-white text-base font-semibold">Daily P&L Trend</h3>
                                <p className="text-[#8F8F8F] text-[11px] mt-1">Daily vs Net Profit/Loss (TZS)</p>
                            </div>
                            <div className="flex items-center gap-4 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-[#3b82f6]"></div>
                                    <span className="text-[#8F8F8F]">Daily P&L</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-[#82E890]"></div>
                                    <span className="text-[#8F8F8F]">Net P&L</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2F33" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8F8F8F', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8F8F8F', fontSize: 11 }} hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1F24', border: '1px solid #2A2F33', borderRadius: '8px' }}
                                        itemStyle={{ fontSize: '12px' }}
                                        labelStyle={{ color: '#8F8F8F', marginBottom: '4px' }}
                                        formatter={(value) => [`TZS ${Number(value).toLocaleString()}`, '']}
                                    />
                                    <ReferenceLine y={0} stroke="#2A2F33" strokeWidth={2} />
                                    <Line type="monotone" dataKey="pnl" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Daily P&L" animationDuration={1200} />
                                    <Line type="monotone" dataKey="net" stroke="#82E890" strokeWidth={2.5} dot={false} name="Net P&L" animationDuration={1200} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-[#1A1F24] border border-[#2A2F33] rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-white text-base font-semibold">Daily Breakdown</h3>
                                <p className="text-[#8F8F8F] text-[11px] mt-1">P&L vs Expenses per day (TZS)</p>
                            </div>
                            <div className="flex items-center gap-4 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-[#3b82f6]"></div>
                                    <span className="text-[#8F8F8F]">Daily P&L</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-[#f59e0b]"></div>
                                    <span className="text-[#8F8F8F]">Expenses</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2F33" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8F8F8F', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8F8F8F', fontSize: 11 }} hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1F24', border: '1px solid #2A2F33', borderRadius: '8px' }}
                                        itemStyle={{ fontSize: '12px' }}
                                        labelStyle={{ color: '#8F8F8F', marginBottom: '4px' }}
                                        formatter={(value) => [`TZS ${Number(value).toLocaleString()}`, '']}
                                    />
                                    <ReferenceLine y={0} stroke="#2A2F33" strokeWidth={2} />
                                    <Bar dataKey="pnl" fill="#3b82f6" name="Daily P&L" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}

            <div className="mt-8 bg-[#1A1F24] rounded-xl border border-[#2A2F33] overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between border-b border-[#2A2F33]">
                    <h2 className="text-white font-semibold">Trading History</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-white font-semibold border-b border-[#2A2F33] bg-[#16191C]">
                                {columns.map((col, idx) => (
                                    <th key={idx} className={`py-4 px-4 text-${col.align || "left"}`}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#1D4CB5] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[#8F8F8F] animate-pulse">Loading data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <img src={emptyPnL} alt="empty" className="w-42" />
                                            <p className="text-[#8F8F8F]">No trading history found for this period</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <PnLExpandableRow key={idx} rowData={row} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showRateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1A1F24] p-6 rounded-lg w-full max-w-[400px] text-white">
                        <h2 className="text-xl">Set Rate</h2>
                        <p className="text-gray-400 mt-1 text-sm">Specify rates used for P&L valuation</p>

                        <div className="mt-6">
                            <label className="block text-sm text-[#ABABAB] mb-1">TZS Rate</label>
                            <input
                                type="number"
                                placeholder={`e.g. ${Number(todayRates["TZS"]?.setRate || previousRate || 0).toLocaleString()}`}
                                value={rateForm.set_rate}
                                onChange={(e) => setRateForm(prev => ({ ...prev, set_rate: e.target.value }))}
                                className="w-full bg-[#2A2F34] rounded-lg px-4 py-2 text-white outline-none border border-transparent focus:border-[#1D4CB5]"
                            />
                            {/* {(todayRates["TZS"]?.setRate || previousRate) ? (
                                <p className="text-xs text-[#8F8F8F] mt-1.5">
                                    {todayRates["TZS"]?.setRate ? "Currently saved" : "Previous rate"}: <span className="text-[#82E890]">TZS {Number(todayRates["TZS"]?.setRate || previousRate).toLocaleString()}</span>
                                </p>
                            ) : null} */}
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
