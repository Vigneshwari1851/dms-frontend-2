import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchDealById } from "../../api/deals";

export default function DealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDeal = async () => {
      try {
        setLoading(true);
        const result = await fetchDealById(id);

        if (result.success) {
          setDeal(result.data.data || result.data);
          setError(null);
        } else {
          setError(result.error?.message || "Failed to load deal");
          setDeal(null);
        }
      } catch (err) {
        console.error("Error loading deal:", err);
        setError("Error loading deal");
        setDeal(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDeal();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">Loading deal details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 rounded-lg p-4">
        <p className="text-red-200">{error}</p>
        <button
          onClick={() => navigate("/deals")}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white"
        >
          Back to Deals
        </button>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-300">No deal found</p>
        <button
          onClick={() => navigate("/deals")}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Back to Deals
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString();
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-white text-2xl font-semibold">Deal Overview</h1>
          <div className="flex items-center">
            <p className="text-gray-400 text-sm">ID - {deal.deal_number}</p>
            {deal.status === 'Completed' && (
              <>
                <span className="mx-0.5 text-[#3A3F43]">|</span>
                <span className="text-[11px] text-[#ABABAB] font-semibold uppercase tracking-[0.1em]">Completed</span>
              </>
            )}
            {deal.status !== 'Completed' && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${deal.status === 'Completed' ? 'bg-[#1D902D] text-white' : 'bg-[#D8AD00] text-black'}`}
              >
                {deal.status}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/deals")}
            className="px-5 py-2 bg-[#2A2F33] hover:bg-[#3A3F43] rounded-lg text-white font-medium transition-colors"
          >
            Back to Deals
          </button>
          {deal.status === 'Pending' && (
            <button
              onClick={() => navigate(`/deals/edit-deal/${deal.id}`)}
              className="px-5 py-2 bg-[#1D4CB5] hover:bg-[#173B8B] rounded-lg text-white font-medium transition-colors"
            >
              Edit Deal
            </button>
          )}
        </div>
      </div>

      {/* Details Container */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT SIDE: Deal Information */}
        <div className="flex-1 bg-[#1A1F24] p-4 lg:p-6 rounded-xl border border-[#2A2F33] w-full">
          <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
            Deal Information
          </h3>

          <div className="space-y-6">
            {/* Row 1 - Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="text-[#ABABAB] text-sm mb-1 block">
                  Full Name
                </label>
                <p className="text-white text-lg font-medium">{deal.customer_name}</p>
              </div>

              <div>
                <label className="text-[#ABABAB] text-sm mb-1 block">
                  Phone Number
                </label>
                <p className="text-white text-lg font-medium">{deal.phone_number}</p>
              </div>
            </div>

            {/* Row 2 - Transaction fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="text-[#ABABAB] text-sm mb-1 block">
                  Transaction Type
                </label>
                <p className="text-white text-lg font-medium capitalize">{deal.deal_type}</p>
              </div>

              <div>
                <label className="text-[#ABABAB] text-sm mb-1 block">
                  Transaction Mode
                </label>
                <p className="text-white text-lg font-medium capitalize">{deal.transaction_mode}</p>
              </div>
            </div>

            {/* Row 3 - Currency Pair & Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="text-[#ABABAB] text-sm mb-1 block">
                  Currency Pair
                </label>
                <p className="text-white text-lg font-medium">
                  {deal.buyCurrency === "TZS" ? `${deal.sellCurrency}/TZS` : `${deal.buyCurrency}/TZS`}
                </p>
              </div>

              <div>
                <label className="text-[#ABABAB] text-sm mb-1 block">
                  Rate
                </label>
                <p className="text-white text-lg font-medium">{formatCurrency(deal.exchange_rate)}</p>
              </div>
            </div>

            {/* Row 4 - Summary of Amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 pt-4 border-t border-[#2A2F33]">
              <div>
                <label className="text-[#ABABAB] text-sm mb-1 block underline decoration-[#10B93555]">
                  Total Buy Amount
                </label>
                <p className="text-[#10B935] text-xl font-bold">
                  {formatCurrency(deal.buyAmount)} {deal.buyCurrency}
                </p>
              </div>

              <div>
                <label className="text-[#ABABAB] text-sm mb-1 block underline decoration-[#D8AD0055]">
                  Total Sell Amount
                </label>
                <p className="text-[#D8AD00] text-xl font-bold">
                  {formatCurrency(deal.sellAmount)} {deal.sellCurrency}
                </p>
              </div>
            </div>

            {/* Calculated Profit */}
            <div className="w-full h-[48px] bg-[#5761D715] rounded-lg px-4 flex items-center justify-between border border-[#5761D733]">
              <span className="text-[#FEFEFE] text-sm font-medium">
                Profit Generated
              </span>
              <span className="text-[#88ACFC] font-black text-xl">
                TZS {formatCurrency(deal.profit)}
              </span>
            </div>

            {/* Remaining Balance Card (Moved from right side) */}
            {deal.status !== 'Completed' && (
              <div className="mt-6">
                <div className="bg-[#16191C] border border-[#2A2F34] rounded-2xl p-5 shadow-inner">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#ABABAB] text-xs font-bold uppercase tracking-wider">
                      Remaining Balance
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#D8AD00] text-black">
                      Pending
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    {deal.deal_type === 'sell' ? (
                      <>
                        <span className={`text-3xl font-black tracking-tight ${(Number(deal.buyAmount || 0) - (deal.received_items?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0)) > 0.01 ? "text-[#FF6B6B]" : "text-[#82E890]"}`}>
                          {Math.max(0, Number(deal.buyAmount || 0) - (deal.received_items?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[#ABABAB] text-sm font-bold uppercase">{deal.buyCurrency}</span>
                      </>
                    ) : (
                      <>
                        <span className={`text-3xl font-black tracking-tight ${(Number(deal.sellAmount || 0) - (deal.paid_items?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0)) > 0.01 ? "text-[#FF6B6B]" : "text-[#82E890]"}`}>
                          {Math.max(0, Number(deal.sellAmount || 0) - (deal.paid_items?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[#ABABAB] text-sm font-bold uppercase">{deal.sellCurrency}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Remarks */}
            {deal.remarks && (
              <div className="mt-4">
                <label className="text-[#ABABAB] text-sm mb-2 block">Remarks</label>
                <p className="bg-[#16191C] rounded-lg p-3 text-white text-sm border border-[#2A2F34] min-h-[60px]">
                  {deal.remarks}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Divider Line for Completed Deals */}
        {deal.status === 'Completed' && (
          <div className="hidden lg:block w-[1px] bg-[#2A2F34] self-stretch my-4"></div>
        )}

        {/* RIGHT SIDE: Payment Tracker */}
        <div className="flex-1 bg-[#1A1F24] p-4 lg:p-6 rounded-xl border border-[#2A2F33] w-full self-stretch">
          <div className="flex flex-col h-full">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white font-semibold text-lg">Payment History</h3>
                <p className="text-[#ABABAB] text-xs mt-1">Historical installment records</p>
              </div>
              {deal.status === 'Pending' && (
                <button
                  onClick={() => navigate(`/deals/edit-deal/${deal.id}`)}
                  className="flex items-center gap-2 bg-[#1D4CB50F] border border-[#1D4CB555] text-[#88ACFC] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#1D4CB522] transition-colors"
                >
                  Add Installment
                </button>
              )}
            </div>

            {/* Timeline */}
            <div className="relative pl-8 space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {/* Vertical Line */}
              {(((deal.deal_type === 'sell' ? deal.received_items : deal.paid_items)?.length > 0) || (deal.status === 'Completed')) && (
                <div className="absolute left-[11px] top-8 bottom-10 w-0.5 bg-[#343A40]"></div>
              )}

              {/* Deal Created Entry (for Completed Deals) */}
              {deal.status === 'Completed' && (
                <div className="relative">
                  {/* Timeline Node */}
                  <div className="absolute -left-[28px] top-6 w-4 h-4 rounded-full bg-[#5761D7] z-10"></div>

                  <div className="bg-[#1D4CB508] border border-[#1D4CB522] rounded-xl p-5 flex justify-between items-center group relative shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[#88ACFC] text-[10px] uppercase tracking-[0.1em] mb-2 font-bold">Initial Amount</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-white text-2xl font-black">
                          {Number(deal.deal_type === 'sell' ? deal.buyAmount : deal.sellAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[#1D4CB5] text-xs font-black italic uppercase">
                          {deal.deal_type === 'sell' ? deal.buyCurrency : deal.sellCurrency}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 bg-[#16191C] px-3 py-2 rounded-xl border border-[#2A2F34]">
                        <span className="text-[#E0E0E0] text-[11px] font-semibold">
                          Deal Created&bull;{new Date(deal.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(deal.deal_type === 'sell' ? (deal.received_items || []) : (deal.paid_items || [])).length === 0 && deal.status !== 'Completed' ? (
                <div className="bg-[#16191C] border border-[#2A2F34] rounded-xl p-6 text-center ml-[-20px]">
                  <p className="text-[#8F8F8F] text-sm font-medium">No payment records found</p>
                </div>
              ) : (
                (deal.deal_type === 'sell' ? deal.received_items : deal.paid_items).map((item, index) => (
                  <div key={index} className="relative">
                    {/* Timeline Node */}
                    <div className="absolute -left-[28px] top-4 w-4 h-4 rounded-full border-4 border-[#1A1F24] bg-[#1D4CB5] z-10"></div>

                    <div className="bg-[#16191C] border border-[#2A2F34] rounded-xl p-4 hover:border-[#1D4CB555] transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-1">Amount Paid</p>
                          <p className="text-white text-xl font-black">
                            {formatCurrency(item.total)} <span className="text-[10px] text-[#1D4CB5] uppercase">{item.currency?.code || "TZS"}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#ABABAB] text-[10px] font-bold uppercase tracking-wider mb-1">Date</p>
                          <p className="text-white text-xs font-medium bg-[#1A1F24] px-2 py-1 rounded border border-[#2A2F34]">
                            {formatDate(item.created_at || new Date())}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#2A2F34] flex justify-between text-[10px]">
                        <span className="text-[#8F8F8F] italic">Ref: {deal.deal_number}-{index + 1}</span>
                        <span className="text-[#82E890] font-bold">Verified</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2A2F34; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3A3F44; }
      `}</style>
    </>
  );
}
