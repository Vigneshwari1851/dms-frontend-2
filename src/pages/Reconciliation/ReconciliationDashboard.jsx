import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchCurrentReconciliation,
    startReconcoliation
} from "../../api/reconcoliation";
import Toast from "../../components/common/Toast";
import ReconciliationReport from "./ReconciliationReport";
import TransactionLedger from "./TransactionLedger";
import add from "../../assets/dashboard/add.svg";
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    subDays,
    subMonths
} from "date-fns";
import {
    Calendar,
    CalendarDays,
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    List,
    FileText
} from "lucide-react";
import DateFilter from "../../components/common/DateFilter";

export default function ReconciliationDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("report"); // "report" or "ledger"
    const [periodType, setPeriodType] = useState("daily"); // daily, weekly, monthly, custom
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [customRange, setCustomRange] = useState({ from: null, to: null });

    const [todayReconciliation, setTodayReconciliation] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const dateRange = useMemo(() => {
        if (periodType === "daily") {
            return { start: selectedDate, end: selectedDate, dates: [selectedDate] };
        } else if (periodType === "weekly") {
            const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
            const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
            const dates = eachDayOfInterval({ start, end });
            return { start, end, dates };
        } else if (periodType === "monthly") {
            const start = startOfMonth(selectedDate);
            const end = endOfMonth(selectedDate);
            const dates = eachDayOfInterval({ start, end });
            return { start, end, dates };
        } else {
            // custom
            if (customRange.from && customRange.to) {
                const dates = eachDayOfInterval({ start: customRange.from, end: customRange.to });
                return { start: customRange.from, end: customRange.to, dates };
            }
            return { start: selectedDate, end: selectedDate, dates: [selectedDate] };
        }
    }, [periodType, selectedDate, customRange]);

    useEffect(() => {
        checkTodayReconciliation();
    }, []);

    const checkTodayReconciliation = async () => {
        try {
            const res = await fetchCurrentReconciliation();
            if (res.success && res.data) {
                setTodayReconciliation(res.data);
            }
        } catch (err) {
            console.error("Error checking today's reconciliation:", err);
        }
    };

    const handleReconcileAction = async () => {
        const isReconcileAction = todayReconciliation &&
            ["Tallied", "Excess", "Short"].includes(todayReconciliation.status);

        if (isReconcileAction) {
            try {
                setToast({ show: true, message: "Reconciling deals...", type: "pending" });
                const res = await startReconcoliation(todayReconciliation.id);
                if (res.success || res.status === "success") {
                    setToast({ show: true, message: "Reconciliation successful!", type: "success" });
                    checkTodayReconciliation();
                    // We might need to trigger a refresh in the child components too
                    // This can be handled by a unique key or a refresh trigger prop
                } else {
                    setToast({ show: true, message: res.error?.message || "Reconciliation failed", type: "error" });
                }
            } catch (err) {
                console.error("Error triggering reconciliation:", err);
                setToast({ show: true, message: "Error during reconciliation", type: "error" });
            }
        } else if (todayReconciliation) {
            navigate(`/reconciliation/add-reconciliation/${todayReconciliation.id}`);
        } else {
            navigate("/reconciliation/add-reconciliation");
        }
    };

    const movePeriod = (direction) => {
        const newDate = new Date(selectedDate);
        const amount = direction === "next" ? 1 : -1;

        if (periodType === "daily") newDate.setDate(newDate.getDate() + amount);
        else if (periodType === "weekly") newDate.setDate(newDate.getDate() + (amount * 7));
        else if (periodType === "monthly") newDate.setMonth(newDate.getMonth() + amount);

        setSelectedDate(newDate);
    };

    return (
        <div className="space-y-6">
            {/* Header & Main Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-white text-20px lg:text-[24px] font-bold">
                        Reconciliation Centre
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Analyze vault balances and track transaction history
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Tab Switcher */}
                    <div className="flex bg-[#1A1F24] p-1 rounded-xl border border-[#2A2F33]/50">
                        <button
                            onClick={() => setActiveTab("report")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "report" ? "bg-[#1D4CB5] text-white shadow-lg" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            CASH RECONCILIATION
                        </button>
                        <button
                            onClick={() => setActiveTab("ledger")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "ledger" ? "bg-[#1D4CB5] text-white shadow-lg" : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <List className="w-4 h-4" />
                            TRANSACTION LEDGER
                        </button>
                    </div>

                    <button
                        onClick={handleReconcileAction}
                        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#1D4CB5]/30 transform active:scale-95"
                    >
                        <img src={add} alt="add" className="w-5 h-5" />
                        <span>
                            {todayReconciliation && ["Tallied", "Excess", "Short"].includes(todayReconciliation.status)
                                ? "Reconcile" : "Physical Cash"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Shared Filter Bar */}
            <div className="bg-[#1A1F24] p-4 rounded-xl border border-[#2A2F33]/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex bg-[#131619] p-1 rounded-lg w-fit border border-[#2A2F33]/50">
                        {[
                            { id: "daily", label: "Daily", icon: Calendar },
                            { id: "weekly", label: "Weekly", icon: CalendarDays },
                            { id: "monthly", label: "Monthly", icon: CalendarRange },
                            { id: "custom", label: "Date Range", icon: CalendarDays }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPeriodType(p.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${periodType === p.id ? "bg-[#1D4CB5] text-white shadow-lg" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                <p.icon className="w-4 h-4" />
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {periodType !== "custom" ? (
                            <div className="flex items-center gap-4 bg-[#131619] px-4 py-2 rounded-xl border border-[#2A2F33]/50">
                                <button
                                    onClick={() => movePeriod("prev")}
                                    className="text-gray-400 hover:text-white p-1 hover:bg-[#2A2F33] rounded-md transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <span className="text-white font-medium min-w-[140px] text-center">
                                    {periodType === "daily" && format(selectedDate, "MMMM dd, yyyy")}
                                    {periodType === "weekly" && `${format(dateRange.start, "MMM dd")} - ${format(dateRange.end, "MMM dd, yyyy")}`}
                                    {periodType === "monthly" && format(selectedDate, "MMMM yyyy")}
                                </span>

                                <button
                                    onClick={() => movePeriod("next")}
                                    className="text-gray-400 hover:text-white p-1 hover:bg-[#2A2F33] rounded-md transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <DateFilter
                                onApply={(range) => setCustomRange(range)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="animate-in fade-in duration-500">
                {activeTab === "report" ? (
                    <ReconciliationReport
                        periodType={periodType}
                        dateRange={dateRange}
                        refreshTrigger={todayReconciliation}
                    />
                ) : (
                    <TransactionLedger
                        dateRange={dateRange}
                        embedded={true}
                    />
                )}
            </div>

            <Toast show={toast.show} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
