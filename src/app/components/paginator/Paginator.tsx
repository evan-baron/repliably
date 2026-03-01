// Library imports
import React from 'react';

// Services imports

// Hooks imports

// Styles imports
import styles from './paginator.module.scss';

// Icon imports
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

// Components imports

// Context imports

const Paginator = ({
	currentPage,
	setCurrentPage,
	pages,
}: {
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	pages: any[];
}) => {
	return (
		<div className={styles.pagination}>
			<button
				className={styles.paginationButton}
				onClick={() => {
					if (currentPage === 0) {
						return;
					}

					setCurrentPage((prev) => prev - 1);
				}}
			>
				<KeyboardArrowLeft className={styles.icon} />
			</button>
			{pages.map((_, index) => (
				<button
					key={index}
					className={`${index === currentPage ? styles.active : ''} ${styles.paginationButton}`}
					onClick={() => setCurrentPage(index)}
				>
					{index + 1}
				</button>
			))}
			<button
				className={styles.paginationButton}
				onClick={() => {
					if (currentPage === pages.length - 1) {
						return;
					}
					setCurrentPage((prev) => prev + 1);
				}}
			>
				<KeyboardArrowRight className={styles.icon} />
			</button>
		</div>
	);
};

export default Paginator;
