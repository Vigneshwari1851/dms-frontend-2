


export default function StatCard({ title, subtitle, value, subValues, change, icon, color }) {
  const hasSubValues = subValues && subValues.length > 0;

  return (
    <div
      className="
        w-full h-[130px]
        bg-[#1E2328]
        rounded-xl
        p-4
        flex flex-col
        relative
        overflow-hidden
        group
        transition-all duration-300
        shadow-lg
      "
    >
      <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
        <div>
          <p className="text-white text-sm font-medium">{title}</p>
          {subtitle && <p className="text-[#8F8F8F] text-[10px] mt-0.5">{subtitle}</p>}
        </div>
        <img src={icon} alt="" className="w-4 h-4" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-grey pr-1">
        {hasSubValues ? (
          <div className="grid grid-cols-1 gap-2">
            {subValues.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1 group/item"
              >
                <span className="text-white text-[12px] group-hover/item:text-blue-400 transition-colors">{item.label}</span>
                <span className="text-[#8F8F8F] text-[13px] tabular-nums group-hover/item:text-white transition-colors">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full justify-center">
            <h2 className={`text-3xl tabular-nums ${color || 'text-white'}`}>
              {value}
            </h2>
            {change && (
              <p className="text-[11px] mt-1 text-[#8F8F8F]">
                {change}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
