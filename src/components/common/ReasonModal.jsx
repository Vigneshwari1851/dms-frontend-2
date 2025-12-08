function ReasonModal({ open, onSubmit, onBack }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="w-[470px] h-[350px] bg-[#1E2328] rounded-lg shadow-xl p-4 text-start relative">

                <h2 className="text-[16px] text-white font-semibold">
                    Please provide a reason for rejecting this deal
                </h2>

                <p className="text-gray-400 text-sm mt-2">
                    Your feedback helps the maker understand and correct the deal details.
                </p>

                <textarea
                    placeholder="Enter reason for rejection..."
                    className="w-full h-36 bg-[#121518] text-white p-3 mt-4 rounded-md outline-none resize-none"
                ></textarea>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 border border-gray-400 text-white rounded-lg hover:bg-white hover:text-black"
                    >
                        Back to review
                    </button>

                    <button
                        onClick={onSubmit}
                        className="px-4 py-2 bg-[#1D4CB5] text-white rounded-lg hover:bg-[#173B8B]"
                    >
                        Submit reason
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ReasonModal;
