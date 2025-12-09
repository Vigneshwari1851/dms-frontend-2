import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/common/Table"; 
import add from "../../assets/dashboard/add.svg";
import ActionDropdown from "../../components/common/ActionDropdown";
import NotificationCard from "../../components/common/Notification"; 

export default function ReconciliationList() {
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ open: false });


  const handleAddUser = () => {
    navigate("/reconciliation/add-reconciliation");
  };
  // Dummy User Data
  const dummyUsers = [
   {
    id: 1,
    date: "2025/11/27",
    openingVault: "150,000.00",
    totalTransactions: 5,
    closingVault: "155,500.00",
    variance: "0.00",
    status: "Tallied",
  },
  {
    id: 2,
    date: "2025/11/26",
    openingVault: "120,000.00",
    totalTransactions: 3,
    closingVault: "123,105.00",
    variance: "+5.00",
    status: "Excess",
  },
  {
    id: 3,
    date: "2025/11/27",
    openingVault: "270,000.00",
    totalTransactions: 6,
    closingVault: "278,550.00",
    variance: "-50.00",
    status: "Short",
  },
  {
    id: 4,
    date: "2025/11/27",
    openingVault: "150,000.00",
    totalTransactions: 2,
    closingVault: "155,500.00",
    variance: "0.00",
    status: "Tallied",
  },
  {
    id: 5,
    date: "2025/11/27",
    openingVault: "150,000.00",
    totalTransactions: 12,
    closingVault: "155,500.00",
    variance: "0.00",
    status: "Tallied",
  },
  {
    id: 6,
    date: "2025/11/27",
    openingVault: "150,000.00",
    totalTransactions: 20,
    closingVault: "155,500.00",
    variance: "0.00",
    status: "Tallied",
  },
  {
    id: 7,
    date: "2025/11/27",
    openingVault: "150,000.00",
    totalTransactions: 4,
    closingVault: "155,500.00",
    variance: "0.00",
    status: "Tallied",
  },
  {
    id: 8,
    date: "2025/11/27",
    openingVault: "150,000.00",
    totalTransactions: 9,
    closingVault: "155,500.00",
    variance: "0.00",
    status: "Tallied",
  },
  {
    id: 9,
    date: "2025/11/27",
    openingVault: "150,000.00",
    totalTransactions: 9,
    closingVault: "155,500.00",
    variance: "+0.00",
    status: "Tallied",
  },
  {
    id: 10,
    date: "2025/11/26",
    openingVault: "120,000.00",
    totalTransactions: 9,
    closingVault: "123,105.00",
    variance: "+5.00",
    status: "Excess",
  },
  {
    id: 11,
    date: "2025/11/27",
    openingVault: "270,000.00",
    totalTransactions: 8,
    closingVault: "278,550.00",
    variance: "-50.00",
    status: "Short",
  },
  ];

  const columns = [
    { label: "Date", key: "date" },
    { label: "OpeningVault", key: "openingVault" },
    { label: "Total Transactions", key: "totalTransactions" },
    { label: "Closing Vault", key: "closingVault" },
    { label: "Difference / Variance", key: "variance" },
    { label: "Status", key: "status" },
  ];

  const rowsWithActions = dummyUsers.map((user) => ({
    ...user,
    actions: (
      <ActionDropdown
        options={[
          { label: "View User Details", onClick: () => 
            navigate(`/users/details/${user.id}`), 
          },
          { label: "Edit User Details", onClick: () => 
            navigate(`/users/details/${user.id}`, {state: { edit: true }}), 
          },
          { label: "Delete User", onClick: () =>
              setConfirmModal({
                open: true,
                actionType: "delete",
                title: "Are you sure you want to delete this account?",
                message: "You are about to delete this user account. Once deleted, the user will lose all system access. Do you wish to continue?",
              }), 
            },
          { label: "Deactivate User", onClick: () =>
              setConfirmModal({
                open: true,
                actionType: "deactivate",
                title: user.status === "Active" 
                  ? "Are you sure you want to deactivate this user account?" 
                  : "Activate Account",
                message: user.status === "Active"
                  ? "You are about to deactivate this user account. The user will be unable to log in or perform any actions until reactivated. Do you wish to continue?"
                  : "You are about to activate this user account. The user will be able to log in or perform any actions until deactivated. Do you wish to continue?",
              }),
            },
          { label: "Reset Password", onClick: () =>
              setConfirmModal({
                open: true,
                actionType: "resetPassword",
                title: "Are you sure you want to send a password reset link?",
                message: "You want to send a password reset link to this user’s registered email address? The user will be able to create a new password from their email.",
              }),
            },
        ]}
      />
    ),
  }));

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-white text-2xl font-semibold">Reconciliation</h1>
        <button    
        onClick={handleAddUser}
        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
          <img src={add} alt="add" className="w-5 h-5" />
         Create Reconciliation
        </button>
      </div>

      <p className="text-gray-400 mb-6">Manually data entry for daily vault reconciliation</p>

      <div className="mt-8">
        <Table 
          columns={columns} 
          data={rowsWithActions}   
          title="Reconciliation List"
          showRightSection={true}
          
          
        //   subtitle=""
        //   sortableKeys={["email", "status"]}
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
