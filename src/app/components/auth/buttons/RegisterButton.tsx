'use client';

interface RegisterButtonProps {
	onClick: () => void;
}

export default function RegisterButton({ onClick }: RegisterButtonProps) {
	return (
		<button
			onClick={onClick}
			className='button register'
			role='button'
			aria-label='Register for an account'
		>
			Register
		</button>
	);
}
