'use client';

import styles from './modal.module.scss';

// Components imports
import CloseButton from '../buttons/CloseButton';

// Context ipmorts
import { useAppContext } from '@/app/context/AppContext';

// Modals
import AuthModal from './modalTypes/auth/AuthModal';
import RegisterModal from './modalTypes/auth/register/RegisterModal';
import LoginModal from './modalTypes/auth/login/LoginModal';

const Modal = () => {
	const { modalType, setModalType, setIsModalOpen } = useAppContext();

	const handleClose = () => {
		setIsModalOpen(false);
		setModalType(modalType === 'login' ? 'auth' : '');
	};

	// Early return if no modal type (shouldn't happen when modal is open)
	if (!modalType) {
		return null;
	}

	interface ModalContent {
		[key: string]: {
			component: React.ReactNode;
			title: string;
		};
	}

	const modalContent: ModalContent = {
		auth: {
			component: <AuthModal />,
			title: 'Welcome! Please log in to access your protected content.',
		},
		register: {
			component: <RegisterModal />,
			title: 'Registration is closed at this time.',
		},
		login: {
			component: <LoginModal />,
			title: 'Sign In',
		},
	} as const;

	return (
		<>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				<div className={styles.modalHeader}>
					<h2>{modalContent[modalType].title}</h2>
				</div>
				<div className={styles.modalBody}>
					{modalContent[modalType].component}
				</div>
			</div>
			{modalType !== 'auth' && modalType !== 'register' && (
				<CloseButton onClick={handleClose} />
			)}
		</>
	);
};

export default Modal;
