


export default function StatCard({ title, subtitle, value, subValues, change, icon, color }) {
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
      "
    >
      {/* Background Accent */}

      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-white">{title}</p>
          {subtitle && <p className="text-[#8F8F8F] text-[10px] mt-0.5">{subtitle}</p>}
        </div>
        <img src={icon} alt="" className="w-5 h-5" />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {hasSubValues ? (
          <div className="grid grid-cols-1 gap-2.5">
            {subValues.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[#2A2F33]/30 hover:bg-[#2A2F33]/50 transition-colors"
              >
                <span className="text-white text-[11px] uppercase">{item.label}</span>
                <span className="text-white text-[15px] tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            <h2 className="text-white text-3xl tabular-nums">
              {value}
            </h2>
            {change && (
              <p
                className="text-[12px] mt-1.5 text-[#8F8F8F]"
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
