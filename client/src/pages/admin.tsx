import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type User, type Transaction } from "@shared/schema";
import { useState } from "react";

async function fetchAdminData(url: string, options?: RequestInit) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(res.status + ": " + (await res.text()));
  }
  return res.json();
}

function UserDetailsModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { data: details, isLoading } = useQuery<{ user: User; transactions: Transaction[] }>({
    queryKey: ["/api/admin/users", user.id],
    queryFn: () => fetchAdminData(`/api/admin/users/${user.id}`),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white p-6 rounded-lg max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-4">User Details</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          details && (
            <div>
              <p><strong>Username:</strong> {details.user.username}</p>
              <p><strong>WhatsApp Number:</strong> {details.user.whatsappNumber}</p>
              <p><strong>Balance:</strong> {details.user.balance}</p>
              <h3 className="text-xl font-bold mt-4">Transaction History</h3>
              <ul className="space-y-2 mt-2">
                {details.transactions.map((tx) => (
                  <li key={tx.id} className="bg-gray-700 p-2 rounded">
                    <p><strong>Type:</strong> {tx.type}</p>
                    <p><strong>Amount:</strong> {tx.amount}</p>
                    <p><strong>Status:</strong> {tx.status}</p>
                    <p><strong>Date:</strong> {new Date(tx.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
        <button onClick={onClose} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Close
        </button>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: () => fetchAdminData("/api/admin/users"),
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<
    Transaction[]
  >({
    queryKey: ["/api/admin/transactions"],
    queryFn: () => fetchAdminData("/api/admin/transactions?status=pending"),
  });

  const approveTransaction = useMutation({
    mutationFn: (transactionId: string) =>
      fetchAdminData(`/api/admin/transactions/${transactionId}/approve`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
    },
  });

  const rejectTransaction = useMutation({
    mutationFn: (transactionId: string) =>
      fetchAdminData(`/api/admin/transactions/${transactionId}/reject`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
    },
  });

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Users</h2>
          {isLoadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <ul className="space-y-2">
              {users?.map((user) => (
                <li key={user.id} onClick={() => setSelectedUser(user)} className="cursor-pointer bg-gray-800 p-4 rounded-lg hover:bg-gray-700">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Balance:</strong> {user.balance}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Pending Transactions</h2>
          {isLoadingTransactions ? (
            <p>Loading transactions...</p>
          ) : (
            <ul className="space-y-2">
              {transactions?.map((tx) => (
                <li key={tx.id} className="bg-gray-800 p-4 rounded-lg">
                  <p><strong>User ID:</strong> {tx.userId}</p>
                  <p><strong>Type:</strong> {tx.type}</p>
                  <p><strong>Amount:</strong> {tx.amount}</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => approveTransaction.mutate(tx.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectTransaction.mutate(tx.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
