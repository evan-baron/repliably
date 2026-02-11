'use client';

// Library imports

// Hooks imports
import { useContactsGetAll } from '@/hooks/useContact';

// Styles imports
import styles from './searchContactsModal.module.scss';

// MUI imports
import { Refresh } from '@mui/icons-material';

// Components imports
import SearchBar from '@/app/components/searchBar/SearchBar';
import ContactsTable from '@/app/components/pageSpecificComponents/dashboard/contacts/ContactsTable';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

// Types imports

const SearchContactsModal = () => {
	const { setModalType } = useAppContext();
	const {
		data: contactsData,
		error,
		isPending: loading,
		refetch,
	} = useContactsGetAll();

	const contacts = contactsData?.contacts || [];

	const onRowClick = (_contactId: number) => {
		setModalType(null);
	};

	return (
		<div
			className={styles['searchcontactsmodal-wrapper']}
			role='dialog'
			aria-labelledby='search-contacts-title'
			aria-modal='true'
		>
			<h2 id='search-contacts-title' className='sr-only'>
				Search Contacts
			</h2>
			<div className={styles.controls}>
				<SearchBar placeholder='Search contacts...' />
				<button
					className={styles.refreshButton}
					type='button'
					onClick={() => refetch()}
					aria-label='Refresh contacts list'
				>
					<Refresh
						className={styles.icon}
						aria-hidden='true'
						focusable='false'
					/>
				</button>
			</div>
			{error && (
				<p role='alert' style={{ color: 'red' }}>
					Error: {error.message}
				</p>
			)}
			<ContactsTable
				inModal={true}
				contacts={contacts}
				onRowClick={onRowClick}
				columns={{
					reasonForEmail: false,
					importance: false,
					lastActivity: true,
					linkedIn: false,
					phone: false,
					replied: false,
				}}
			/>
		</div>
	);
};

export default SearchContactsModal;
