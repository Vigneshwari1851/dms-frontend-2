import { useState } from "react";
import { useNavigate } from "react-router-dom";
import leftArrow from "../../assets/Common/leftBack.svg";
import plus from "../../assets/dashboard/add.svg";
import pdf from "../../assets/Common/pdf.pdf";
import logo from "../../assets/Common/logo.svg";
import NotificationCard from "../../components/common/Notification";
import ReasonModal from "../../components/common/ReasonModal";
import Toast from "../../components/common/Toast";


export default function DealReviewContent({
  dealData = {
    dealId: "D001",
    status: "Pending",
    dealDate: "25-11-2025",
    dealNumber: "D001",
    customerName: "Krishna",
    phoneNumber: "+255 713 456 789",
    transactionType: "Buy",
    currencyType: "USD",
    beneficiaryDetails: {
      usdSelling: "USD 1000",
      rate: "2467.54",
      tzsAmount: "TZS 19,74,034.05",
    },
    denominations: [
      { denom: 100, qty: 9, total: "900.00" },
      { denom: 100, qty: 9, total: "900.00" },
      { denom: 100, qty: 9, total: "900.00" },
      { denom: 20, qty: 5, total: "100.00" },
    ],
    pdfSource: pdf,
  },
  onReject,
  onApprove,
}) {
  const navigate = useNavigate();

  // --- Modal state ---
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [actionType, setActionType] = useState(""); // "approve" or "reject"

  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

   const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };


  // --- Button handlers ---
  const handleReject = () => {
    setActionType("reject");
    setConfirmModal({
      open: true,
      actionType: "rejectDeal",
      title: "Are you sure you want to reject this deal?",
      message:
        "You are about to reject this deal. Once rejected, it will be sent back to the maker for review or correction.",
    });
  };

  const handleApprove = () => {
    setActionType("approve");
    setConfirmModal({
      open: true,
      actionType: "approveDeal",
      title: "Are you sure you want to approve this deal?",
      message: "You are about to approve this deal. Once approved, the transaction will be finalized and cannot be modified.",
    });

  };


  const handleConfirm = () => {
    if (actionType === "reject") {
      setConfirmModal({ open: false });
      setReasonModalOpen(true); // open reason modal
      return;
    }

    if (actionType === "approve") {
      onApprove ? onApprove(dealData) : console.log("Deal approved", dealData);
      showToast("Deal Approved Successfully!", "success");
    }

    

    setConfirmModal({ open: false });
  };


  const handleCancel = () => {
    setConfirmModal({ open: false });
  };



  // Handle reason submit
  const handleSubmitReason = (reasonText) => {
    console.log("Reason submitted:", reasonText);
    setReasonModalOpen(false);
    showToast("Deal Rejected Successfully!", "error");
  };

 

  return (
    <div className="w-full">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1E2328; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2A2D31; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3A3D41; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #2A2D31 #1E2328; }
      `}</style>

      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#2A2D31]">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-gray-300 mb-2"
          >
            <img src={leftArrow} alt="back" className="w-4 h-4 cursor-pointer" />
            <h1 className="text-[16px] font-medium text-[#E3E3E3]">Review Deal</h1>
          </button>
          <p className="text-gray-400 text-sm ml-5">Validate deal summary</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReject}
            className="flex items-center gap-2 px-2 py-2.5 bg-[#BD404A] hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
          >
            <img src={plus} alt="reject" className="w-5 h-5" />
            Reject Deal
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-2 px-2 py-2.5 bg-[#1E902D] hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
          >
            <img src={plus} alt="approve" className="w-5 h-5" />
            Approve Deal
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full gap-8">
        {/* LEFT: PDF Preview */}
        <div className="w-[260px] flex flex-col items-center pr-8 border-r-7 border-[#2A2D31]">
          <div className="p-4 h-[330px] w-full flex flex-col items-center justify-center relative overflow-hidden">
            <iframe
              src={`${dealData.pdfSource || pdf}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full rounded-lg overflow-hidden"
              title="Deal Slip Preview"
              type="application/pdf"
              scrolling="no"
              style={{ overflow: "hidden" }}
            />
          </div>
        </div>

        {/* RIGHT: Deal Slip Card */}
        <div className="flex-1">
          <div
            className="bg-[#2E3439] border border-[#2A2D31] p-5 shadow-xl flex flex-col overflow-hidden"
            style={{ width: "595px", height: "800px", position: "relative" }}
          >
            {/* Deal Slip Header */}
            <div className="flex justify-between items-start mb-8">
              <img src={logo} alt="logo" />
              <div className="flex flex-col items-end gap-2">
                <h2 className="text-xl font-semibold text-white">
                  Deal Slip – {dealData.dealId || dealData.dealNumber}
                </h2>
                <span
                  className={`px-3 py-1 rounded-2xl text-sm border font-medium ${dealData.status === "Pending"
                    ? "bg-yellow-600/20 text-yellow-400"
                    : dealData.status === "Approved"
                      ? "bg-green-600/20 text-green-400"
                      : "bg-red-600/20 text-red-400"
                    }`}
                >
                  {dealData.status}
                </span>
              </div>
            </div>

            {/* General Deal Information Table */}
            <div className="border border-[#2A2D31] rounded-lg overflow-hidden mb-5">
              <table className="w-full text-sm">
                <tbody className="bg-[#1E2328]">
                  <BeneficiaryRow label="Deal Date" value={dealData.dealDate} />
                  <BeneficiaryRow label="Deal Number" value={dealData.dealNumber} />
                  <BeneficiaryRow label="Customer Name" value={dealData.customerName} />
                  <BeneficiaryRow label="Phone number" value={dealData.phoneNumber} />
                  <BeneficiaryRow label="Transaction Type" value={dealData.transactionType} />
                  <BeneficiaryRow label="Currency Type" value={dealData.currencyType} />
                </tbody>
              </table>
            </div>

            {/* Beneficiary Details Table */}
            <h3 className="text-lg font-semibold text-white mb-4">Beneficiary Details</h3>
            <div className="border border-[#2A2D31] rounded-lg overflow-hidden mb-5">
              <table className="w-full text-sm">
                <tbody className="bg-[#1E2328]">
                  <BeneficiaryRow label="USD Selling" value={dealData.beneficiaryDetails?.usdSelling} />
                  <BeneficiaryRow label="Rate" value={dealData.beneficiaryDetails?.rate} />
                  <BeneficiaryRow label="TZS amount to be paid" value={dealData.beneficiaryDetails?.tzsAmount} />
                </tbody>
              </table>
            </div>

            {/* Denomination Table */}
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-white mb-4">Denomination Table</h3>
              <div className="border border-[#2A2D31] rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0F1012] sticky top-0">
                      <tr>
                        <th className="p-3 border-b border-r border-[#2A2D31] text-left text-white font-normal">Denomination (cash)</th>
                        <th className="p-3 border-b border-r border-[#2A2D31] text-left text-white font-normal">Quantity</th>
                        <th className="p-3 border-b border-[#2A2D31] text-left text-white font-normal">Tally Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1E2328]">
                      {dealData.denominations && dealData.denominations.length > 0
                        ? dealData.denominations.map((item, index) => (
                          <Row key={index} denom={item.denom} qty={item.qty} total={item.total} />
                        ))
                        : <Row denom={100} qty={9} total="900.00" />}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <NotificationCard
        confirmModal={confirmModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <ReasonModal
        open={reasonModalOpen}
        onSubmit={handleSubmitReason}
        onBack={() => setReasonModalOpen(false)}
      />
      <Toast show={toast.show} message={toast.message} type={toast.type} />

    </div>
  );
}

/* SMALL COMPONENTS */
function BeneficiaryRow({ label, value }) {
  return (
    <tr className="border-b border-[#2A2D31] last:border-b-0">
      <td className="p-3 border-r border-[#2A2D31] text-[12px] font-medium text-[#FFFFFF]">{label}</td>
      <td className="p-3 text-[#C4C4C4] text-[12px] font-normal">{value}</td>
    </tr>
  );
}

function Row({ denom, qty, total }) {
  return (
    <tr className="border-b border-[#2A2D31] last:border-b-0">
      <td className="p-3 border-r border-[#2A2D31] text-[#C4C4C4]">${denom}</td>
      <td className="p-3 border-r border-[#2A2D31] text-[#C4C4C4]">{qty}</td>
      <td className="p-3 text-[#C4C4C4]">{total}</td>
    </tr>
  );
}
