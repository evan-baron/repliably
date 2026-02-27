// Library imports
import React from 'react';
import { useRouter } from 'next/navigation';

// Services imports

// Hooks imports

// Styles imports
import styles from './needsAttention.module.scss';

// Icons imports
import { WarningRounded } from '@mui/icons-material';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

// Components imports

// Context imports

const NeedsAttention = ({
	invalidContacts,
}: {
	invalidContacts: ContactFromDB[];
}) => {
	const router = useRouter();
	return (
		<section
			className={styles.needsAttention}
			aria-labelledby='needs-attention-title'
		>
			<h2 className={styles.sectionTitle} id='needs-attention-title'>
				<WarningRounded className={styles.icon} /> Items Needing Immediate
				Attention
			</h2>
			{/* Table of items needing attention */}
			<table className={styles.attentionTable}>
				<thead className={styles.tableHeader}>
					<tr className={styles.headerRow}>
						<th className={styles.md}>Contact</th>
						<th className={styles.lrg}>Action Items</th>
					</tr>
				</thead>
				<tbody className={styles.tableBody}>
					{invalidContacts.map((contact) => (
						<tr
							key={contact.id}
							className={styles.bodyRow}
							onClick={() => router.push(`/dashboard/contacts/${contact.id}`)}
							role='link'
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									router.push(`/dashboard/contacts/${contact.id}`);
								}
							}}
						>
							<td className={`${styles.link} ${styles.md}`}>
								{contact.firstName ? contact.firstName : 'Missing Name'}
							</td>
							<td>
								{[
									!contact.validEmail &&
										'Email undeliverable: update/change needed',
									contact.firstName === null &&
										'Missing necessary contact info',
								]
									.filter(Boolean)
									.join(', ')}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
};

export default NeedsAttention;
