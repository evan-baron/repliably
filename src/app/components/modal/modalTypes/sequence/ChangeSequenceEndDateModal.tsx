'use client';

// Library imports
import { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

// Hooks imports
import { useSequenceChangeEndDate } from '@/hooks/useSequence';

// Styles imports
import styles from './changeSequenceEndDateModal.module.scss';

// Components imports
import ModalBackButton from '@/app/components/buttons/ModalBackButton';

// Context imports
import { useAppContext } from '@/app/context/AppContext';
import { useEmailContext } from '@/app/context/EmailContext';

const ChangeSequenceEndDateModal = () => {
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	const { setModalType, setLoading, setLoadingMessage } = useAppContext();
	const {
		setSelectedSequenceId,
		selectedSequenceId,
		setSelectedSequenceEndDate,
		selectedSequenceEndDate,
	} = useEmailContext();
	const { mutateAsync: changeEndDate, isPending } = useSequenceChangeEndDate(
		selectedSequenceId!,
	);

	const handleChangeEndDate = async () => {
		if (!selectedDate) return;

		try {
			setLoading(true);
			setLoadingMessage('Saving');
			await changeEndDate(selectedDate);
			setModalType(null);
			setSelectedSequenceId(null);
			setSelectedSequenceEndDate(null);
		} catch (error) {
			console.error('Error changing sequence end date:', error);
		} finally {
			setTimeout(() => {
				setLoading(false);
				setLoadingMessage(null);
			}, 800);
		}
	};

	return (
		<div
			className={styles['changeenddatemodal-wrapper']}
			role='alertdialog'
			aria-labelledby='modal-title'
			aria-describedby='change-end-date-message'
			aria-modal='true'
		>
			<p id='change-end-date-message' className={'sr-only'}>
				Select a new end date for the sequence.
			</p>
			<Flatpickr
				options={{
					inline: true,
					minDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
					dateFormat: 'Y-m-d',
				}}
				onChange={([date]) => {
					setSelectedDate(date ? date.toISOString() : null);
				}}
				render={({ defaultValue }, ref) => (
					<input
						type='hidden'
						defaultValue={defaultValue}
						ref={ref}
						style={{ display: 'none' }}
					/>
				)}
			/>
			<div className={styles.buttons}>
				<button
					type='button'
					className={'button delete'}
					onClick={handleChangeEndDate}
					disabled={isPending || !selectedDate}
					aria-disabled={isPending || !selectedDate}
				>
					{isPending ? 'Saving...' : 'Save'}
				</button>
				<ModalBackButton modalRedirect={null} title='Cancel' />
			</div>
		</div>
	);
};

export default ChangeSequenceEndDateModal;
