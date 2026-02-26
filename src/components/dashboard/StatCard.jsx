


export default function StatCard({ title, value, subValues, change, icon, color }) {
  const hasSubValues = subValues && subValues.length > 0;

  return (
    <div
      className="
        w-full min-h-[120px]
        bg-[#1E2328]
        rounded-xl
        p-4
        flex flex-col
        relative
        overflow-hidden
        group
        transition-all duration-300
        border border-[#2E3439]
      "
    >
      {/* Background Accent */}

      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-white font-semibold">{title}</p>
        <img src={icon} alt="" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {hasSubValues ? (
          <div className="grid grid-cols-1 gap-2.5">
            {subValues.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[#2A2F33]/30 border border-[#343A40]/30 hover:bg-[#2A2F33]/50 transition-colors"
              >
                <span className="text-white text-[11px] font-bold uppercase tracking-tighter">{item.label}</span>
                <span className={`${item.color || "text-white"} text-[15px] font-bold tabular-nums`}>{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            <h2 className={`${color || "text-white"} text-3xl font-semibold tracking-tight tabular-nums`}>
              {value}
            </h2>
            {change && (
              <p
                className={`text-[12px] mt-1.5 font-semibold ${change?.includes("-") ? "text-[#F7626E]" : "text-[#82E890]"
                  }`}
              >
                {change}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
