

export default function StatCard({ title, value, change, icon }) {
  return (
    <div
      className="
        w-full lg:w-[269px] h-[124px]
        bg-[#1E2328]
        rounded-lg
        p-4
        flex flex-col justify-between
        backdrop-blur-md
        gradient-border
      "
    >
      <div className="flex items-center justify-between gap-3">

        <p className="text-[#C1C1C1] font-normal  text-[16px]">{title}</p>
        <img src={icon} alt="" className="w-8 h-8 " />
      </div>

      <h2 className="text-white text-2xl font-semibold">{value}</h2>

      <p
        className={`text-sm ${change?.includes("-") ? "text-[#BD404A] font-normal text-xs" : "text-[#96D9C0] font-normal text-xs"
          }`}
      >
        {change}
      </p>
    </div>
  );
}
