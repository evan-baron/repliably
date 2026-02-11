'use client';

// MUI Icons
import { Close } from '@mui/icons-material';

interface CloseButtonProps {
	onClick: () => void;
	ariaLabel?: string;
}

export default function CloseButton({
	onClick,
	ariaLabel = 'Close dialog',
}: CloseButtonProps) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='close'
			aria-label={ariaLabel}
		>
			<Close
				style={{ fontSize: '1.75rem' }}
				aria-hidden='true'
				focusable='false'
			/>
		</button>
	);
}
