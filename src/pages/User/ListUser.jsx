import { useNavigate } from "react-router-dom";
import Table from "../../components/common/Table"; 
import add from "../../assets/user/add_person.svg";
import ActionDropdown from "../../components/common/ActionDropdown"; // adjust path

export default function ListUser() {
  const navigate = useNavigate();

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
      <ActionDropdown
        options={[
          { label: "View User Details", onClick: () => navigate(`/users/details/${user.id}`), },
          { label: "Edit User Details", onClick: () => navigate(`/users/details/${user.id}`, {state: { edit: true }}), },
          { label: "Delete User", onClick: () => alert(`Delete ${user.full_name}`) },
          { label: "Deactivate User", onClick: () => alert(`Deactivate ${user.full_name}`) },
          { label: "Reset Password", onClick: () => alert(`Reset password for ${user.full_name}`) },
        ]}
      />
    ),
  }));

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-white text-2xl font-semibold">Users</h1>
        <button    
        onClick={handleAddUser}
        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-blue-600 h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
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
        />
      </div>
    </>
  );
}
