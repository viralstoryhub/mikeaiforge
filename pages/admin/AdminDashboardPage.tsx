import React, { useEffect, useState, useMemo } from 'react';
import * as authService from '../../services/authService';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import StatCard from '../../components/admin/StatCard';
import { UTILITIES_DATA } from '../../constants';
import UserSignupChart from '../../components/admin/UserSignupChart';

const AdminDashboardPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const { tools, workflows, loading: loadingContent } = useData();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const fetchedUsers = await authService.getAllUsers();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);
    
    const proUsers = users.filter(u => u.subscriptionTier === 'Pro').length;
    const freeUsers = users.length - proUsers;
    const proPercentage = users.length > 0 ? (proUsers / users.length) * 100 : 0;

    const totalUtilityUsage = users.reduce((total, user) => {
        if (!user.utilityUsage) return total;
        // Fix: Explicitly type reduce accumulators and values as numbers to prevent 'unknown' type errors.
        return total + Object.values(user.utilityUsage).reduce((sum: number, count: number) => sum + count, 0);
    }, 0);

    const utilityUsageCounts = useMemo(() => {
      return UTILITIES_DATA.map(utility => {
        const count = users.reduce((total, user) => {
            return total + (user.utilityUsage?.[utility.slug] || 0);
        }, 0);
        return { name: utility.name, count };
      }).sort((a, b) => b.count - a.count);
    }, [users]);
    
    const maxUsage = useMemo(() => Math.max(...utilityUsageCounts.map(u => u.count), 0), [utilityUsageCounts]);

    if (loadingUsers || loadingContent) {
        return <div>Loading dashboard data...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <StatCard title="Total Users" value={users.length} />
                <StatCard title="Pro Subscribers" value={proUsers} />
                <StatCard title="Total Tools" value={tools.length} />
                <StatCard title="Total Workflows" value={workflows.length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Signups Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Recent Signups</h2>
                    <div className="h-64">
                        <UserSignupChart users={users} />
                    </div>
                </div>

                {/* Subscription Tiers */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Subscription Tiers</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Pro Subscribers</span>
                            <span className="font-bold">{proUsers}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Free Users</span>
                            <span className="font-bold">{freeUsers}</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-4 overflow-hidden">
                        <div 
                            className="bg-green-500 h-4 rounded-full" 
                            style={{ width: `${proPercentage}%` }}
                            title={`Pro Users: ${proPercentage.toFixed(1)}%`}
                        ></div>
                    </div>
                </div>
            </div>
            
             <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Utility Usage</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Total uses across all users: <strong>{totalUtilityUsage}</strong></p>
                <div className="space-y-3">
                    {utilityUsageCounts.map(utility => (
                         <div key={utility.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="truncate max-w-[70%]">{utility.name}</span>
                                <span className="font-medium">{utility.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                    className="bg-brand-secondary h-2.5 rounded-full" 
                                    style={{ width: maxUsage > 0 ? `${(utility.count / maxUsage) * 100}%` : '0%' }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;