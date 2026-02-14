'use client';

// Library imports
import { useState } from 'react';

// Styles
import styles from './sequencesClient.module.scss';

// Hooks imports
import { useAllSequencesByUserId } from '@/hooks/useSequence';

// Types imports
import { SequenceFromDB } from '@/types/sequenceTypes';

// Components imports
import DeactivateAllSequencesButton from '@/app/components/buttons/DeactivateAllSequencesButton';
import PreviousSequences from '@/app/components/sequences/PreviousSequences';
import ActiveSequences from '@/app/components/sequences/ActiveSequences';

const SequencesClient = ({
	initialSequences,
}: {
	initialSequences: SequenceFromDB[];
}) => {
	type SelectedType = 'active' | 'previous';
	const [selected, setSelected] = useState<SelectedType>('active');

	interface SequenceContent {
		[key: string]: {
			component: React.ReactNode;
		};
	}

	const { data: sequencesData } = useAllSequencesByUserId({
		sequences: initialSequences,
	});

	const sequences = sequencesData?.sequences || [];

	const activeSequences = sequences.filter((seq) => seq.active);
	const previousSequences = sequences.filter((seq) => !seq.active);

	const sequenceContent: SequenceContent = {
		active: {
			component:
				activeSequences.length > 0 ?
					<ActiveSequences sequences={activeSequences} />
				:	<div className={styles.activity}>
						<p>No active sequences</p>
					</div>,
		},
		previous: {
			component:
				previousSequences.length > 0 ?
					<PreviousSequences sequences={previousSequences} contact={true} />
				:	<div className={styles.activity}>
						<p>No previous sequences</p>
					</div>,
		},
	};

	return (
		<div className={styles.client}>
			<DeactivateAllSequencesButton />

			<div className={styles.content}>
				<nav className={styles.nav} aria-label='Sequence tabs'>
					<button
						type='button'
						className={selected === 'active' ? styles.selected : ''}
						onClick={() => setSelected('active')}
						aria-current={selected === 'active' ? 'page' : undefined}
					>
						Active Sequences
					</button>

					<button
						type='button'
						className={selected === 'previous' ? styles.selected : ''}
						onClick={() => setSelected('previous')}
						aria-current={selected === 'previous' ? 'page' : undefined}
					>
						Previous Sequences
					</button>
				</nav>
				{sequenceContent[selected].component}
			</div>
		</div>
	);
};

export default SequencesClient;
