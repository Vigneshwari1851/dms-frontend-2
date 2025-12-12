import { useState, useEffect } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/common/tick.svg";
import plus from "../../assets/common/Hplus.svg";
import editIcon from "../../assets/Common/edit.svg";
import save from "../../assets/common/save.svg";
import Denomination from "../../components/deal/Denomination";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDealById, updateDeal } from "../../api/deals";

export default function EditDeal() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [deal, setDeal] = useState(null);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // Form States
    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [denominationReceived, setDenominationReceived] = useState([]);
    const [denominationPaid, setDenominationPaid] = useState([]);

    // Dropdown States
    const [txnType, setTxnType] = useState("");
    const [txnTypeOpen, setTxnTypeOpen] = useState(false);

    const [txnMode, setTxnMode] = useState("");
    const [txnModeOpen, setTxnModeOpen] = useState(false);

    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("");
    const [notes, setNotes] = useState("");

    const [currency, setCurrency] = useState("USD - US Dollar");
    const [currencyOpen, setCurrencyOpen] = useState(false);

    const isPending = (deal?.status || "").toLowerCase() === "pending";
    const isEditable = isPending && editMode;

    const populateFormFromDeal = (dealData) => {
        setCustomerName(dealData.customer.name || "");
        setPhoneNumber(dealData.customer.phone_number || "");
        setTxnType(dealData.deal_type === "buy" ? "Buy" : "Sell");
        setTxnMode(dealData.transaction_mode === "cash" ? "Cash" : "Credit");
        setAmount(dealData.amount || "");
        setRate(dealData.rate || "");
        setNotes(dealData.remarks || "");

        const received = dealData.received_items || [];
        const paid = dealData.paid_items || [];

        const formattedReceived = received.length > 0
            ? received.map(item => ({
                price: Number(item.price),
                quantity: Number(item.quantity),
                total: Number(item.total),
                currency_id: item.currency_id
            }))
            : [{ price: 0, quantity: 0, total: 0, currency_id: 1 }];

        const formattedPaid = paid.length > 0
            ? paid.map(item => ({
                price: Number(item.price),
                quantity: Number(item.quantity),
                total: Number(item.total),
                currency_id: item.currency_id
            }))
            : [{ price: 0, quantity: 0, total: 0, currency_id: 1 }];

        setDenominationReceived(formattedReceived);
        setDenominationPaid(formattedPaid);
    };

    // Fetch deal data on mount
    useEffect(() => {
        const loadDeal = async () => {
            try {
                setLoading(true);
                const response = await fetchDealById(id);

                if (!response.success) {
                    setError("Failed to load deal data");
                    setLoading(false);
                    return;
                }

                const dealData = response.data.data || response.data;
                setDeal(dealData);

                populateFormFromDeal(dealData);
                setEditMode(false);

                setError(null);
            } catch (err) {
                console.error("Error fetching deal:", err);
                setError("Failed to load deal data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadDeal();
        }
    }, [id]);

    const handleStartEdit = () => {
        if (isPending) {
            setEditMode(true);
        }
    };

    const handleCancelEdit = () => {
        if (deal) {
            populateFormFromDeal(deal);
        }
        setEditMode(false);
    };

    const handleSave = async () => {
        try {
            const dealData = {
                customer_name: customerName,
                phone_number: phoneNumber,
                deal_type: txnType.toLowerCase(),
                transaction_mode: txnMode.toLowerCase(),
                amount: amount,
                rate: rate,
                remarks: notes,
                received_items: denominationReceived
                    .filter((item) => item.price && item.quantity)
                    .map((item) => ({
                        price: String(item.price),
                        quantity: String(item.quantity),
                        currency_id: item.currency_id || 1,
                    })),
                paid_items: denominationPaid
                    .filter((item) => item.price && item.quantity)
                    .map((item) => ({
                        price: String(item.price),
                        quantity: String(item.quantity),
                        currency_id: item.currency_id || 1,
                    })),
            };

            if (isEditable) {
                await updateDeal(id, dealData);
                setEditMode(false);
                navigate("/deals");
            }
        } catch (err) {
            console.error("Error updating deal:", err);
            setError("Failed to update deal");
        }
    };


    return (
        <>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-[16px] font-medium text-white">
                        Deal ID - {deal?.deal_number || id || "Loading..."}
                    </h2>
                    {/* <p className="text-gray-400 text-[12px]">
                        {isPending
                            ? editMode
                                ? "Editing enabled. Update fields and save."
                                : "View details. Click edit to modify pending deal."
                            : "View details. Editing is allowed only while status is Pending."}
                    </p> */}
                </div>

                {/* <div className="flex items-center gap-3">
                    {editMode && (
                        <button
                            className="w-[95px] h-10 border border-gray-500 rounded-lg text-white hover:bg-gray-900"
                            onClick={handleCancelEdit}
                        >
                            Cancel
                        </button>
                    )}

                    {isPending && (
                        <button
                            className={
                                editMode
                                    ? "flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium bg-[#1D4CB5] text-white cursor-pointer hover:bg-blue-600"
                                    : "flex items-center justify-center px-3 py-2 rounded-md bg-[#1D4CB5] text-white cursor-pointer hover:bg-blue-600"
                            }
                            onClick={editMode ? handleSave : handleStartEdit}
                        >
                            {!editMode && (
                                <img src={editIcon} className="w-7 h-8" />
                            )}

                            {editMode && "Save"}
                        </button>



                    )}
                </div> */}
                <div className="flex items-center gap-3">
                    {/* Cancel + Save buttons (edit mode) */}
                    {editMode && (
                        <>
                            {/* Cancel Button */}
                            <button
                                className="w-[95px] h-[40px] rounded-[8px] border border-white text-white font-medium text-sm flex items-center justify-center px-3 py-2 cursor-pointer hover:bg-white hover:text-black"
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </button>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                className="flex items-center justify-center gap-2 w-[91px] h-[40px] rounded-[8px] bg-[#1D4CB5] text-white font-medium text-sm cursor-pointer hover:bg-blue-600 px-2"
                            >
                                <img src={save} className="w-[20px] h-[20px]" alt="Save" />
                                Save
                            </button>
                        </>
                    )}

                    {/* Edit Button (not in edit mode) */}
                    {!editMode && isPending && (
                        <button
                            onClick={handleStartEdit}
                            className="flex items-center justify-center w-[41px] h-[40px] rounded-[8px] bg-[#1D4CB5] text-white cursor-pointer hover:bg-blue-600"
                        >
                            <img src={editIcon} className="w-[41px] h-[40px]" alt="Edit" />
                        </button>
                    )}
                </div>

            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-[#1A1F24] p-6 rounded-xl text-center text-white">
                    <p>Loading deal data...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-[#1A1F24] p-6 rounded-xl border border-red-500 text-red-500">
                    <p>{error}</p>
                </div>
            )}

            {/* Form Container */}
            {!loading && (
                <div className="mt-4 bg-[#1A1F24] p-6 rounded-xl">

                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Full Name <span className="text-red-500">*</span>
                            </label>


                            <input
                                className="w-full bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none"
                                value={customerName}
                                disabled
                            />

                        </div>

                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Phone Number <span className="text-red-500">*</span>
                            </label>

                            <input
                                className="w-full bg-[#16191C] rounded-lg px-3 py-2 text-white"
                                value={phoneNumber}
                                disabled
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
                                    onClick={() => isEditable && setTxnTypeOpen(!txnTypeOpen)}
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
                                    disabled
                                >
                                    <span>{txnType}</span>
                                    <img src={down} alt="down" className="w-3" />
                                </button>

                                {txnTypeOpen && isEditable && (
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
                                    onClick={() => isEditable && setTxnModeOpen(!txnModeOpen)}

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
                                    <span>{txnMode}</span>
                                    <img src={down} alt="down" className="w-3" />

                                </button>

                                {txnModeOpen && isEditable && (
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
                            <input
                                className="w-full bg-[#16191C] rounded-lg p-2 text-white"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={!isEditable}
                            />
                        </div>

                        {/* Rate */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Rate <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full bg-[#16191C] rounded-lg p-2 text-white"
                                placeholder="0.00"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                disabled={!isEditable}
                            />
                        </div>
                    </div>

                    {/* Denomination Section */}
                    <div className="mt-8">
                        <div className={!isEditable ? "pointer-events-none opacity-70" : ""}>
                            <Denomination
                                denominationReceived={denominationReceived}
                                setDenominationReceived={setDenominationReceived}
                                denominationPaid={denominationPaid}
                                setDenominationPaid={setDenominationPaid}
                            />
                        </div>
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
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={!isEditable}
                        />
                    </div>

                </div>
            )}
        </>
    );
}
