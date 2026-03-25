import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function ReconciliationGateModal({ onClose }) {
  const navigate = useNavigate();

  const handleGoToReconciliation = () => {
    onClose();
    navigate("/reconciliation");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1F24] border border-[#2A2F33]/70 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="bg-[#D8AD00]/10 border border-[#D8AD00]/20 rounded-full p-4">
            <AlertTriangle className="w-8 h-8 text-[#D8AD00]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-xl font-semibold text-center mb-3">
          Opening Vault Required
        </h2>

        {/* Message */}
        <p className="text-[#8F8F8F] text-sm text-center leading-relaxed mb-8">
          No opening vault found for today. Please set up today's opening vault
          balance in the Reconciliation module to get started.
          From tomorrow onwards, this will be done automatically.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-[#2A2F33] text-[#8F8F8F] hover:text-white hover:border-white/30 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleGoToReconciliation}
            className="flex-1 h-10 rounded-lg bg-[#1D4CB5] hover:bg-[#173B8B] text-white text-sm font-medium transition-all shadow-lg shadow-[#1D4CB5]/30"
          >
            Go to Reconciliation
          </button>
        </div>
      </div>
    </div>
  );
}
