import Modal from '../../ui/Modal';
import styles from '../../ui/modal.module.scss';

interface RegisterModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Register'>
			<div className={styles.authModal}>
				<p>Registration is closed at this time.</p>
			</div>
		</Modal>
	);
}
