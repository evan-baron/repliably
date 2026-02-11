// Library imports
import React from 'react';

// Hooks imports

// Styles imports
import styles from './errorModal.module.scss';

// Components imports

// Context imports

const ErrorModal = ({
	errors,
	clearErrors,
}: {
	errors: string[];
	clearErrors: () => void;
}) => {
	return (
		<div
			className={styles['error-modal']}
			role='alertdialog'
			aria-labelledby='error-title'
			aria-describedby='error-list'
			aria-modal='true'
		>
			<h2 id='error-title' className='sr-only'>
				Error
			</h2>
			<ul id='error-list' className={styles.errors}>
				{errors.map((error, index) => (
					<li key={index} className={styles['error-item']}>
						{error}
					</li>
				))}
			</ul>
			<button
				type='button'
				className='button delete'
				style={{ width: '8rem' }}
				onClick={clearErrors}
				aria-label='Dismiss error message'
			>
				OK
			</button>
		</div>
	);
};

export default ErrorModal;
