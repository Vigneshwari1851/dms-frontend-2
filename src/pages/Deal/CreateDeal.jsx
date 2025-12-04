import { useState } from "react";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";

export default function CreateDeal() {
  const [denominationReceived, setDenominationReceived] = useState([{ denom: 0, quantity: 0 }]);
  const [denominationPaid, setDenominationPaid] = useState([{ denom: 0, quantity: 0 }]);

  return (
    <>
      
      {/* Page Header */}
      <div >
        <h2 className="text-[16px] font-medium">New Deal</h2>
       <p className="text-gray-400 text-[12px] mb-6">Complete all required fields.</p>

      </div>
       

      {/* Form Container */}
      <div className="mt-4 bg-[#1A1F24] p-5 rounded-xl ">

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-normal text-sm text-[#ABABAB] mb-1">Full Name *</label>
            <input className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block font-normal text-sm text-[#ABABAB]  mb-1">Phone Number *</label>
            <input className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg px-3 py-2" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block font-normal text-sm text-[#ABABAB]   mb-1">Transaction Type *</label>
            <select className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg p-2">
              <option>Select</option>
            </select>
          </div>

          <div>
            <label className="block font-normal text-sm text-[#ABABAB]  mb-1">Transaction Mode *</label>
            <select className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg p-2">
              <option>Select</option>
            </select>
          </div>

          <div>
            <label className="block font-normal text-sm text-[#ABABAB]   mb-1">Amount *</label>
            <input type="number" className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg p-2" />
          </div>
 
           <div>
            <label className="block font-normal text-sm text-[#ABABAB]   mb-1">Rate *</label>
            <input type="number" className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg p-2" />
          </div>
        </div>

        {/* Denomination Section */}
        <div className="grid grid-cols-2 gap-6 mt-8">

          {/* Received */}
          <div className="bg-[#1b1e21] border border-[#2A2F33] p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Denomination Received</h3>
              <button className="text-blue-400 text-sm">Select Currency</button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#2A2F33]">
                  <th className="py-2">Denomination</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {denominationReceived.map((row, i) => (
                  <tr key={i} className="border-b border-[#2A2F33]">
                    <td className="py-3">{row.denom}</td>
                    <td>{row.quantity}</td>
                    <td>{row.denom * row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="mt-4 w-full bg-[#1D4CB5] py-2 rounded-lg">+ Add</button>
          </div>

          {/* Paid */}
          <div className="bg-[#1b1e21] border border-[#2A2F33] p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Denomination Paid</h3>
              <button className="text-blue-400 text-sm">Select Currency</button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#2A2F33]">
                  <th className="py-2">Denomination</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {denominationPaid.map((row, i) => (
                  <tr key={i} className="border-b border-[#2A2F33]">
                    <td className="py-3">{row.denom}</td>
                    <td>{row.quantity}</td>
                    <td>{row.denom * row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="mt-4 w-full bg-[#1D4CB5] py-2 rounded-lg">+ Add</button>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8">
          <label className="block mb-2 text-gray-300">Notes (Optional)</label>
          <textarea className="w-full bg-[#1b1e21] border border-[#2A2F33] rounded-lg p-3 h-24" />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button className="px-6 py-2 border border-gray-500 rounded-lg">Cancel</button>
          <button className="px-6 py-2 bg-[#1D4CB5] rounded-lg">Create Deal</button>
        </div>

      </div>

    </>
  );
}
