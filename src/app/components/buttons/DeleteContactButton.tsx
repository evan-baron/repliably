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

	return (
		<button
			type='button'
			className={styles['delete-contact-button']}
			onClick={handleClick}
		>
			<DeleteForever />
			<span>Delete Contact</span>
		</button>
	);
};

export default DeleteContactButton;
