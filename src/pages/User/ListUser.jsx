import { useState,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Toast from "../../components/common/Toast";
import Table from "../../components/common/Table"; 
import add from "../../assets/Common/Hplus.svg";
import ActionDropdown from "../../components/common/ActionDropdown";
import NotificationCard from "../../components/common/Notification"; 
import { fetchUsers, updateUserStatus, deleteUser } from "../../api/user/user.jsx"; 
import { sendResetPasswordEmail } from "../../api/auth/auth.jsx";

export default function ListUser() {
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const location = useLocation();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });


  useEffect(() => {
      if (location.state?.toast) {
          setToastMessage(location.state.toast.message);
          setToastType(location.state.toast.type);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2500);
      }
  }, [location.state]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await fetchUsers();
    setUsers(res.data);
    setPagination(res.pagination);
  };

  const handleAddUser = () => {
    navigate("/users/add-user");
  };

  const columns = [
    { label: "Name", key: "full_name", align: "left" },
    { label: "Role", key: "role", align: "center" },
    { label: "Email", key: "email", align: "center" },
    { label: "User Status", key: "status", align: "center" },
    { label: "last Login", key: "last_login", align: "left" },
    { label: "Actions", key: "actions", align: "center" },
  ];

  const rowsWithActions = users.map((user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.is_active ? "Active" : "Inactive",
    last_login: new Date(user.last_login).toLocaleDateString(),
    actions: (
      <div className="flex justify-center w-full">
        <ActionDropdown
          options={[
            {
              label: "View User Details",
              onClick: () => navigate(`/users/details/${user.id}`),
            },
            {
              label: "Edit User Details",
              onClick: () =>
                navigate(`/users/details/${user.id}`, {
                  state: { edit: true },
                }),
            },
            {
              label: "Delete User",
              onClick: () =>
                setConfirmModal({
                  open: true,
                  actionType: "remove",
                  id: user.id,
                  title: "Are you sure you want to delete this account?",
                  message:
                  "You are about to delete this user account. Once deleted, the user will lose all system access. Do you wish to continue?",
                }),
            },
            {
              label: user.is_active ? "Deactivate User" : "Activate User",
              onClick: () =>
                setConfirmModal({
                    open: true,
                    actionType: user.is_active ? "deactivate" : "activate",
                    id: user.id,
                    title: user.is_active
                        ? "Are you sure you want to deactivate this user account?"
                        : "Are you sure you want to activate this user account?",
                    message: user.is_active
                        ? "You are about to deactivate this user account. The user will be unable to log in until reactivated. Do you want to continue?"
                        : "You are about to activate this user account. The user will be able to log in. Do you want to continue?",
                })
            },
            {
              label: "Reset Password",
              onClick: () =>
                setConfirmModal({
                  open: true,
                  actionType: "resetPassword",
                  id: user.id,
                  email: user.email,
                  title: "Are you sure you want to send a password reset link?",
                  message: "You want to send a password reset link to this user’s email.",
                })
            },
          ]}
        />
      </div>
    ),
  }));

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-white text-2xl font-semibold">Users</h1>
        <button    
        onClick={handleAddUser}
        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
          <img src={add} alt="add" className="w-5 h-5" />
          Add User
        </button>
      </div>

      <p className="text-gray-400 mb-6">Manage system users and roles</p>

      <div className="mt-8">
        <Table 
          columns={columns} 
          data={rowsWithActions}   
          title="Users List"
          subtitle=""
          sortableKeys={["email", "status"]}
           showRightSection={false}
        />
      </div>
       <Toast show={showToast} message={toastMessage} type={toastType} />
       <NotificationCard 
        confirmModal={confirmModal}
        onConfirm={async () => {
          const { actionType, id, email } = confirmModal;

          try {
            if (actionType === "resetPassword") {
              await sendResetPasswordEmail(email);
              setToastMessage("Password reset email sent to user.");
              setToastType("success");
            }

            if (actionType === "activate" || actionType === "deactivate") {
              const isActive = actionType === "activate";
              await updateUserStatus(id, isActive);

              setToastMessage(isActive ? "User Activated!" : "User Deactivated!");
              setToastType(isActive ? "success" : "error");
            }

            if (actionType === "remove") {
              await deleteUser(id);
              setToastMessage("Account Deleted!");
              setToastType("error");
            }

            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);

            loadUsers(); // refresh table

          } catch (error) {
            setToastMessage("Action failed. Try again.");
            setToastType("error");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
          }

          setConfirmModal({ open: false });
        }}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </>
  );
}
