import React from "react";
import saveIcon from "../../assets/Common/save.svg"

export default function CurrencyForm({
  title = "Add new currency",
  subtitle = "Enter details for the new currency type",
  currencyName,
  isoCode,
  symbol,
  onChange,
  onCancel,
  onSubmit,
}) {
  return (
    <div className="bg-[#1A1F24] p-6 rounded-lg w-[470px] text-white">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="block text-sm text-[#ABABAB] mb-1">
            Currency name <span className="text-red-500">*</span>
          </label>
          <input
            value={currencyName}
            onChange={(e) => onChange("currencyName", e.target.value)}
            className="w-full bg-[#16191C] rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-[#ABABAB] mb-1">
            ISO 4217 Code (e.g. USD) <span className="text-red-500">*</span>
          </label>
          <input
            value={isoCode}
            onChange={(e) => onChange("isoCode", e.target.value)}
            className="w-full bg-[#16191C] rounded-lg px-3 py-2 outline-none uppercase"
            maxLength={3}
          />
        </div>

        <div>
          <label className="block text-sm text-[#ABABAB] mb-1">
            Symbol (e.g. $) <span className="text-red-500">*</span>
          </label>
          <input
            value={symbol}
            onChange={(e) => onChange("symbol", e.target.value)}
            className="w-full bg-[#16191C] rounded-lg px-3 py-2 outline-none"
          />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-white text-white font-medium hover:bg-[#222]"
        >
          Cancel
        </button>

        <button
          onClick={onSubmit}
          className="px-5 py-2 bg-[#1D4CB5] hover:bg-[#173B8B] rounded-lg text-white font-medium flex items-center gap-2"
        >
          <img src={saveIcon} alt="Save" className="w-5 h-5" />
          Save Currency
        </button>
      </div>
    </div>
  );
}
