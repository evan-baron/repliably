// Library imports
import React from 'react';

// Hooks imports

// Styles imports
import styles from './newContactModal.module.scss';

// Icon imports

// Components imports

// Context imports

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

const DeleteContactModal = ({
	selectedContact,
}: {
	selectedContact: ContactFromDB;
}) => {
	return (
		<div className={styles['deletecontactmodal-wrapper']}>
			DeleteContactModal
		</div>
	);
};

export default DeleteContactModal;
