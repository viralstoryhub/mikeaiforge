import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import * as authService from '../../services/authService';
import { UTILITIES_DATA } from '../../constants';

// A simple, self-contained bar chart component
const BarChart: React.FC<{ data: { label: string; value: number }[]; title: string }> = ({ data, title }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-full">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-2">
                {data.length > 0 ? data.map(({ label, value }) => (
                    <div key={label}>
                        <div className="flex justify-between items-center text-sm">
                            <span className="truncate pr-2">{label}</span>
                            <span className="font-bold">{value}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div
                                className="bg-brand-secondary h-2 rounded-full"
                                style={{ width: `${(value / maxValue) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data to display.</p>
                )}
            </div>
        </div>
    );
};

const AdminAnalyticsPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const { tools, loading: loadingContent } = useData();

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

    const toolPopularity = useMemo(() => {
        const counts: { [toolId: string]: number } = {};
        users.forEach(user => {
            user.savedTools?.forEach(toolId => {
                counts[toolId] = (counts[toolId] || 0) + 1;
            });
        });

        return tools
            .map(tool => ({
                label: tool.name,
                value: counts[tool.id] || 0,
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10
    }, [users, tools]);

    const utilityUsage = useMemo(() => {
        const counts: { [slug: string]: number } = {};
        users.forEach(user => {
            if (user.utilityUsage) {
                Object.entries(user.utilityUsage).forEach(([slug, count]) => {
                    // Fix: Cast count to number to resolve TS error.
                    counts[slug] = (counts[slug] || 0) + (count as number);
                });
            }
        });

        return UTILITIES_DATA
            .map(utility => ({
                label: utility.name,
                value: counts[utility.slug] || 0,
            }))
             .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 10); // Top 10
    }, [users]);
    
    const topUsers = useMemo(() => {
        return users
            .map(user => {
                // Fix: Explicitly type reduce parameters to resolve TS error.
                const totalUsage = user.utilityUsage ? Object.values(user.utilityUsage).reduce((sum: number, count: number) => sum + count, 0) : 0;
                return { ...user, totalUsage };
            })
            .sort((a, b) => b.totalUsage - a.totalUsage)
            .slice(0, 5); // Top 5
    }, [users]);

    if (loadingUsers || loadingContent) {
        return <div className="text-center p-8">Loading analytics data...</div>;
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart data={toolPopularity} title="Most Saved Tools" />
                <BarChart data={utilityUsage} title="Most Used Utilities" />
            </div>

            <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Top Users by Utility Usage</h3>
                 {topUsers.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {topUsers.map(user => (
                            <li key={user.id} className="py-3 flex justify-between items-center">
                                <div className="flex items-center">
                                    <img className="h-10 w-10 rounded-full" src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt="" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-brand-secondary">{user.totalUsage} uses</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No utility usage data available yet.</p>
                 )}
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;