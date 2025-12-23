// Styles imports
import styles from './authModal.module.scss';

// Components imports
import ActionButton from '../../buttons/ActionButton';

// Context imports

const AuthModal = () => {
	return (
		<div className={styles.authModal}>
			<ActionButton modalType='register' />
			<ActionButton modalType='login' />
		</div>
	);
};

export default AuthModal;
