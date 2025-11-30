'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { UserWithRoles } from '@/types/models';
import AdminGuard from '@/components/AdminGuard';
import { Shield, Mail, User, Trash2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getUsersWithRoles();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This will also delete all their domains.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      await adminApi.deleteUser(userId);
      // Reload users list
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-900/30 border-red-700 text-red-200';
      case 'Member':
        return 'bg-blue-900/30 border-blue-700 text-blue-200';
      default:
        return 'bg-gray-900/30 border-gray-700 text-gray-200';
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-amber-600" />
              <h1 className="text-4xl font-bold text-amber-100">Admin Panel</h1>
            </div>
            <p className="text-amber-200/60">Manage user accounts and permissions</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Users List */}
          <div className="bg-zinc-900 border-2 border-amber-700/50 rounded-lg overflow-hidden">
            <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
              <h2 className="text-2xl font-bold text-amber-100">Users ({users.length})</h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center text-amber-100 py-12">
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="text-center text-amber-200/60 py-12">
                  No users found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-amber-700/30">
                        <th className="text-left py-3 px-4 text-amber-100 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-amber-100 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 text-amber-100 font-semibold">Roles</th>
                        <th className="text-center py-3 px-4 text-amber-100 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-amber-700/20 hover:bg-zinc-800/50 transition-colors"
                        >
                          {/* Name */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-amber-600" />
                              <span className="text-amber-100 font-medium">{user.name}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-amber-600" />
                              <span className="text-amber-200/80">{user.email}</span>
                            </div>
                          </td>

                          {/* Roles */}
                          <td className="py-4 px-4">
                            <div className="flex gap-2 flex-wrap">
                              {user.roles.map((role) => (
                                <span
                                  key={role}
                                  className={`px-3 py-1 rounded border-2 text-sm font-semibold ${getRoleBadgeColor(
                                    role
                                  )}`}
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                disabled={deletingUserId === user.id}
                                className="flex items-center gap-1 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded border-2 border-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                  {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="mt-6 bg-zinc-900 border-2 border-amber-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-amber-100 mb-3">Security Information</h3>
            <ul className="space-y-2 text-amber-200/80">
              <li>• All admin operations are protected by server-side authorization</li>
              <li>• Deleting a user will also delete all their associated domains</li>
              <li>• Only users with Admin role can access this page</li>
              <li>• Role changes are currently not implemented (future feature)</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
