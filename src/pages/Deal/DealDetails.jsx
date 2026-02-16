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
        <div>
          <h1 className="text-white text-2xl font-semibold">Deal Details</h1>
          <p className="text-gray-400 text-sm mt-1">{deal.deal_number}</p>
        </div>
        <button
          onClick={() => navigate("/deals")}
          className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
        >
          Back to Deals
        </button>
      </div>

      {/* Details Container */}
      <div className="bg-[#1A1F24] p-6 rounded-xl border border-[#2A2F33]">
        {/* Customer & Contact Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Customer Name
            </label>
            <p className="text-white text-lg">{deal.customer_name}</p>
          </div>
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Phone Number
            </label>
            <p className="text-white text-lg">{deal.phone_number}</p>
          </div>
        </div>

        {/* Deal Type & Currency Pair */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Type
            </label>
            <p className="text-white text-lg capitalize">
              {deal.deal_type === "buy" ? "Buy" : "Sell"}
            </p>
          </div>
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Currency Pair
            </label>
            <p className="text-white text-lg">
              {deal.buyCurrency === "TZS" ? `${deal.sellCurrency}/TZS` : `${deal.buyCurrency}/TZS`}
            </p>
          </div>
        </div>

        {/* Transaction Mode & Amount */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Mode
            </label>
            <p className="text-white text-lg capitalize">
              {deal.transaction_mode}
            </p>
          </div>
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">Amount</label>
            <p className="text-white text-lg">{formatCurrency(deal.amount)}</p>
          </div>
        </div>

        {/* Rate, Status & Dates */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">Rate</label>
            <p className="text-white text-lg">{formatCurrency(deal.exchange_rate)}</p>
          </div>
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">Status</label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${deal.status === "Pending"
                ? "bg-[#D8AD0024] text-[#D8AD00]"
                : "bg-[#1D4CB53D] text-[#88ACFC]"
                }`}
            >
              {deal.status}
            </span>
          </div>
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Created Date
            </label>
            <p className="text-white text-lg">{formatDate(deal.created_at)}</p>
          </div>
        </div>

        {/* Remarks */}
        {deal.remarks && (
          <div className="mb-8">
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Remarks
            </label>
            <p className="text-white text-lg">{deal.remarks}</p>
          </div>
        )}

        {/* Amounts Summary */}
        <div className="grid grid-cols-3 gap-6 mb-8 border-t border-[#2A2F33] pt-6">
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Buy Amount
            </label>
            <p className="text-green-400 text-xl font-semibold">
              {formatCurrency(deal.buyAmount)} {deal.buyCurrency}
            </p>
          </div>
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Sell Amount
            </label>
            <p className="text-yellow-400 text-xl font-semibold">
              {formatCurrency(deal.sellAmount)} {deal.sellCurrency}
            </p>
          </div>
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">Profit</label>
            <p className="text-blue-400 text-xl font-semibold">
              {formatCurrency(deal.profit)}
            </p>
          </div>
        </div>

        {/* Received Items */}
        {deal.received_items && deal.received_items.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                Received Items
              </h3>
              {deal.deal_type === 'sell' && (
                <div className="bg-[#2A2F33] border border-[#3E4348] rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="text-[#ABABAB] text-xs font-semibold uppercase tracking-wider">Remaining Balance</span>
                  <span className={`text-sm font-bold ${(Number(deal.buyAmount || 0) - (deal.received_items?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0)) > 0.01 ? "text-[#FF6B6B]" : "text-[#82E890]"}`}>
                    {deal.buyCurrency} {Math.max(0, Number(deal.buyAmount || 0) - (deal.received_items?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead className="border-b border-[#2A2F33]">
                  <tr>
                    <th className="text-left py-2 px-3 text-[#ABABAB]">
                      Price
                    </th>
                    <th className="text-left py-2 px-3 text-[#ABABAB]">
                      Quantity
                    </th>
                    <th className="text-left py-2 px-3 text-[#ABABAB]">
                      Total
                    </th>
                    <th className="text-left py-2 px-3 text-[#ABABAB]">
                      Currency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deal.received_items.map((item, idx) => (
                    <tr key={idx} className="border-b border-[#2A2F33]">
                      <td className="py-3 px-3">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-3">
                        {formatCurrency(item.quantity)}
                      </td>
                      <td className="py-3 px-3">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-3 px-3 text-blue-400">
                        {item.currency?.code || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paid Items */}
        {deal.paid_items && deal.paid_items.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                Paid Items
              </h3>
              {deal.deal_type === 'buy' && (
                <div className="bg-[#2A2F33] border border-[#3E4348] rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="text-[#ABABAB] text-xs font-semibold uppercase tracking-wider">Remaining Balance</span>
                  <span className={`text-sm font-bold ${(Number(deal.sellAmount || 0) - (deal.paid_items?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0)) > 0.01 ? "text-[#FF6B6B]" : "text-[#82E890]"}`}>
                    {deal.sellCurrency} {Math.max(0, Number(deal.sellAmount || 0) - (deal.paid_items?.reduce((s, i) => s + (Number(i.total) || 0), 0) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead className="border-b border-[#2A2F33]">
                  <tr>
                    <th className="text-left py-2 px-3 text-[#ABABAB]">
                      Price
                    </th>
                    <th className="text-left py-2 px-3 text-[#ABABAB]">
                      Quantity
                    </th>
                    <th className="text-left py-2 px-3 text-[#ABABAB]">
                      Total
                    </th>
                    <th className="text-left py-2 px-3 text-[#ABABAB]">
                      Currency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deal.paid_items.map((item, idx) => (
                    <tr key={idx} className="border-b border-[#2A2F33]">
                      <td className="py-3 px-3">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-3">
                        {formatCurrency(item.quantity)}
                      </td>
                      <td className="py-3 px-3">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-3 px-3 text-blue-400">
                        {item.currency?.code || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Created By */}
        {deal.createdBy && (
          <div className="border-t border-[#2A2F33] pt-6">
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Created By
            </label>
            <p className="text-white">
              {deal.createdBy.full_name} ({deal.createdBy.email})
            </p>
          </div>
        )}
      </div>
    </>
  );
}
