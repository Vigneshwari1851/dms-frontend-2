import { useState } from "react";
import add from "../../assets/user/add_person.svg";

export default function CreateDeal() {
    const [denominationReceived, setDenominationReceived] = useState([{ denom: 0, quantity: 0 }]);
    const [denominationPaid, setDenominationPaid] = useState([{ denom: 0, quantity: 0 }]);

    return (
        <>

            {/* Page Header */}
            <div >
                <h2 className="text-[16px] font-medium">Add New User</h2>
                <p className="text-gray-400 text-[12px] mb-6">Create a new user account for the system</p>

            </div>


            {/* Form Container */}
            <div className="mt-4 bg-[#1A1F24] p-5 rounded-xl ">
                <div>
                    <label className="block font-normal text-sm text-[#ABABAB] mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg px-3 py-2" />
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB]  mb-1">Email <span className="text-red-500">*</span></label>
                        <input className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB]  mb-1">Phone <span className="text-red-500">*</span></label>
                        <input className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg px-3 py-2" />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                    <button className="px-6 py-2 border border-gray-500 rounded-lg">Cancel</button>
                    <button
                        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-blue-600 h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
                        <img src={add} alt="add" className="w-5 h-5" />
                        Add User
                    </button>
                </div>

            </div>

        </>
    );
}
