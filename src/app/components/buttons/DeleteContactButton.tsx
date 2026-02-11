'use client';

// Styles imports
import styles from './buttons.module.scss';

// MUI imports
import { DeleteForever } from '@mui/icons-material';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

const DeleteContactButton = ({ contact }: { contact: ContactFromDB }) => {
	const { setModalType, setSelectedContact } = useAppContext();

	const handleClick = () => {
		setSelectedContact(contact);
		setModalType('deleteContact');
	};

	const contactName = contact.firstName + ' ' + contact.lastName;

	return (
		<button
			type='button'
			className={styles['delete-contact-button']}
			onClick={handleClick}
			aria-label={`Delete contact ${contactName}`}
		>
			<DeleteForever aria-hidden='true' focusable='false' />
			<span>Delete Contact</span>
		</button>
	);
};

export default DeleteContactButton;
