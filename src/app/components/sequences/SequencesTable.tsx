// Library imports
import { useState } from 'react';

// Helper functions imports
import { sequenceType } from '@/lib/helperFunctions';

// Styles imports
import styles from './tableStyles.module.scss';

// Types imports
import { SequenceFromDB } from '@/types/sequenceTypes';

// Components
import MessagesTable from './MessagesTable';

const SequencesTable = ({
	sequence,
	nested,
}: {
	sequence: SequenceFromDB;
	nested?: boolean;
}) => {
	const [selected, setSelected] = useState<boolean>(false);

	const handleClick = () => {
		setSelected(!selected);
	};

	const sequenceCompletionDate = new Date(sequence.endDate!);
	const sequenceStartDate = new Date(sequence.createdAt);
	const sequenceDuration = Math.ceil(
		(sequenceCompletionDate.getTime() - sequenceStartDate.getTime()) /
			(1000 * 60 * 60 * 24)
	);

	return (
		<table className={styles.table}>
			<thead className={styles.tableHeader}>
				<tr className={nested ? styles.nested : ''}>
					<th className={styles.lrg}>
						<span className={styles.sort}>Name</span>
					</th>
					<th className={styles.md}>
						<span className={styles.sort}>Sequence Type</span>
					</th>
					<th className={styles.sm}>Duration (Days)</th>
					<th className={styles.sm}>Messages Sent</th>
					<th className={styles.sm}>Completion Date</th>
					<th className={styles.sm}>Replied</th>
				</tr>
			</thead>
			<tbody>
				<tr
					onClick={() => handleClick()}
					className={`${nested ? styles.nested : ''} ${
						selected ? styles.selected : ''
					}`}
				>
					<td className={styles.lrg} style={{ fontWeight: '600' }}>
						{sequence.title}
					</td>
					<td className={`${styles.md} ${styles.right}`}>
						{sequenceType(sequence.sequenceType, new Date(sequence.createdAt))}
					</td>
					<td className={`${styles.sm} ${styles.right}`}>{sequenceDuration}</td>
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
				{selected && (
					<tr
						className={`${nested ? styles.nested : ''} ${
							styles['expanded-row']
						}`}
					>
						<td colSpan={6}>
							<MessagesTable
								messages={sequence.messages}
								nested={nested ? !nested : true}
							/>
						</td>
					</tr>
				)}
			</tbody>
		</table>
	);
};

export default SequencesTable;
