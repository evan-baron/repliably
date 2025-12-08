'use client';

interface LoginButtonProps {
	onClick: () => void;
}

export default function LoginButton({ onClick }: LoginButtonProps) {
	return (
		<button
			onClick={onClick}
			className='button login'
			role='button'
			aria-label='Log in to your account'
		>
			Log In
		</button>
	);
}
