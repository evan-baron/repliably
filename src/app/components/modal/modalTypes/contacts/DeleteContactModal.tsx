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
		<div className={styles['deletecontactmodal-wrapper']}>
			<p className={styles.message}>
				Permanently delete contact:{' '}
				<span style={{ fontWeight: '500' }}>
					{selectedContact.firstName} {selectedContact.lastName}
				</span>{' '}
				and all its related data?
			</p>
			<div className={styles.buttons}>
				<ModalBackButton modalRedirect={null} title='Cancel' />
				<button
					type='button'
					className={'button delete'}
					onClick={handleDelete}
					disabled={deleting}
				>
					Delete
				</button>
			</div>
		</div>
	);
};

export default DeleteContactModal;
