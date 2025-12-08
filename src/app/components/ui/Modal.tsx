'use client';

import { useEffect } from 'react';
import styles from './modal.module.scss';

// Components Import
import CloseButton from '../auth/buttons/CloseButton';

interface ModalProps {
	isOpen?: boolean;
	onClose?: () => void;
	title?: string;
	children?: React.ReactNode;
}

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
}: ModalProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (onClose && e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h2>{title}</h2>
				</div>
				<div className={styles.modalBody}>{children}</div>
			</div>
			<CloseButton onClick={onClose!} />
		</>
	);
}
