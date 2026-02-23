export default function DiscardModal({ show, onDiscard, onKeep }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[2000] p-4">
            <div className="bg-[#16191C] border border-[#2A2F33] p-8 rounded-2xl flex flex-col items-center gap-5 max-w-sm w-full shadow-2xl">
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-[#B91C1C]/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#B91C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>

                {/* Text */}
                <div className="text-center">
                    <h3 className="text-white text-lg font-bold mb-2">Discard Changes?</h3>
                    <p className="text-[#8F8F8F] text-sm">You have unsaved data. If you leave now, all entered information will be lost.</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onDiscard}
                        className="flex-1 px-4 py-2.5 border border-[#2A2F33] text-[#ABABAB] rounded-xl hover:bg-[#2A2F33] transition-colors text-sm font-medium"
                    >
                        Yes, Discard
                    </button>
                    <button
                        onClick={onKeep}
                        className="flex-1 px-4 py-2.5 bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-xl transition-colors text-sm font-medium"
                    >
                        Keep Editing
                    </button>
                </div>
            </div>
        </div>
    );
}
