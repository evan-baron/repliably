'use client';

// Context imports
import { useAppContext } from '@/app/context/AppContext';

const ModalBackButton = ({
	modalRedirect,
	title,
}: {
	modalRedirect: string | null;
	title: string;
}) => {
	const { setModalType } = useAppContext();

	const handleClick = () => {
		setModalType(modalRedirect);
	};

	return (
		<button
			type='button'
			onClick={handleClick}
			className='button back'
			aria-label={`Go back to ${title}`}
		>
			{title}
		</button>
	);
};

export default ModalBackButton;
