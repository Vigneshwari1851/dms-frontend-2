import { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    fetchCurrentReconciliation,
    startReconcoliation
} from "../../api/reconcoliation";
import Toast from "../../components/common/Toast";
import ReconciliationReport from "./ReconciliationReport";
// import TransactionLedger from "./TransactionLedger";
import add from "../../assets/dashboard/add.svg";
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    subDays,
    subMonths,
    isSameDay
} from "date-fns";
import {
    Calendar,
    CalendarDays,
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    FileText
} from "lucide-react";
import DateFilter from "../../components/common/DateFilter";

export default function ReconciliationDashboard() {
    const navigate = useNavigate();
    // Removed tab switching functionality as per request


    const [periodType, setPeriodType] = useState("daily"); // daily, weekly, monthly, custom
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [customRange, setCustomRange] = useState({ from: null, to: null });

    const [todayReconciliation, setTodayReconciliation] = useState(null);
    const [autoCaptureTrigger, setAutoCaptureTrigger] = useState(0);
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

    const handleReconcileAction = () => {
        setPeriodType("daily");
        setSelectedDate(new Date());
        setAutoCaptureTrigger(prev => prev + 1);
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
                    <h1 className="text-white text-16px lg:text-[20px] font-semibold">
                        Reconciliation Hub
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleReconcileAction}
                        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-[#1D4CB5]/30 transform active:scale-95"
                    >
                        <img src={add} alt="add" className="w-5 h-5" />
                        <span>
                            Physical Cash
                        </span>
                    </button>
                </div>
            </div>

            {/* Shared Filter Bar */}
            <div className="">
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
                                    {periodType === "daily" && format(selectedDate, "dd/MM/yyyy")}
                                    {periodType === "weekly" && `${format(dateRange.start, "dd/MM/yyyy")} - ${format(dateRange.end, "dd/MM/yyyy")}`}
                                    {periodType === "monthly" && `${format(dateRange.start, "dd/MM/yyyy")} - ${format(dateRange.end, "dd/MM/yyyy")}`}
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
                <ReconciliationReport
                    periodType={periodType}
                    dateRange={dateRange}
                    refreshTrigger={todayReconciliation}
                    autoCaptureTrigger={isSameDay(dateRange.start, new Date()) ? autoCaptureTrigger : 0}
                    onDateSelect={(date) => {
                        setPeriodType("daily");
                        setSelectedDate(date);
                    }}
                    setSidebarHidden={useOutletContext()?.setSidebarHidden}
                />
            </div>

            <Toast show={toast.show} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
