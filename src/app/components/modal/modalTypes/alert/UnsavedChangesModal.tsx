// Library imports
import React from 'react';

// Hooks imports

// Styles imports
import styles from './alertModal.module.scss';

// Components imports

// Context imports

const UnsavedChangesModal = ({
	message,
	clearAlert,
}: {
	message: string;
	clearAlert: () => void;
}) => {
	return (
		<div className={styles['alert-modal']}>
			<span className={styles.message}>{message}</span>
			<button
				type='button'
				className='button delete'
				style={{ width: '8rem' }}
				onClick={clearAlert}
			>
				OK
			</button>
		</div>
	);
};

export default UnsavedChangesModal;
