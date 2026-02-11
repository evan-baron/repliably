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
		<div
			className={styles['alert-modal']}
			role='alertdialog'
			aria-labelledby='unsaved-changes-message'
			aria-modal='true'
		>
			<p id='unsaved-changes-message' className={styles.message}>
				{message}
			</p>
			<button
				type='button'
				className='button delete'
				style={{ width: '8rem' }}
				onClick={clearAlert}
				aria-label='Acknowledge unsaved changes'
			>
				OK
			</button>
		</div>
	);
};

export default UnsavedChangesModal;
