'use client';

// Library imports
import React, { useState } from 'react';

// Styles imports
import styles from './ttt.module.scss';

// MUI imports
import { KeyboardArrowUp } from '@mui/icons-material';

const TTT = ({ isMobile }: { isMobile: boolean }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className={`${styles['ttt-wrapper']} ${isMobile ? styles.mobile : ''}`}
		>
			{!isMobile && (
				<span
					className={`${styles.tooltip} ${isHovered ? styles.visible : ''}`}
					role='tooltip'
				>
					Scroll to Top
				</span>
			)}
			<button
				className={`${styles['ttt-button']} ${isMobile ? styles.mobile : ''}`}
				type='button'
				onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				aria-label='Scroll to top'
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<KeyboardArrowUp className={styles.icon} />
			</button>
		</div>
	);
};

export default TTT;
