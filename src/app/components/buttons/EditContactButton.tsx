'use client';

// Styles imports
import styles from './buttons.module.scss';

// MUI imports
import { Edit } from '@mui/icons-material';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

const EditContactButton = ({ contact }: { contact: ContactFromDB }) => {
	const { setModalType, setSelectedContact } = useAppContext();

	const handleClick = () => {
		setSelectedContact(contact);
		setModalType('editContact');
	};

	const contactName = contact.firstName + ' ' + contact.lastName;

	return (
		<button
			type='button'
			className={styles['edit-contact-button']}
			onClick={handleClick}
			aria-label={`Edit contact ${contactName}`}
		>
			<Edit aria-hidden='true' focusable='false' />
			<span>Edit Contact</span>
		</button>
	);
};

export default EditContactButton;
