'use client';

export default function LogoutButton() {
	return (
		<form action='/auth/logout' method='GET'>
			<button
				type='submit'
				className='button logout'
				aria-label='Log out of your account'
			>
				Log Out
			</button>
		</form>
	);
}
