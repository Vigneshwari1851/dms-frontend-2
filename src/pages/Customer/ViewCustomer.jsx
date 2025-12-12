import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomerById, updateCustomer } from "../../api/customers";
import saveIcon from "../../assets/common/save.svg";
import edit from "../../assets/Common/edit.svg";

export default function ViewCustomer() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone_number: "",
    });
    const [errors, setErrors] = useState({});
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const loadCustomer = async () => {
            const res = await fetchCustomerById(id);
            if (!res.success) {
                return navigate("/customer-info", {
                    state: {
                        toast: {
                            message: "Failed to load customer",
                            type: "error",
                        },
                    },
                });
            }
            const customer = res.data;
            setFormData({
                name: customer.name,
                email: customer.email,
                phone_number: customer.phone_number,
            });
            setInitialData({
                name: customer.name,
                email: customer.email,
                phone_number: customer.phone_number,
            });
        };

        loadCustomer();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Enter a valid email";
        }
        if (!formData.phone_number.trim()) newErrors.phone_number = "Phone is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const payload = {
            name: formData.name,
            email: formData.email,
            phone_number: formData.phone_number,
        };

        const res = await updateCustomer(id, payload);
        if (res.success) {
            setEditMode(false);
            setInitialData(payload);
            navigate("/customer-info", {
                state: {
                    toast: {
                        message: "Customer updated successfully",
                        type: "success",
                    },
                },
            });
        } else {
            navigate("/customer-info", {
                state: {
                    toast: {
                        message: "Failed to update customer",
                        type: "error",
                    },
                },
            });
        }
    };

    const handleCancel = () => {
        if (initialData) setFormData(initialData);
        setEditMode(false);
    };

    return (
        <div className="mt-4 bg-[#1A1F24] p-5 rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-[16px] font-medium text-white">Customer Details</h2>
                    <p className="text-gray-400 text-[12px]">View or edit customer information</p>
                </div>

                <div className="flex gap-2">
                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className=" bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-md"
                        >
                            <img
                                src={edit}
                                alt="edit"
                                className="w-8 h-8 cursor-pointer"
                            />
                        </button>
                    )}
                    {editMode && (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] px-4 py-2 rounded-md text-white"
                            >
                                <img src={saveIcon} alt="save" className="w-4 h-4" />
                                Save
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm text-[#ABABAB] mb-1">Full Name</label>
                <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly={!editMode}
                    className={`w-full px-3 py-2 rounded-lg bg-[#16191C] text-white
                        ${editMode ? "border border-[#2A2F33] focus:border-blue-500" : "border border-transparent cursor-not-allowed opacity-80"}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-[#ABABAB] mb-1">Email</label>
                    <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={!editMode}
                        className={`w-full px-3 py-2 rounded-lg bg-[#16191C] text-white
            ${editMode ? "border border-[#2A2F33] focus:border-blue-500" : "border border-transparent cursor-not-allowed opacity-80"}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm text-[#ABABAB] mb-1">Phone</label>
                    <input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        readOnly={!editMode}
                        className={`w-full px-3 py-2 rounded-lg bg-[#16191C] text-white
                            ${editMode ? "border border-[#2A2F33] focus:border-blue-500" : "border border-transparent cursor-not-allowed opacity-80"}`}
                    />
                    {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                </div>
            </div>
        </div>
    );
}
