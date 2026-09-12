import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import { auditLogService } from '../../../services/audit/auditLogService';
import { ADMIN_ROLE_CONFIGS } from '../../../utils/adminPermissions';
import { UserProfile, UserRole } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import {
  Users,
  ShieldCheck,
  Search,
  UserCog,
  Shield,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const AdminStaffView: React.FC = () => {
  const { currentUser, userRole, isSuperAdmin, getAllUsers, setUserRole } = useAuth();
  const { showToast } = useApp();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (err) {
      console.warn('Failed to load user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    if (!isSuperAdmin) {
      showToast({
        type: 'error',
        title: 'Huna Mamlaka',
        message: 'Msimamizi Mkuu (Super Admin) pekee ndiye anayeweza kubadilisha majukumu ya watumiaji.'
      });
      return;
    }

    if (targetUser.id === currentUser?.uid) {
      showToast({
        type: 'error',
        title: 'Huwezi Kujibadilisha',
        message: 'Huwezi kubadilisha jukumu lako mwenyewe la Msimamizi Mkuu.'
      });
      return;
    }

    setUpdatingId(targetUser.id);
    try {
      await setUserRole(targetUser.id, newRole);

      if (currentUser) {
        await auditLogService.logAdminAction({
          action: 'user_role_updated',
          actorId: currentUser.uid,
          actorEmail: currentUser.email || '',
          actorName: currentUser.displayName || '',
          actorRole: userRole,
          targetType: 'user_role',
          targetId: targetUser.id,
          targetTitle: targetUser.fullName || targetUser.email,
          details: { previousRole: targetUser.role, newRole }
        });
      }

      showToast({
        type: 'success',
        title: 'Jukumu Limesasishwa',
        message: `${targetUser.fullName || targetUser.email} sasa ni ${newRole}.`
      });

      setUsers(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch {
      showToast({
        type: 'error',
        title: 'Hitilafu',
        message: 'Imeshindwa kusasisha jukumu la mtumiaji.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchTerm.trim().toLowerCase();
    return (
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Usimamizi wa Wafanyakazi na Majukumu (RBAC)
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500 text-white uppercase tracking-wider">
              Super Admin Pekee
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Wape watumiaji na wafanyakazi majukumu na mamlaka ya kiutendaji kulingana na nafasi zao dukani.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tafuta mfanyakazi au mtumiaji..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Inapakia orodha ya watumiaji...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold">Hakuna mtumiaji anayelingana na utafutaji wako</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Taarifa za Mtumiaji</th>
                  <th className="p-4">Namba ya Simu</th>
                  <th className="p-4">Tarehe ya Usajili</th>
                  <th className="p-4">Mamlaka / Jukumu</th>
                  <th className="p-4 text-right">Badilisha Jukumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(user => {
                  const roleConfig = ADMIN_ROLE_CONFIGS[user.role] || ADMIN_ROLE_CONFIGS.customer;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-slate-700">
                            {user.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {user.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                        {user.phone || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roleConfig.badgeClass}`}>
                          {roleConfig.labelSw || roleConfig.labelEn}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={user.role}
                          disabled={!isSuperAdmin || user.id === currentUser?.uid || updatingId === user.id}
                          onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                          className="px-2.5 py-1 rounded-lg border text-xs font-semibold focus:outline-none cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                        >
                          <option value="customer">Mteja wa Kawaida</option>
                          <option value="staff">Mfanyakazi wa Duka (Staff)</option>
                          <option value="admin">Msimamizi (Admin)</option>
                          <option value="super_admin">Msimamizi Mkuu (Super Admin)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
