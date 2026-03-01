// Library imports
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Styles imports
import styles from './needsAttention.module.scss';

// Icons imports
import {
	WarningRounded,
	ErrorOutline,
	PersonOff,
	ChevronRight,
} from '@mui/icons-material';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

const MAX_VISIBLE = 4;

const NeedsAttention = ({
	invalidContacts,
}: {
	invalidContacts: ContactFromDB[];
}) => {
	const router = useRouter();
	const [showAll, setShowAll] = useState(false);

	const visibleContacts =
		showAll ? invalidContacts : invalidContacts.slice(0, MAX_VISIBLE);
	const hasMore = invalidContacts.length > MAX_VISIBLE;

	const getAccentClass = (contact: ContactFromDB) => {
		const invalidEmail = contact.validEmail === false;
		const missingName = contact.firstName === null;
		if (invalidEmail && missingName) return styles.accentBoth;
		if (invalidEmail) return styles.accentDanger;
		return styles.accentWarning;
	};

	const getInitial = (contact: ContactFromDB) => {
		if (contact.firstName) return contact.firstName.charAt(0).toUpperCase();
		if (contact.lastName) return contact.lastName.charAt(0).toUpperCase();
		return null;
	};

	return (
		<section
			className={styles.needsAttention}
			aria-labelledby='needs-attention-title'
		>
			<div className={styles.sectionHeader}>
				<h2 className={styles.sectionTitle} id='needs-attention-title'>
					<WarningRounded className={styles.titleIcon} /> Items Needing
					Immediate Attention
				</h2>
				<span className={styles.countBadge}>{invalidContacts.length}</span>
			</div>

			<div className={styles.cardList}>
				{visibleContacts.map((contact) => (
					<div
						className={`${styles['alertCard-container']} ${getAccentClass(contact)}`}
						key={contact.id}
						tabIndex={0}
					>
						<div
							className={styles.alertCard}
							onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}
							role='link'
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									router.push(`/dashboard/contacts/${contact.id}`);
								}
							}}
						>
							<div className={styles.avatar}>
								{getInitial(contact) ?
									<span>{getInitial(contact)}</span>
								:	<PersonOff className={styles.avatarIcon} />}
							</div>

							<div className={styles.contactInfo}>
								<span className={styles.contactName}>
									{contact.firstName ?
										`${contact.firstName}${contact.lastName ? ` ${contact.lastName}` : ''}`
									:	'Unknown Contact'}
								</span>
								<span className={styles.contactEmail}>{contact.email}</span>
							</div>

							<div className={styles.issueChips}>
								{contact.validEmail === false && (
									<span className={`${styles.chip} ${styles.chipDanger}`}>
										<ErrorOutline className={styles.chipIcon} />
										Invalid Email
									</span>
								)}
								{contact.firstName === null && (
									<span className={`${styles.chip} ${styles.chipWarning}`}>
										<PersonOff className={styles.chipIcon} />
										Missing Name
									</span>
								)}
							</div>

							<ChevronRight className={styles.chevron} />
						</div>
					</div>
				))}
			</div>

			{hasMore && (
				<button
					className={styles.viewAllLink}
					onClick={() => setShowAll((prev) => !prev)}
				>
					{showAll ? 'Show less' : `View all ${invalidContacts.length} issues`}
				</button>
			)}
		</section>
	);
};

export default NeedsAttention;
