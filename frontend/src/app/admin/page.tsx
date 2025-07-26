"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from "./admin.module.css";
import type { User } from '@/types';

const AdminPanel = () => {
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user: currentUser } = useAuth();

  // Query for users
  const {
    data: users = [],
    isLoading,
  } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => userAPI.getAll(),
    enabled: !!currentUser,
  });

  // Mutation for updating user role
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userAPI.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError(""); // Clear any previous errors
    },
    onError: () => {
      setError("Failed to update role");
    },
  });

  // Mutation for toggling user status
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => userAPI.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError(""); // Clear any previous errors
    },
    onError: () => {
      setError("Failed to update status");
    },
  });

  const handleRoleChange = async (id: string, role: string) => {
    // Prevent changing own role
    if (id === currentUser?.id) {
      setError("You cannot change your own role");
      return;
    }

    setActionLoading(id + "-role");
    updateRoleMutation.mutate({ id, role });
    setActionLoading("");
  };

  const handleToggleStatus = async (id: string) => {
    // Prevent deactivating own account
    if (id === currentUser?.id) {
      setError("You cannot deactivate your own account");
      return;
    }

    setActionLoading(id + "-status");
    toggleStatusMutation.mutate(id);
    setActionLoading("");
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Admin Panel</h1>
          <p>Manage users and system settings</p>
        </div>

        <div className={styles.navigation}>
          <div className={styles.navGrid}>
            <div className={styles.navCard} onClick={() => router.push('/admin/developers')}>
              <h3>Developers</h3>
              <p>Manage property developers</p>
            </div>
            <div className={styles.navCard} onClick={() => router.push('/admin/compounds')}>
              <h3>Compounds</h3>
              <p>Manage property compounds</p>
            </div>
            <div className={styles.navCard} onClick={() => router.push('/admin/amenities')}>
              <h3>Amenities</h3>
              <p>Manage property amenities</p>
            </div>
            <div className={styles.navCard} onClick={() => router.push('/admin/apartments')}>
              <h3>Apartments</h3>
              <p>Manage apartments listed</p>
            </div>
           
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.section}>
          <h2>User Management</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrentUser = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className={isCurrentUser ? styles.currentUser : ''}>
                      <td>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                          {isCurrentUser && <span className={styles.currentUserBadge}>You</span>}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={actionLoading === user.id + "-role" || isCurrentUser}
                          className={`${styles.select} ${isCurrentUser ? styles.disabled : ''}`}
                          title={isCurrentUser ? "You cannot change your own role" : ""}
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`${styles.status} ${user.isActive ? styles.active : styles.inactive}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={actionLoading === user.id + "-status" || isCurrentUser}
                          className={`${styles.button} ${user.isActive ? styles.deactivate : styles.activate} ${isCurrentUser ? styles.disabled : ''}`}
                          title={isCurrentUser ? "You cannot deactivate your own account" : ""}
                        >
                          {actionLoading === user.id + "-status" ? "Updating..." : (user.isActive ? "Deactivate" : "Activate")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel; 
 