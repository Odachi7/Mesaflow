'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    ShoppingBag,
    Grid,
    Package,
    Users,
    BarChart3,
    Settings,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from 'antd';

const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { key: 'orders', label: 'Pedidos', icon: ShoppingBag, path: '/orders' },
    { key: 'tables', label: 'Mesas', icon: Grid, path: '/tables' },
    { key: 'products', label: 'Produtos', icon: Package, path: '/products' },
    { key: 'customers', label: 'Clientes', icon: Users, path: '/customers' },
    { key: 'reports', label: 'Relatórios', icon: BarChart3, path: '/reports' },
    { key: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <div className="h-screen w-64 bg-slate-800 text-white flex flex-col fixed left-0 top-0">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-black text-white">M</span>
                    </div>
                    <span className="text-xl font-bold">MesaFlow</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');

                        return (
                            <Link
                                key={item.key}
                                href={item.path}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                    }
                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-700">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <Avatar size={36} className="bg-blue-500">
                        {user?.fullName?.[0] || 'U'}
                    </Avatar>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-white truncate">
                            {user?.fullName || 'User'}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                            {user?.role || 'Role'}
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
            </div>
        </div>
    );
}
