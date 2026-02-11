// Styles imports
import styles from './authModal.module.scss';

// Components imports
import ModalActionButton from '@/app/components/buttons/ModalActionButton';

// Context imports

const AuthModal = () => {
	return (
		<div
			className={styles.authModal}
			role='dialog'
			aria-labelledby='auth-title'
			aria-modal='true'
		>
			<h2 id='auth-title' className='sr-only'>
				Authentication Options
			</h2>
			<ModalActionButton modalType='register' />
			<ModalActionButton modalType='login' />
		</div>
	);
};

export default AuthModal;
