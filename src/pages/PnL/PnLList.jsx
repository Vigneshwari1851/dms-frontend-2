import { useState, useEffect, useMemo } from "react";
import StatCard from "../../components/dashboard/StatCard";
import Table from "../../components/common/Table";
import Dropdown from "../../components/common/Dropdown";
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
import emptyPnL from "../../assets/common/empty/pnl-bg.svg";
import CalendarMini from "../../components/common/CalendarMini";
import calendarIcon from "../../assets/Common/calendar.svg";
import { useRef } from "react";
import { fetchCurrencies } from "../../api/currency/currency";
import { fetchOpenSetRates, upsertOpenSetRate } from "../../api/openSetRate";
import Toast from "../../components/common/Toast";

export default function PnLList() {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("Today");
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
        const uniqueMonths = ["All Months", "Today", ...new Set([...reconMonths, ...expenseMonths])];
        return uniqueMonths;
    }, [data, expenseData]);

    const filteredRecon = useMemo(() => {
        if (selectedMonth === "All Months") return data;
        if (selectedMonth === "Today") {
            const todayStr = new Date().toLocaleDateString("en-GB");
            return data.filter(item => item.date === todayStr);
        }
        return data.filter(item => item.monthKey === selectedMonth);
    }, [data, selectedMonth]);

    const filteredExpenses = useMemo(() => {
        if (selectedMonth === "All Months") return expenseData;
        if (selectedMonth === "Today") {
            const todayStr = new Date().toISOString().split('T')[0];
            return expenseData.filter(e => {
                const eDate = e.date ? new Date(e.date).toISOString().split('T')[0] : "";
                return eDate === todayStr;
            });
        }
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

        const perDayExpense = filteredRecon.length > 0 ? totalExpensesInTZS / filteredRecon.length : 0;
        const chartData = [...filteredRecon].reverse().map(item => {
            const date = new Date(item.rawDate);
            return {
                name: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                pnl: item.profitLoss,
                net: item.profitLoss - perDayExpense,
                expenses: Math.round(perDayExpense),
                fullDate: item.date
            };
        });

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
            expensesByCurrency,
            chartData
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
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-white text-16px lg:text-[20px] font-semibold">
                Profit & Loss Analysis
                </h1>
                <p className="text-gray-400 text-sm mt-1 hidden lg:block">
                Detailed breakdown of trading performance
                </p>
            </div>

            <div className="flex items-center gap-4 ml-auto">
                <button
                onClick={() => setShowRateModal(true)}
                className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                <img src={addIcon} alt="add" className="w-5 h-5" />
                Set Rates
                </button>

                <Dropdown
                label="Filter by Month"
                options={months}
                selected={selectedMonth}
                onChange={setSelectedMonth}
                className="w-[150px]"
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Prev Day Avg Rate"
                    value={`TZS ${Number(stats.prevRate).toFixed(2)}`}
                    icon={profitIcon}
                />
                <StatCard
                    title="Current Avg Fx Rate"
                    value={`TZS ${Number(stats.currRate).toFixed(2)}`}
                    icon={dealstodayIcon}
                />
                <StatCard
                    title="Daily P&L"
                    value={(`TZS ${Number(stats.dailyPnL).toLocaleString()}`)}
                    icon={buyamountIcon}
                    color={stats.dailyPnL >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
                />
                <StatCard
                    title="Net P&L (After Expenses)"
                    value={`TZS ${Number(stats.netPnL).toLocaleString()}`}
                    icon={sellamountIcon}
                    color={stats.netPnL >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
                />
            </div>

            {/* CHART SECTION */}
            {selectedMonth !== "Today" && (
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
