'use client';

export default function LogoutButton() {
	const handleLogout = async () => {
		await fetch('/auth/logout', { redirect: 'manual' });
		window.location.href = '/';
	};

	return (
		<button
			onClick={handleLogout}
			className='button logout'
			aria-label='Log out of your account'
		>
			Log Out
		</button>
	);
}
