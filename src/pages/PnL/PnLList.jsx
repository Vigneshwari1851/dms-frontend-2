import { useState, useEffect, useMemo } from "react";
import StatCard from "../../components/dashboard/StatCard";
import Table from "../../components/common/Table";
import Dropdown from "../../components/common/Dropdown";
import profitIcon from "../../assets/dashboard/profit.svg";
import dealstodayIcon from "../../assets/dashboard/dealstoday.svg";
import buyamountIcon from "../../assets/dashboard/buyamount.svg";
import sellamountIcon from "../../assets/dashboard/sellamount.svg";
import { fetchReconcoliation, exportReconciliation, fetchPnLOverview } from "../../api/reconcoliation";
import { fetchExpenses } from "../../api/expense";
import Toast from "../../components/common/Toast";
import emptyPnL from "../../assets/common/empty/pnl-bg.svg";

export default function PnLList() {
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("All Months");
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
        try {
            setLoading(true);
            const [reconResponse, expenseResponse] = await Promise.all([
                fetchReconcoliation({ page: 1, limit: 100 }),
                fetchExpenses({ limit: 100 })
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

            if (expenseResponse.data) {
                setExpenseData(expenseResponse.data.map(e => ({
                    ...e,
                    monthKey: new Date(e.date).toLocaleString('default', { month: 'long', year: 'numeric' })
                })));
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
        const grossPnL = filteredRecon.reduce((acc, curr) => acc + curr.profitLoss, 0);
        const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const netPnL = grossPnL - totalExpenses;

        const winningDays = filteredRecon.filter(item => item.profitLoss > 0).length;
        const totalDays = filteredRecon.length;
        const winRate = totalDays > 0 ? (winningDays / totalDays) * 100 : 0;

        return {
            grossPnL,
            totalExpenses,
            netPnL,
            winRate,
            totalSessions: totalDays
        };
    }, [filteredRecon, filteredExpenses]);

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
        { label: "Deals count", key: "total_transactions", align: "left" },
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
                    <h1 className="text-white text-xl font-semibold">Profit & Loss Analysis</h1>
                    <p className="text-[#8F8F8F] text-sm mt-1">Detailed breakdown of trading performance</p>
                </div>

                <div className="w-full md:w-64">
                    <Dropdown
                        label="Filter by Month"
                        options={months}
                        selected={selectedMonth}
                        onChange={setSelectedMonth}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Net P&L"
                    subtitle={selectedMonth}
                    value={`TZS ${Number(stats.netPnL).toLocaleString()}`}
                    color={stats.netPnL >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
                    icon={profitIcon}
                />
                <StatCard
                    title="Gross Profit"
                    subtitle="Trading Variance"
                    value={`TZS ${Number(stats.grossPnL).toLocaleString()}`}
                    icon={dealstodayIcon}
                    color="text-[#939AF0]"
                />
                <StatCard
                    title="Operating Expenses"
                    subtitle="Platform & Other Costs"
                    value={`TZS ${Number(stats.totalExpenses).toLocaleString()}`}
                    icon={buyamountIcon}
                    color="text-[#F7626E]"
                />
                <StatCard
                    title="Win Rate"
                    subtitle={`${stats.totalSessions} Sessions`}
                    value={`${stats.winRate.toFixed(1)}%`}
                    icon={sellamountIcon}
                />
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

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </>
    );
}
