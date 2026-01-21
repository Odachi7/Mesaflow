import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends AntButtonProps {
    isLoading?: boolean;
}

export default function Button({
    children,
    isLoading,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <AntButton
            {...props}
            disabled={disabled || isLoading}
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : props.icon}
        >
            {children}
        </AntButton>
    );
}
