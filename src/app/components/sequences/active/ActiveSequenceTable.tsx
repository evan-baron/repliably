// Library imports
import React from 'react';

// Hooks imports

// Styles imports
import styles from './activeSequenceTable.module.scss';

// Types imports
import { SequenceFromDB } from '@/types/sequenceTypes';

// Components imports

// Context imports

const ActiveSequenceTable = ({ sequence }: { sequence: SequenceFromDB }) => {
	const startDate = new Date(sequence.createdAt).toLocaleDateString();
	const endDate = sequence.endDate
		? new Date(sequence.endDate).toLocaleDateString()
		: null;

	return (
		<div className={styles['active-sequence-table']}>
			<div className={styles['header-details']}>
				<div className={styles.title}>
					<span className={styles.label}>Name:</span>
					<span className={styles.value}>{sequence.title}</span>
				</div>
				<div className={styles['sequence-info']}>
					<div className={styles['info-row']}>
						<span className={styles.label}>Start Date:</span>
						<span className={styles.value}>{startDate}</span>
					</div>

					{endDate && (
						<div className={styles['info-row']}>
							<span className={styles.label}>End Date:</span>
							<span className={styles.value}>{endDate}</span>
						</div>
					)}
					<div>Deactivate Sequence Button</div>
				</div>
			</div>

			<div className={styles['sequence-details']}>
				<div className={styles['sequence-tasks']}>Tasks</div>
			</div>
		</div>
	);
};

export default ActiveSequenceTable;
