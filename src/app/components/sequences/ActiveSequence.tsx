// Helper functions imports
import { sequenceType } from '@/lib/helpers/sequenceHelpers';

// Styles imports
import styles from './activeSequence.module.scss';

// Types imports
import { SanitizedSequence } from '@/types/sequenceTypes';

// Components imports
import DeactivateSequenceButton from '@/app/components/buttons/DeactivateSequenceButton';
import ActiveSequenceTable from './ActiveSequenceTable';

const ActiveSequence = ({ sequence }: { sequence: SanitizedSequence }) => {
	const startDate = new Date(sequence.createdAt).toLocaleDateString();
	const endDate =
		sequence.endDate ? new Date(sequence.endDate).toLocaleDateString() : null;
	const nextStepDue =
		sequence.nextStepDue ?
			new Date(sequence.nextStepDue).toLocaleDateString()
		:	'N/A';

	return (
		<article
			className={styles['active-sequence-table']}
			aria-labelledby={`sequence-${sequence.id}-title`}
		>
			<header className={styles['header-details']}>
				<div className={styles['sequence-info']}>
					<h3 id={`sequence-${sequence.id}-title`} className={styles.title}>
						<span className={styles.label}>Name:</span>
						<span className={styles.value}>{sequence.title}</span>
					</h3>
					<div className={styles.title}>
						<span className={styles.label}>Sequence Type:</span>
						<span className={styles.value}>
							{sequenceType(
								sequence.sequenceType,
								new Date(sequence.createdAt),
							)}
						</span>
					</div>
					<div className={styles.title}>
						<span className={styles.label}>Next Step Due:</span>
						<span className={styles.value}>
							{nextStepDue === 'N/A' ?
								nextStepDue
							:	<time dateTime={new Date(sequence.nextStepDue!).toISOString()}>
									{nextStepDue}
								</time>
							}
						</span>
					</div>
				</div>
				<div className={styles['dates-info']}>
					<dl className={styles['info-list']}>
						<div className={styles['info-row']}>
							<dt className={styles.label}>Start Date:</dt>
							<dd className={styles.value}>
								<time dateTime={new Date(sequence.createdAt).toISOString()}>
									{startDate}
								</time>
							</dd>
						</div>

						{endDate && (
							<div className={styles['info-row']}>
								<dt className={styles.label}>End Date:</dt>
								<dd className={styles.value}>
									<time dateTime={new Date(sequence.endDate!).toISOString()}>
										{endDate}
									</time>
								</dd>
							</div>
						)}
					</dl>
					<DeactivateSequenceButton sequenceId={sequence.id} />
				</div>
			</header>

			<div className={styles['sequence-details']}>
				<ActiveSequenceTable sequence={sequence} />
			</div>
		</article>
	);
};

export default ActiveSequence;
