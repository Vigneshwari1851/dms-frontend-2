import { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
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
    const location = useLocation();
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        return { start: today, end: today, dates: [today] };
    });

    const handleDateChange = (range) => {
        const start = range.from;
        const end = range.to;
        const dates = eachDayOfInterval({ start, end });
        setDateRange({ start, end, dates });
    };
    const [todayReconciliation, setTodayReconciliation] = useState(null);
    const [autoCaptureTrigger, setAutoCaptureTrigger] = useState(0);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    useEffect(() => {
        checkTodayReconciliation();
    }, []);

    // Handle auto-open trigger from navigation state
    useEffect(() => {
        if (location.state?.autoOpenVault) {
            handleReconcileAction();
            // Clear the state so it doesn't open again on refresh/back
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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
        const today = new Date();
        handleDateChange({ from: today, to: today });
        setAutoCaptureTrigger(prev => prev + 1);
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
                    {/* <button
                        onClick={handleReconcileAction}
                        className={`${(isSameDay(dateRange.start, new Date()) && !todayReconciliation) ? "flex" : "hidden"} items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-[#1D4CB5]/30 transform active:scale-95`}
                    >
                        <img src={add} alt="add" className="w-5 h-5" />
                        <span>
                            Physical Cash
                        </span>
                    </button> */}

                    <DateFilter
                        initialOption="Today"
                        onApply={handleDateChange}
                    />
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="animate-in fade-in duration-500">
                <ReconciliationReport
                    periodType="custom"
                    dateRange={dateRange}
                    refreshTrigger={todayReconciliation}
                    autoCaptureTrigger={isSameDay(dateRange.start, new Date()) ? autoCaptureTrigger : 0}
                    onDateSelect={(date) => {
                        handleDateChange({ from: date, to: date });
                    }}
                    setSidebarHidden={useOutletContext()?.setSidebarHidden}
                    hideVarianceAndStatus={true}
                />
            </div>

            <Toast show={toast.show} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
