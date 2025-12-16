import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserById, updateUser } from "../../api/user/user";
import profileIcon from "../../assets/user/profile.svg";

export default function MyProfile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.user_id;

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
  });

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
      full_name: formData.full_name,
      phone_number: formData.phone,
    };
    const res = await updateUser(userId, payload);
    if (res.success) navigate(-1);
  };

  return (
    <>
      <h2 className="text-white text-[16px] font-medium mb-4">
        My Profile
      </h2>

      <div className="bg-[#1A1F24] rounded-xl p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#16191C] flex items-center justify-center">
              <img src={profileIcon} alt="profile" className="w-full h-full" />
            </div>
          </div>

          <div>
            <p className="text-white text-[18px] font-semibold">
              {formData.full_name}
            </p>
            <p className="text-[#6FA8FF] text-[14px]">
              {formData.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[#ABABAB] text-sm mb-1">
              Full Name
            </label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-[#16191C] rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-[#ABABAB] text-sm mb-1">
              Role
            </label>
            <input
              value={formData.role}
              readOnly
              className="w-full bg-[#16191C] rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-[#ABABAB] text-sm mb-1">
              Email
            </label>
            <input
              value={formData.email}
              readOnly
              className="w-full bg-[#16191C] rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-[#ABABAB] text-sm mb-1">
              Phone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#16191C] rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <button
            onClick={() => navigate(-1)}
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
      </div>
    </>
  );
}
