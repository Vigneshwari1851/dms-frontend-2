export default function ContentArea({ children }) {
  return (
    <div className="p-6 flex-1 overflow-y-auto">
      {children}
    </div>
  );
}
