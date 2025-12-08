'use client';

// Library imports
import React, { useState } from 'react';

// Styles imports
import styles from './authSection.module.scss';

// Components imports
import LoginButton from './buttons/LoginButton';
import LoginModal from './modals/LoginModal';
import RegisterButton from './buttons/RegisterButton';
import RegisterModal from './modals/RegisterModal';

const AuthSection = () => {
	const [activeModal, setActiveModal] = useState({
		login: false,
		register: false,
		auth: true,
	});

	const handleCloseModal = () => {
		setActiveModal({
			login: false,
			register: false,
			auth: true,
		});
	};

	switch (true) {
		case activeModal.login:
			return <LoginModal isOpen={true} onClose={handleCloseModal} />;

		case activeModal.register:
			return <RegisterModal isOpen={true} onClose={handleCloseModal} />;

		case activeModal.auth:
		default:
			return (
				<>
					<h1 id='login-heading' aria-label='Welcome message and login prompt'>
						Welcome! Please log in to access your protected content.
					</h1>
					<div className={styles.authButtons}>
						<RegisterButton
							onClick={() =>
								setActiveModal({
									login: false,
									register: true,
									auth: false,
								})
							}
						/>
						<LoginButton
							onClick={() =>
								setActiveModal({
									login: true,
									register: false,
									auth: false,
								})
							}
						/>
					</div>
				</>
			);
	}
};

export default AuthSection;
