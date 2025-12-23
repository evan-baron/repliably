// Library imports
import React from 'react';

// Hooks imports

// Styles imports
import styles from './registerModal.module.scss';

// Icon imports

// Components imports
import BackButton from '../../../buttons/BackButton';

// Context imports

const RegisterModal = () => {
	return (
		<div className={styles.registerModal}>
			<BackButton modalRedirect='auth' title='Back' />
		</div>
	);
};

export default RegisterModal;
