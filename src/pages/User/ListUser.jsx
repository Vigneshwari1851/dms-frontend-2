import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/common/Table"; 
import add from "../../assets/user/add_person.svg";
import ActionDropdown from "../../components/common/ActionDropdown";
import NotificationCard from "../../components/common/Notification"; 

export default function ListUser() {
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ open: false });


  const handleAddUser = () => {
    navigate("/users/add-user");
  };
  // Dummy User Data
  const dummyUsers = [
    {
      id: 1,
      full_name: "John Doe",
      email: "john@example.com",
      role: "Maker",
      status: "Active",
      created_at: "2024-11-12",
    },
    {
      id: 2,
      full_name: "Sarah Smith",
      email: "sarah@example.com",
      role: "Checker",
      status: "Inactive",
      created_at: "2024-10-08",
    },
    {
      id: 3,
      full_name: "Michael Johnson",
      email: "michael@example.com",
      role: "Checker",
      status: "Active",
      created_at: "2024-09-04",
    },
    {
      id: 4,
      full_name: "John Doe",
      email: "john@example.com",
      role: "Maker",
      status: "Active",
      created_at: "2024-11-12",
    },
    {
      id: 5,
      full_name: "Sarah Smith",
      email: "sarah@example.com",
      role: "Checker",
      status: "Inactive",
      created_at: "2024-10-08",
    },
    {
      id: 6,
      full_name: "Michael Johnson",
      email: "michael@example.com",
      role: "Checker",
      status: "Active",
      created_at: "2024-09-04",
    },
    {
      id: 7,
      full_name: "John Doe",
      email: "john@example.com",
      role: "Maker",
      status: "Active",
      created_at: "2024-11-12",
    },
    {
      id: 8,
      full_name: "Sarah Smith",
      email: "sarah@example.com",
      role: "Checker",
      status: "Inactive",
      created_at: "2024-10-08",
    },
    {
      id: 9,
      full_name: "Michael Johnson",
      email: "michael@example.com",
      role: "Checker",
      status: "Active",
      created_at: "2024-09-04",
    },
    {
      id: 10,
      full_name: "John Doe",
      email: "john@example.com",
      role: "Maker",
      status: "Active",
      created_at: "2024-11-12",
    },
    {
      id: 11,
      full_name: "Sarah Smith",
      email: "sarah@example.com",
      role: "Checker",
      status: "Inactive",
      created_at: "2024-10-08",
    },
    {
      id: 12,
      full_name: "Michael Johnson",
      email: "michael@example.com",
      role: "Checker",
      status: "Active",
      created_at: "2024-09-04",
    },
  ];

  const columns = [
    { label: "Name", key: "full_name" },
    { label: "Role", key: "role" },
    { label: "Email", key: "email" },
    { label: "Status", key: "status" },
    { label: "Created At", key: "created_at" },
    { label: "Actions", key: "actions" },
  ];

  const rowsWithActions = dummyUsers.map((user) => ({
    ...user,
    actions: (
  <div className="flex justify-center w-full">
    <ActionDropdown
      options={[
        { label: "View User Details", onClick: () => navigate(`/users/details/${user.id}`) },
        { label: "Edit User Details", onClick: () => navigate(`/users/details/${user.id}`, { state: { edit: true }}) },
        { label: "Delete User", onClick: () => setConfirmModal({
            open: true,
            actionType: "delete",
            title: "Are you sure you want to delete this account?",
            message: "You are about to delete this user account. Once deleted, the user will lose all system access. Do you wish to continue?",
          })
        },
        { label: "Deactivate User", onClick: () => setConfirmModal({
            open: true,
            actionType: "deactivate",
            title: user.status === "Active" 
              ? "Are you sure you want to deactivate this user account?" 
              : "Activate Account",
            message: user.status === "Active"
              ? "You are about to deactivate this user account. The user will be unable to log in or perform any actions until reactivated. Do you wish to continue?"
              : "You are about to activate this user account. Do you wish to continue?",
          })
        },
        { label: "Reset Password", onClick: () => setConfirmModal({
            open: true,
            actionType: "resetPassword",
            title: "Are you sure you want to send a password reset link?",
            message: "You want to send a password reset link to this user’s email.",
          })
        },
      ]}
    />
  </div>
)

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
          subtitle="Review and manage customer accounts"
          sortableKeys={["email", "status"]}
           showRightSection={false}
        />
      </div>
       <NotificationCard 
        confirmModal={confirmModal}
        onConfirm={() => {
          setConfirmModal({ open: false });
        }}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </>
  );
}
