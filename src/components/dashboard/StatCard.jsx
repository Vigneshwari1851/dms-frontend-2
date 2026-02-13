

export default function StatCard({ title, value, subValues, change, icon }) {
  return (
    <div
      className="
        w-full min-h-[124px]
        bg-[#1E2328]
        rounded-lg
        p-4
        flex flex-col justify-between
        backdrop-blur-md
        gradient-border
      "
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-[#C1C1C1] font-normal text-[16px]">{title}</p>
        <img src={icon} alt="" className="w-8 h-8 " />
      </div>

      <div className="flex flex-col gap-1">
        {subValues ? (
          subValues.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[#8F8F8F] text-sm w-8">{item.label}</span>
              <h2 className="text-white text-xl font-semibold">{item.value}</h2>
            </div>
          ))
        ) : (
          <h2 className="text-white text-2xl font-semibold">{value}</h2>
        )}
      </div>

      {change && (
        <p
          className={`text-sm mt-2 ${change?.includes("-") ? "text-[#BD404A] font-normal text-xs" : "text-[#96D9C0] font-normal text-xs"
            }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}
