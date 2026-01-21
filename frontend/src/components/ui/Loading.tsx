import React from 'react';
import { Spin } from 'antd';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
    size?: 'small' | 'default' | 'large';
    fullScreen?: boolean;
    tip?: string;
}

export default function Loading({ size = 'default', fullScreen = false, tip }: LoadingProps) {
    const sizeMap = {
        small: 'w-6 h-6',
        default: 'w-10 h-10',
        large: 'w-16 h-16',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeMap[size]} animate-spin text-blue-600`} />
            {tip && <p className="text-sm text-gray-600">{tip}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
}

// Loading Skeleton Component
export function LoadingSkeleton({
    rows = 3,
    className = ''
}: {
    rows?: number;
    className?: string
}) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
