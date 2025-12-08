import { useState } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/common/tick.svg";
import plus from "../../assets/common/Hplus.svg";
import Denomination from "../../components/deal/Denomination";
import Toast from "../../components/common/Toast";

export default function CreateDeal() {
  const [denominationReceived, setDenominationReceived] = useState([
    { denom: 0, quantity: 0 },
  ]);

  const [denominationPaid, setDenominationPaid] = useState([
    { denom: 0, quantity: 0 },
  ]);

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

  // Dropdown States
  const [txnType, setTxnType] = useState("");
  const [txnTypeOpen, setTxnTypeOpen] = useState(false);

  const [txnMode, setTxnMode] = useState("");
  const [txnModeOpen, setTxnModeOpen] = useState(false);


   const [currency, setCurrency] = useState("USD - US Dollar");
  const [currencyOpen, setCurrencyOpen] = useState(false);


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

  
  return (
    <>
      {/* Page Header */}
      <div>
        <h2 className="text-[16px] font-medium text-white">New Deal</h2>
        <p className="text-gray-400 text-[12px] mb-6">
          Complete all required fields.
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-4 bg-[#1A1F24] p-6 rounded-xl">
        
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Full Name <span className="text-red-500">*</span>
            </label>

            <input
              className="w-full bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Phone Number <span className="text-red-500">*</span>
            </label>

            <input
              className="w-full bg-[#16191C] rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-4 gap-6 mt-6">
          
          {/* Transaction Type */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Type <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <button
                onClick={() => setTxnTypeOpen(!txnTypeOpen)}
                className="
                  w-full
                  h-10
                  bg-[#16191C]
                  rounded-lg
                  text-[14px]
                  text-[#E3E3E3]
                  font-medium
                  flex items-center justify-between
                  px-4
                "
              >
                <span>{txnType}</span>
                <img src={down} alt="down" className="w-3" />
              </button>

              {txnTypeOpen && (
                <ul className="
                  absolute left-0 right-0 mt-2 
                  bg-[#2E3439] border border-[#2A2F33] 
                  rounded-lg z-10
                ">
                  {["Buy", "Sell"].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setTxnType(item);
                        setTxnTypeOpen(false);
                      }}
                      className="
                        px-4 py-2 
                        flex items-center justify-between
                        hover:bg-[#1E2328]
                        cursor-pointer
                        text-white
                      "
                    >
                      <span>{item}</span>
                      {txnType === item && (
                        <img src={tick} className="w-4 h-4" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Transaction Mode */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Mode <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <button
                onClick={() => setTxnModeOpen(!txnModeOpen)}
                className="
                  w-full
                  h-10
                  bg-[#16191C]
                  rounded-lg
                  text-[14px]
                  text-[#E3E3E3]
                  font-medium
                  flex items-center justify-between
                  px-4
                "
              >
                <span>{txnMode }</span>
                <img src={down} alt="down" className="w-3" />
              </button>

              {txnModeOpen && (
                <ul className="
                  absolute left-0 right-0 mt-2 
                  bg-[#2E3439] border border-[#2A2F33] 
                  rounded-lg z-10
                ">
                  {["Cash", "Credit"].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setTxnMode(item);
                        setTxnModeOpen(false);
                      }}
                      className="
                        px-4 py-2 
                        flex items-center justify-between
                        hover:bg-[#1E2328]
                        cursor-pointer
                        text-white
                      "
                    >
                      <span>{item}</span>
                      {txnMode === item && (
                        <img src={tick} className="w-4 h-4" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Amount <span className="text-red-500">*</span>
            </label>
            <input className="w-full bg-[#16191C] rounded-lg p-2 text-white" placeholder="0.00"/>
          </div>

          {/* Rate */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Rate <span className="text-red-500">*</span>
            </label>
            <input className="w-full bg-[#16191C] rounded-lg p-2 text-white" placeholder="0.00" />
          </div>
        </div>

        {/* Denomination Section */}
        <div className="mt-8">
          <Denomination />
        </div>

        {/* Notes */}
        <div className="mt-8">
          <label className="block text-[#ABABAB] text-[14px] mb-2">
            Notes (Optional)
          </label>
          <textarea
            className="
              w-full bg-[#16191C] rounded-lg 
              p-3 h-24 text-white
              placeholder:text-[#ABABAB]
              font-poppins
            "
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button className="w-[95px] h-10 border border-gray-500 rounded-lg text-white">
            Cancel
          </button>

          <button className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-blue-600 h-10 text-white px-4 py-2 rounded-md text-sm font-medium" onClick={handleConfirm}> 
            <img src={plus} className="w-5 h-5" />
            Create Deal
          </button>
        </div>

      </div>
    </>
  );
}
