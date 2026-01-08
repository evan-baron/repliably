// Library imports
import { useState } from 'react';

// Helper functions imports
import { sequenceType } from '@/lib/helperFunctions';

// Styles imports
import styles from './sequencesTable.module.scss';

// Icon imports
import { SwapVert } from '@mui/icons-material';

// Types imports
import { SequenceFromDB } from '@/types/sequenceTypes';

const SequencesTable = ({ sequences }: { sequences: SequenceFromDB[] }) => {
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	const handleSort = () => {
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	};

	const sortedSequences = [...sequences].sort((a, b) => {
		const dateA = new Date(a.endDate!).getTime();
		const dateB = new Date(b.endDate!).getTime();
		return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
	});

	return (
		<table className={styles['sequences-table']}>
			<thead>
				<tr>
					<th className={styles.lrg}>
						<span className={styles.sort}>Name</span>
					</th>
					<th className={styles.md}>
						<span className={styles.sort}>Sequence Type</span>
					</th>
					<th className={styles.sm}>Duration (Days)</th>
					<th className={styles.sm}>Messages Sent</th>
					<th className={styles.sm} onClick={() => handleSort()}>
						<span className={styles.sort}>
							Completion Date
							<SwapVert fontSize='small' />
						</span>
					</th>
					<th className={styles.sm}>Replied</th>
				</tr>
			</thead>
			<tbody>
				{sortedSequences.map((sequence) => {
					const sequenceCompletionDate = new Date(sequence.endDate!);
					const sequenceStartDate = new Date(sequence.createdAt);
					const sequenceDuration = Math.ceil(
						(sequenceCompletionDate.getTime() - sequenceStartDate.getTime()) /
							(1000 * 60 * 60 * 24)
					);

					return (
						<tr key={sequence.id}>
							<td className={styles.lrg} style={{ fontWeight: '600' }}>
								{sequence.title}
							</td>
							<td className={`${styles.md} ${styles.right}`}>
								{sequenceType(
									sequence.sequenceType,
									new Date(sequence.createdAt)
								)}
							</td>
							<td className={`${styles.sm} ${styles.right}`}>
								{sequenceDuration}
							</td>
							<td className={`${styles.sm} ${styles.right}`}>
								{sequence.messages.length}
							</td>
							<td className={`${styles.sm} ${styles.right}`}>
								{sequenceCompletionDate.toLocaleDateString()}
							</td>
							<td className={`${styles.sm} ${styles.right}`}>
								{sequence.emailReplies.length > 0 ? 'Yes' : 'No'}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default SequencesTable;
