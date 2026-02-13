'use client';

// Library imports
import { useState } from 'react';

// Hooks imports
import { useGetUserSettings } from '@/hooks/useUserSettings';

// Styles imports
import styles from './contactPage.module.scss';

// Icon imports

// Components imports
import NewEmailForm from '@/app/components/forms/newEmail/NewEmailForm';
import ActiveSequence from '@/app/components/sequences/ActiveSequence';
import PreviousSequences from '@/app/components/sequences/PreviousSequences';
import AllActivities from '@/app/components/sequences/AllActivities';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';
import { SequencesResponse, SequenceFromDB } from '@/types/sequenceTypes';
import { MessagesWithActiveSequence } from '@/types/messageTypes';
import { SignatureFromDB } from '@/types/userTypes';

const ContactActivities = ({
	contact,
	sequences,
	allMessages,
	signatures,
	emailConnectionActive,
	gmailWatchAllowed,
}: {
	contact: ContactFromDB;
	sequences: SequencesResponse;
	allMessages: MessagesWithActiveSequence[];
	signatures: SignatureFromDB[];
	emailConnectionActive: boolean;
	gmailWatchAllowed: boolean;
}) => {
	const { setModalType, setAlertMessage } = useAppContext();

	type SelectedType = 'active' | 'previous' | 'email' | 'all';
	const [selected, setSelected] = useState<SelectedType>('active');

	const handleClick = () => {
		if (!emailConnectionActive) {
			setAlertMessage('No email');

			setModalType('alert');
		} else {
			setSelected('email');
		}
	};

	const { data: { defaults } = {} } = useGetUserSettings();

	interface ActivityContent {
		[key: string]: {
			component: React.ReactNode;
		};
	}

	const { sequences: sequenceList } = sequences;
	const messageList = allMessages;

	const activeSequence: SequenceFromDB | undefined = sequenceList.find(
		(seq) => seq.active,
	);
	const previousSequences: SequenceFromDB[] = sequenceList.filter(
		(seq) => !seq.active,
	);

	const activityContent: ActivityContent = {
		active: {
			component:
				activeSequence ?
					<ActiveSequence sequence={activeSequence} />
				:	<div className={styles.activity}>
						<p>No active sequences</p>
					</div>,
		},
		previous: {
			component:
				previousSequences.length > 0 ?
					<PreviousSequences sequences={previousSequences} />
				:	<div className={styles.activity}>
						<p>No previous sequences</p>
					</div>,
		},
		email: {
			component: (
				<NewEmailForm
					contactEmail={contact.email}
					signatures={signatures}
					defaults={defaults}
					gmailWatchAllowed={gmailWatchAllowed}
				/>
			),
		},
		all: {
			component:
				messageList.length > 0 ?
					<AllActivities messages={messageList} />
				:	<div className={styles.activity}>
						<p>No activities</p>
					</div>,
		},
	};

	return (
		<section
			className={styles['activities-wrapper']}
			aria-labelledby='activities-title'
		>
			<h2 id='activities-title' className='sr-only'>
				Contact Activities
			</h2>
			<nav className={styles.nav}>
				<ul role='tablist'>
					<li role='presentation'>
						<button
							role='tab'
							aria-selected={selected === 'active'}
							aria-controls='activity-panel'
							id='tab-active'
							className={selected === 'active' ? styles.selected : ''}
							onClick={() => setSelected('active')}
						>
							Active Sequence
						</button>
					</li>

					<li role='presentation'>
						<button
							role='tab'
							aria-selected={selected === 'previous'}
							aria-controls='activity-panel'
							id='tab-previous'
							className={selected === 'previous' ? styles.selected : ''}
							onClick={() => setSelected('previous')}
						>
							Previous Sequences
						</button>
					</li>

					<li role='presentation'>
						<button
							role='tab'
							aria-selected={selected === 'all'}
							aria-controls='activity-panel'
							id='tab-all'
							className={selected === 'all' ? styles.selected : ''}
							onClick={() => setSelected('all')}
						>
							All Activities
						</button>
					</li>

					<li role='presentation'>
						<button
							role='tab'
							aria-selected={selected === 'email'}
							aria-controls='activity-panel'
							id='tab-email'
							className={selected === 'email' ? styles.selected : ''}
							onClick={handleClick}
						>
							New Email
						</button>
					</li>
				</ul>
			</nav>
			<div
				className={styles.content}
				id='activity-panel'
				role='tabpanel'
				aria-labelledby={`tab-${selected}`}
			>
				{activityContent[selected].component}
			</div>
		</section>
	);
};

export default ContactActivities;
