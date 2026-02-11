'use client';

// Libraries imports
import React, { useState, useEffect } from 'react';

// Styles imports
import styles from './loadingSpinner.module.scss';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

function LoadingSpinner({ message = 'Loading' }: { message?: string }) {
	const { loading, loadingMessage } = useAppContext();

	const [loadingText, setLoadingText] = useState('');

	useEffect(() => {
		const loadingStates = ['', '.', '..', '...'];
		let index = 0;

		const interval = setInterval(() => {
			setLoadingText(loadingStates[index]);
			index = (index + 1) % loadingStates.length; // Loop back to start
		}, 500);

		return () => clearInterval(interval); // Cleanup on unmount
	}, []);

	if (!loading) {
		return null;
	}

	return (
		<div
			className={styles.loadingcontainer}
			role='status'
			aria-live='polite'
			aria-busy='true'
		>
			<div className={styles.container}>
				<h2 className={styles.h2}>
					{loadingMessage || message}
					<span className={styles.elipses} aria-hidden='true'>
						{loadingText}
					</span>
					<span className='sr-only'>Please wait</span>
				</h2>
				<div className={styles.spinner} aria-hidden='true'>
					<div className={styles['loading-spinner']}></div>
				</div>
			</div>
		</div>
	);
}

export default LoadingSpinner;
