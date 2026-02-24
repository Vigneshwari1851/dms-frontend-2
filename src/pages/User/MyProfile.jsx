import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserById, updateUser } from "../../api/user/user";
import profileIcon from "../../assets/user/profile.svg";
import editIcon from "../../assets/Common/edit.svg";

export default function MyProfile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.user_id;
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetchUserById(userId);
      if (res.success) {
        const user = res.data.user;
        setFormData({
          full_name: user.full_name,
          email: user.email,
          phone: user.phone_number,
          role: user.role,
        });
        setInitialData({
          email: user.email,
          phone: user.phone_number,
        });
      }
    };
    loadProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      phone_number: formData.phone,
      email: formData.email,
    };
    const res = await updateUser(userId, payload);
    if (res.success) setEditMode(false);
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      email: initialData.email,
      phone: initialData.phone,
    }));
    setEditMode(false);
  };

  return (
    <>
      {/* Header with Edit Icon */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-[16px] font-medium">My Profile</h2>
        <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1 bg-[#1D4CB5] hover:bg-[#173B8B] h-9 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          >
            <img src={editIcon} alt="edit"/>
            Edit
          </button>
      </div>

      <div className="bg-[#1A1F24] rounded-xl p-4 lg:p-5">
        {/* <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#16191C] flex items-center justify-center">
              <img src={profileIcon} alt="profile" className="w-full h-full" />
            </div>
          </div>

          <div>
            <p className="text-white text-[18px] font-semibold">
              {formData.full_name}
            </p>
            <p className="text-[#6FA8FF] text-[14px]">{formData.role}</p>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-[#ABABAB] text-sm mb-1">
              Full Name
            </label>
            <input
              name="full_name"
              value={formData.full_name}
              readOnly
              className="w-full bg-[#16191C] rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-[#ABABAB] text-sm mb-1">Role</label>
            <input
              value={formData.role}
              readOnly
              className="w-full bg-[#16191C] rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-[#ABABAB] text-sm mb-1">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={!editMode}
              className={`w-full bg-[#16191C] rounded-lg px-4 py-2 text-white`}
            />
          </div>

          <div>
            <label className="block text-[#ABABAB] text-sm mb-1">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={!editMode}
              className={`w-full bg-[#16191C] rounded-lg px-4 py-2 text-white`}
                onKeyDown={(e) => {
                    if (!editMode) return;
                    const allowedControlKeys = [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab",
                    ];
                    if (allowedControlKeys.includes(e.key)) return;
                    if (["+", " ", "-", "(", ")"].includes(e.key)) return;
                    if (/^[0-9]$/.test(e.key)) {
                        const currentDigits = formData.phone.replace(/\D/g, "");
                        if (currentDigits.length >= 15) e.preventDefault();
                        return;
                    }
                    e.preventDefault();
                }}
            />
          </div>
        </div>

        {editMode && (
          <>
            <div className="flex flex-col lg:hidden gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="w-full h-12 px-4 py-3 rounded-lg border border-[#8A8F94] text-white hover:bg-[#2A2F33] text-sm font-medium active:opacity-80"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="w-full h-12 px-4 py-3 rounded-lg bg-[#1D4CB5] text-white hover:bg-[#173B8B] text-sm font-medium active:opacity-80"
              >
                Save
              </button>
            </div>
            <div className="hidden lg:flex justify-end gap-3 mt-10">
              <button
                onClick={handleCancel}
                className="px-6 py-2 rounded-lg border border-[#8A8F94] text-white hover:bg-[#2A2F33]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-[#1D4CB5] text-white hover:bg-[#173B8B]"
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
