// Library imports
import { useRouter } from 'next/navigation';

// Hooks imports
import { useContactDelete } from '@/hooks/useContact';

// Styles imports
import styles from './deleteContactModal.module.scss';

// Components imports
import ModalBackButton from '@/app/components/buttons/ModalBackButton';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

const DeleteContactModal = ({
	selectedContact,
}: {
	selectedContact: ContactFromDB;
}) => {
	const { setModalType, setSelectedContact } = useAppContext();
	const { mutateAsync: deleteContact, isPending: deleting } =
		useContactDelete();
	const router = useRouter();

	const handleDelete = async () => {
		try {
			await deleteContact(selectedContact.id);
			setModalType(null);
			setSelectedContact(null);
			router.push('/dashboard/contacts');
		} catch (error) {
			console.error('Error deleting contact:', error);
		}
	};

	return (
		<div
			className={styles['deletecontactmodal-wrapper']}
			role='alertdialog'
			aria-labelledby='delete-contact-title'
			aria-describedby='delete-contact-message'
			aria-modal='true'
		>
			<h2 id='delete-contact-title' className='sr-only'>
				Delete Contact
			</h2>
			<p id='delete-contact-message' className={styles.message}>
				Permanently delete contact:{' '}
				<span style={{ fontWeight: '500' }}>
					{selectedContact.firstName} {selectedContact.lastName}
				</span>{' '}
				and all its related data?
			</p>
			<div className={styles.buttons}>
				<button
					type='button'
					className={'button delete'}
					onClick={handleDelete}
					disabled={deleting}
					aria-disabled={deleting}
				>
					{deleting ? 'Deleting...' : 'Delete'}
				</button>
				<ModalBackButton modalRedirect={null} title='Cancel' />
			</div>
		</div>
	);
};

export default DeleteContactModal;
