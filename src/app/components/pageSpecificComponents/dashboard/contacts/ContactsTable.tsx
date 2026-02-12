'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './contactsTable.module.scss';

// MUI imports
import { SwapVert } from '@mui/icons-material';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

const ContactsTable = ({
	inModal,
	contacts,
	onRowClick,
	columns,
}: {
	inModal?: boolean;
	contacts: ContactFromDB[];
	onRowClick?: (contactId: number) => void;
	columns: {
		active?: boolean;
		reasonForEmail: boolean;
		importance: boolean;
		lastActivity: boolean;
		verified?: boolean;
		linkedIn: boolean;
		phone: boolean;
		replied: boolean;
	};
}) => {
	const { setSelectedContact } = useAppContext();
	type SortableContactColumn =
		| 'active'
		| 'firstName'
		| 'lastName'
		| 'company'
		| 'importance'
		| 'replied'
		| 'lastActivity';

	const [sortBy, setSortBy] = useState<SortableContactColumn | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

	const handleSort = (column: SortableContactColumn) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(column);
			setSortOrder('asc');
		}
	};

	const handleClick = (contact: ContactFromDB) => {
		setSelectedContact(contact);
		if (onRowClick) onRowClick(contact.id);
	};

	const sortedContacts = [...contacts].sort((a, b) => {
		if (!sortBy) return 0;
		const valA = (a[sortBy] || '').toString().toLowerCase();
		const valB = (b[sortBy] || '').toString().toLowerCase();
		if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
		if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
		return 0;
	});

	if (!contacts.length)
		return (
			<div className={styles.activity}>
				<p>No contacts found</p>
			</div>
		);

	return (
		<table
			className={`${styles['contacts-table']} ${inModal ? styles.inModal : ''}`}
			role='table'
			aria-label='Contacts table'
			aria-rowcount={sortedContacts.length + 1}
		>
			<thead>
				<tr role='row'>
					{columns.active && (
						<th
							className={styles.sm}
							onClick={() => handleSort('active')}
							role='columnheader'
							aria-sort={
								sortBy === 'active' ?
									sortOrder === 'asc' ?
										'ascending'
									:	'descending'
								:	'none'
							}
							scope='col'
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleSort('active');
								}
							}}
						>
							<button
								type='button'
								className={styles.sort}
								aria-label='Sort by active status'
							>
								<span>Active</span>
								<SwapVert
									fontSize='small'
									aria-hidden='true'
									focusable='false'
								/>
							</button>
						</th>
					)}
					<th
						className={styles.sm}
						onClick={() => handleSort('firstName')}
						role='columnheader'
						aria-sort={
							sortBy === 'firstName' ?
								sortOrder === 'asc' ?
									'ascending'
								:	'descending'
							:	'none'
						}
						scope='col'
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleSort('firstName');
							}
						}}
					>
						<button
							type='button'
							className={styles.sort}
							aria-label='Sort by first name'
						>
							<span>First</span>
							<SwapVert fontSize='small' aria-hidden='true' focusable='false' />
						</button>
					</th>
					<th
						className={styles.sm}
						onClick={() => handleSort('lastName')}
						role='columnheader'
						aria-sort={
							sortBy === 'lastName' ?
								sortOrder === 'asc' ?
									'ascending'
								:	'descending'
							:	'none'
						}
						scope='col'
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleSort('lastName');
							}
						}}
					>
						<button
							type='button'
							className={styles.sort}
							aria-label='Sort by last name'
						>
							<span>Last</span>
							<SwapVert fontSize='small' aria-hidden='true' focusable='false' />
						</button>
					</th>
					<th
						className={styles.lrg}
						onClick={() => handleSort('company')}
						role='columnheader'
						aria-sort={
							sortBy === 'company' ?
								sortOrder === 'asc' ?
									'ascending'
								:	'descending'
							:	'none'
						}
						scope='col'
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleSort('company');
							}
						}}
					>
						<button
							type='button'
							className={styles.sort}
							aria-label='Sort by company'
						>
							<span>Company</span>
							<SwapVert fontSize='small' aria-hidden='true' focusable='false' />
						</button>
					</th>
					<th className={styles.md} role='columnheader' scope='col'>
						Title
					</th>
					{columns.importance && (
						<th
							className={styles.sm}
							onClick={() => handleSort('importance')}
							role='columnheader'
							aria-sort={
								sortBy === 'importance' ?
									sortOrder === 'asc' ?
										'ascending'
									:	'descending'
								:	'none'
							}
							scope='col'
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleSort('importance');
								}
							}}
						>
							<button
								type='button'
								className={styles.sort}
								aria-label='Sort by priority'
							>
								<span>Priority</span>
								<SwapVert
									fontSize='small'
									aria-hidden='true'
									focusable='false'
								/>
							</button>
						</th>
					)}
					{columns.phone && (
						<th className={styles.md} role='columnheader' scope='col'>
							Phone
						</th>
					)}
					<th className={styles.lrg} role='columnheader' scope='col'>
						Email
					</th>
					{columns.linkedIn && (
						<th className={styles.md} role='columnheader' scope='col'>
							LinkedIn
						</th>
					)}
					{columns.verified && (
						<th className={styles.sm} role='columnheader' scope='col'>
							Email Verified
						</th>
					)}
					{columns.lastActivity && (
						<th
							className={styles.md}
							onClick={() => handleSort('lastActivity')}
							role='columnheader'
							aria-sort={
								sortBy === 'lastActivity' ?
									sortOrder === 'asc' ?
										'ascending'
									:	'descending'
								:	'none'
							}
							scope='col'
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleSort('lastActivity');
								}
							}}
						>
							<button
								type='button'
								className={styles.sort}
								aria-label='Sort by last contacted date'
							>
								<span>Last Contacted</span>
								<SwapVert
									fontSize='small'
									aria-hidden='true'
									focusable='false'
								/>
							</button>
						</th>
					)}
					{columns.replied && (
						<th
							className={styles.sm}
							onClick={() => handleSort('replied')}
							role='columnheader'
							aria-sort={
								sortBy === 'replied' ?
									sortOrder === 'asc' ?
										'ascending'
									:	'descending'
								:	'none'
							}
							scope='col'
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleSort('replied');
								}
							}}
						>
							<button
								type='button'
								className={styles.sort}
								aria-label='Sort by replied'
							>
								<span>Replied</span>
								<SwapVert
									fontSize='small'
									aria-hidden='true'
									focusable='false'
								/>
							</button>
						</th>
					)}
					{columns.reasonForEmail && (
						<th className={styles.lrg} role='columnheader' scope='col'>
							Reason For Reaching Out:
						</th>
					)}
				</tr>
			</thead>
			<tbody>
				{sortedContacts.map((contact, rowIndex) => {
					return (
						<tr
							key={contact.id ?? contact.email}
							onClick={() => handleClick(contact)}
							className={contact.validEmail === false ? styles.invalid : ''}
							role='row'
							aria-rowindex={rowIndex + 2}
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleClick(contact);
								}
							}}
						>
							{columns.active && (
								<td className={styles.sm} role='cell'>
									{contact.active ? 'Yes' : 'No'}
								</td>
							)}
							<td className={styles.sm} role='cell'>
								{contact.firstName ? contact.firstName : '-'}
							</td>
							<td className={styles.sm} role='cell'>
								{contact.lastName ? contact.lastName : '-'}
							</td>
							<td className={styles.lrg} role='cell'>
								{contact.company ? contact.company : '-'}
							</td>
							<td className={styles.md} role='cell'>
								{contact.title ? contact.title : '-'}
							</td>
							{columns.importance && (
								<td
									className={`${styles.sm} ${
										contact.importance ? styles.right : ''
									}`}
									role='cell'
								>
									{contact.importance ? contact.importance : '-'}
								</td>
							)}
							{columns.phone && (
								<td
									className={`${styles.md} ${
										contact.phone ? styles.right : ''
									}`}
									role='cell'
								>
									{contact.phone ? contact.phone : '-'}
								</td>
							)}
							<td className={styles.lrg} role='cell'>
								{contact.email}
							</td>
							{columns.linkedIn && (
								<td className={styles.md} role='cell'>
									{contact.linkedIn ? contact.linkedIn : '-'}
								</td>
							)}
							{columns.verified && (
								<td
									className={`
								${styles.sm} 
								${styles.right}
								${
									contact.validEmail === null ? ''
									: !contact.validEmail ? styles.invalid
									: ''
								}
								`}
									role='cell'
								>
									{contact.validEmail === null ?
										'-'
									: contact.validEmail ?
										'Yes'
									:	'No'}
								</td>
							)}
							{columns.lastActivity && (
								<td className={`${styles.md} ${styles.right}`} role='cell'>
									{contact.lastActivity ?
										new Date(contact.lastActivity).toLocaleDateString()
									:	''}
								</td>
							)}
							{columns.replied && (
								<td className={`${styles.sm} ${styles.right}`} role='cell'>
									{contact.replied ? 'Yes' : 'No'}
								</td>
							)}
							{columns.reasonForEmail && (
								<td className={styles.lrg} role='cell'>
									{contact.reasonForEmail ? contact.reasonForEmail : '-'}
								</td>
							)}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default ContactsTable;
