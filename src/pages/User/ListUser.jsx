import Table from "../../components/common/Table"; 
import add from "../../assets/user/add_person.svg";

export default function ListUser() {

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
      role: "Admin",
      status: "Active",
      created_at: "2024-09-04",
    },
  ];

  const columns = [
    { label: "Name", key: "full_name" },
    { label: "Email", key: "email" },
    { label: "Role", key: "role" },
    { label: "Status", key: "status" },
    { label: "Created At", key: "created_at" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-white text-2xl font-semibold">Users</h1>
        <button className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-blue-600 h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
          <img src={add} alt="add" className="w-5 h-5" />
          Add User
        </button>
      </div>

      <p className="text-gray-400 mb-6">Manage system users and roles</p>

      <div className="mt-8">
        <Table 
            columns={columns} 
            data={dummyUsers}   
            title="Users List"
          subtitle="Review and manage customer accounts"
          />
      </div>
    </>
  );
}
