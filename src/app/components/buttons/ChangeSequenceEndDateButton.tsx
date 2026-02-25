'use client';

// Styles imports
import styles from './buttons.module.scss';

// MUI imports
import { DateRange } from '@mui/icons-material';

// Context imports
import { useAppContext } from '@/app/context/AppContext';
import { useEmailContext } from '@/app/context/EmailContext';

// Types imports

const ChangeSequenceEndDateButton = ({
	sequenceId,
	endDate,
}: {
	sequenceId: number;
	endDate: Date | null;
}) => {
	const { setModalType } = useAppContext();
	const { setSelectedSequenceId, setSelectedSequenceEndDate } =
		useEmailContext();

	const handleClick = () => {
		setSelectedSequenceId(sequenceId);
		setSelectedSequenceEndDate(endDate);
		setModalType('extendSequence');
	};

	return (
		<button
			type='button'
			className={styles['edit-contact-button']}
			onClick={handleClick}
			aria-label={`Change end date for sequence ${sequenceId}`}
		>
			<DateRange aria-hidden='true' focusable='false' />
			<span>Change End Date</span>
		</button>
	);
};

export default ChangeSequenceEndDateButton;
