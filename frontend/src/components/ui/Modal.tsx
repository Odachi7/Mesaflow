import React from 'react';
import { Modal as AntModal, ModalProps } from 'antd';

interface CustomModalProps extends ModalProps {
    children: React.ReactNode;
}

export default function Modal({ children, ...props }: CustomModalProps) {
    return (
        <AntModal
            {...props}
            okText={props.okText || 'Confirmar'}
            cancelText={props.cancelText || 'Cancelar'}
            centered
        >
            {children}
        </AntModal>
    );
}
