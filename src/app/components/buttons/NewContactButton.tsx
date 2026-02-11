'use client';

// Styles imports
import styles from './buttons.module.scss';

// MUI imports
import { Add } from '@mui/icons-material';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const NewContactButton = () => {
	const { setModalType } = useAppContext();

	const handleClick = () => {
		setModalType('newContact');
	};

	return (
		<button
			type='button'
			className={styles['new-contact-button']}
			onClick={handleClick}
			aria-label='Create new contact'
		>
			<Add aria-hidden='true' focusable='false' />
			<span>New Contact</span>
		</button>
	);
};

export default NewContactButton;
