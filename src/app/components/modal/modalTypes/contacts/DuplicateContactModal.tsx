// Styles imports
import styles from './deleteContactModal.module.scss';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

// Types imports
import { ContactFromDB } from '@/types/contactTypes';

const DuplicateContactModal = ({
	selectedContact,
}: {
	selectedContact: ContactFromDB;
}) => {
	const { setModalType } = useAppContext();

	const handleEditExisting = () => {
		setModalType('editContact');
	};

	const handleGoBack = () => {
		setModalType('newContact');
	};

	return (
		<div
			className={styles['deletecontactmodal-wrapper']}
			role='alertdialog'
			aria-labelledby='duplicate-contact-title'
			aria-describedby='duplicate-contact-message'
			aria-modal='true'
		>
			<h2 id='duplicate-contact-title' className='sr-only'>
				Duplicate Contact
			</h2>
			<div id='duplicate-contact-message'>
				<p className={styles.message}>
					A contact with this email already exists:
				</p>
				<br />
				<p className={styles.message}>
					<span style={{ fontWeight: '500' }}>
						{selectedContact.firstName} {selectedContact.lastName}
					</span>{' '}
					({selectedContact.email})
				</p>
				{selectedContact.company && (
					<p className={styles.message}>
						{selectedContact.title && <span>{selectedContact.title} at</span>}{' '}
						<span style={{ fontWeight: '500' }}>{selectedContact.company}</span>
					</p>
				)}
			</div>
			<div className={styles.buttons}>
				<button
					type='button'
					className={'button contact delete'}
					onClick={handleEditExisting}
					aria-label={'Edit existing contact'}
				>
					Edit Existing Contact
				</button>
				<button
					type='button'
					className={'button back'}
					onClick={handleGoBack}
					aria-label={'Go back to new contact form'}
				>
					Go Back
				</button>
			</div>
		</div>
	);
};

export default DuplicateContactModal;
