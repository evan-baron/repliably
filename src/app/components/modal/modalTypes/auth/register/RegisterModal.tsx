// Library imports

// Hooks imports

// Styles imports
import styles from './registerModal.module.scss';

// Icon imports

// Components imports
import ModalBackButton from '@/app/components/buttons/ModalBackButton';

// Context imports

const RegisterModal = () => {
	return (
		<div
			className={styles.registerModal}
			role='dialog'
			aria-labelledby='register-title'
			aria-modal='true'
		>
			<h2 id='register-title' className='sr-only'>
				Create Account
			</h2>
			<ModalBackButton modalRedirect='auth' title='Back' />
		</div>
	);
};

export default RegisterModal;
