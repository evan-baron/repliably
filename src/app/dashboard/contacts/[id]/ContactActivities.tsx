'use client';

// Library imports
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hooks imports

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
}: {
	contact: ContactFromDB;
	sequences: SequencesResponse;
	allMessages: MessagesWithActiveSequence[];
	signatures: SignatureFromDB[];
}) => {
	const { setModalType, setAlertMessage } = useAppContext();
	const queryClient = useQueryClient();
	const emailActive = queryClient.getQueryData(['email-connection-status']) as
		| { active: boolean }
		| undefined;

	console.log(
		'Email connection status in ContactActivities:',
		emailActive?.active,
	);

	type SelectedType = 'active' | 'previous' | 'email' | 'all';
	const [selected, setSelected] = useState<SelectedType>('active');

	const handleClick = () => {
		if (!emailActive?.active) {
			setAlertMessage('No email');

			setModalType('alert');
		} else {
			setSelected('email');
		}
	};

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
				<NewEmailForm contactEmail={contact.email} signatures={signatures} />
			),
		},
		all: {
			component: <AllActivities messages={messageList} />,
		},
	};

	return (
		<section className={styles['activities-wrapper']}>
			<div className={styles.nav}>
				<h2
					className={selected === 'active' ? styles.selected : ''}
					onClick={() => setSelected('active')}
				>
					Active Sequence
				</h2>

				<h2
					className={selected === 'previous' ? styles.selected : ''}
					onClick={() => setSelected('previous')}
				>
					Previous Sequences
				</h2>

				<h2
					className={selected === 'all' ? styles.selected : ''}
					onClick={() => setSelected('all')}
				>
					All Activities {/* Email History */}
				</h2>

				<h2
					className={selected === 'email' ? styles.selected : ''}
					onClick={handleClick}
				>
					New Email
				</h2>
			</div>
			<div className={styles.content}>
				{activityContent[selected].component}
			</div>
		</section>
	);
};

export default ContactActivities;
