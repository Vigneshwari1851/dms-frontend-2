import { useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import StatCard from "../../components/dashboard/StatCard";
import Table from "../../components/common/Table";
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from "../../api/expense";
import { fetchCurrencies } from "../../api/currency/currency";
import Dropdown from "../../components/common/Dropdown";
import ActionDropdown from "../../components/common/ActionDropdown";
import Toast from "../../components/common/Toast";
import expensesIcon from "../../assets/dashboard/sellamount.svg";
import addIcon from "../../assets/dashboard/add.svg";

export default function ExpenseList() {
    const { setSidebarHidden } = useOutletContext();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const currencyOptions = useMemo(() => currencies.map(c => ({ label: c.code, value: c.id })), [currencies]);

    useEffect(() => {
        if (setSidebarHidden) {
            setSidebarHidden(showAddForm);
        }
        return () => {
            if (setSidebarHidden) setSidebarHidden(false);
        };
    }, [showAddForm, setSidebarHidden]);

    const [formData, setFormData] = useState({
        category: "",
        description: "",
        amount: "",
        currency_id: "",
        date: new Date().toISOString().split("T")[0]
    });
    const selectedCurrencyLabel = useMemo(() => currencies.find(c => c.id === formData?.currency_id)?.code, [currencies, formData?.currency_id]);

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [expenseRes, currencyRes] = await Promise.all([
                fetchExpenses({ limit: 100 }),
                fetchCurrencies({ limit: 100 })
            ]);

            if (expenseRes.data) {
                setExpenses(expenseRes.data.map(item => ({
                    ...item,
                    formattedDate: new Date(item.date).toLocaleDateString("en-GB")
                })));
            }

            if (currencyRes) {
                setCurrencies(currencyRes);
                // Set default currency to first one if not set
                if (currencyRes.length > 0 && !formData.currency_id) {
                    setFormData(prev => ({ ...prev, currency_id: currencyRes[0].id }));
                }
            }
        } catch (err) {
            console.error("Error loading data:", err);
            setToast({ show: true, message: "Failed to load data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalExpense = useMemo(() => {
        return expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    }, [expenses]);

    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!formData.category.trim()) errors.category = "Category is required";
        if (!formData.description.trim()) errors.description = "Description is required";
        if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
            errors.amount = "Enter a valid positive amount";
        }
        if (!formData.currency_id) errors.currency_id = "Currency is required";
        if (!formData.date) errors.date = "Date is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            category: expense.category,
            description: expense.description,
            amount: expense.amount,
            currency_id: expense.currency_id,
            date: new Date(expense.date).toISOString().split("T")[0]
        });
        setShowAddForm(true);
    };

    const handleCloseModal = () => {
        setShowAddForm(false);
        setEditingExpense(null);
        setFormData({
            category: "",
            description: "",
            amount: "",
            currency_id: currencies.length > 0 ? currencies[0].id : "",
            date: new Date().toISOString().split("T")[0]
        });
        setFormErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (editingExpense) {
                await updateExpense(editingExpense.id, {
                    ...formData,
                    amount: Number(formData.amount),
                    currency_id: Number(formData.currency_id)
                });
                setToast({ show: true, message: "Expense updated successfully", type: "success" });
            } else {
                await createExpense({
                    ...formData,
                    amount: Number(formData.amount),
                    currency_id: Number(formData.currency_id)
                });
                setToast({ show: true, message: "Expense added successfully", type: "success" });
            }
            handleCloseModal();
            loadData();
        } catch (err) {
            setToast({ show: true, message: `Failed to ${editingExpense ? 'update' : 'add'} expense`, type: "error" });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await deleteExpense(id);
            setToast({ show: true, message: "Expense deleted successfully", type: "success" });
            loadData();
        } catch (err) {
            setToast({ show: true, message: "Failed to delete expense", type: "error" });
        }
    };

    const columns = [
        { label: "Date", key: "formattedDate", align: "left" },
        { label: "Category", key: "category", align: "left" },
        { label: "Description", key: "description", align: "left" },
        {
            label: "Amount",
            key: "amount",
            align: "left",
            render: (v, row) => (
                <span className="">
                    {row.currency?.code || "TZS"} {Number(v).toLocaleString()}
                </span>
            )
        },
        {
            label: "Action",
            key: "id",
            align: "left",
            render: (id, row) => (
                <ActionDropdown
                    options={[
                        { label: "Edit", onClick: () => handleEdit(row) },
                        { label: "Delete", onClick: () => handleDelete(id) },
                    ]}
                />
            )
        }
    ];

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-white text-xl font-semibold">Expense Management</h1>
                    <p className="text-[#8F8F8F] text-sm mt-1">Track operating costs and platform fees</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-lg"
                >
                    <img src={addIcon} alt="add" className="w-5 h-5" />
                    Record Expense
                </button>
            </div>
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1A1F24] border border-[#2A2D31] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-[#2A2D31] flex items-center justify-between">
                            <h2 className="text-white font-semibold text-sm">{editingExpense ? 'Edit Expense' : 'Record New Expense'}</h2>
                            <button onClick={handleCloseModal} className="text-[#8F8F8F] hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-[#8F8F8F] font-bold">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className={`w-full bg-[#131619] border ${formErrors.date ? 'border-red-500' : 'border-[#2A2D31]'} rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#1D4CB5]`}
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                    {formErrors.date && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-[#8F8F8F] font-bold">Category</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Fees, Rent, Salary"
                                        className={`w-full bg-[#131619] border ${formErrors.category ? 'border-red-500' : 'border-[#2A2D31]'} rounded-lg p-2.5 text-white text-sm outline-none focus:border-[#1D4CB5]`}
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                    {formErrors.category && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.category}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-[#8F8F8F] font-bold">Description</label>
                                <textarea
                                    required
                                    placeholder="Details about this expense..."
                                    className={`w-full bg-[#131619] border ${formErrors.description ? 'border-red-500' : 'border-[#2A2D31]'} rounded-lg p-2.5 text-white text-sm outline-none h-24 resize-none focus:border-[#1D4CB5]`}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                {formErrors.description && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-[#8F8F8F] font-bold">Amount</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        className={`w-full bg-[#131619] border ${formErrors.amount ? 'border-red-500' : 'border-[#2A2D31]'} rounded-lg p-2.5 text-white text-sm font-mono outline-none focus:border-[#1D4CB5]`}
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                    {formErrors.amount && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.amount}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-[#8F8F8F] font-bold">Currency</label>
                                    <Dropdown
                                        label="Select Currency"
                                        options={currencyOptions}
                                        selected={selectedCurrencyLabel}
                                        onChange={(item) => setFormData({ ...formData, currency_id: item.value })}
                                        className="w-full"
                                        buttonClassName={`!bg-[#131619] !border ${formErrors.currency_id ? 'border-red-500' : 'border-[#2A2D31]'} !rounded-lg !p-2.5 !h-[38px] !text-sm`}
                                    />
                                    {formErrors.currency_id && <p className="text-[10px] text-red-500 mt-0.5">{formErrors.currency_id}</p>}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-transparent border border-[#2A2D31] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A2D31] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#1D4CB5] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#173B8B] shadow-lg shadow-[#1D4CB5]/20 transition-all"
                                >
                                    {editingExpense ? 'Update Expense' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <Table
                    columns={columns}
                    data={expenses}
                    title="Expense History"
                    loading={loading}
                    showSearch={true}
                    showExport={true}
                />
            </div>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </>
    );
}
