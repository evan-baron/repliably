'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './AccountSettings.module.scss';

const AccountSettings = () => {
	// TODO: Fetch user data from API
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		timezone: 'America/Denver',
		role: 'user',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement save functionality
		console.log('Saving account settings:', formData);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className={styles.accountSettings}>
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Profile Information</h2>
				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.formGroup}>
						<label htmlFor='firstName'>First Name</label>
						<input
							type='text'
							id='firstName'
							name='firstName'
							value={formData.firstName}
							onChange={handleChange}
							placeholder='Enter first name'
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='lastName'>Last Name</label>
						<input
							type='text'
							id='lastName'
							name='lastName'
							value={formData.lastName}
							onChange={handleChange}
							placeholder='Enter last name'
						/>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='email'>Email Address</label>
						<input
							type='email'
							id='email'
							name='email'
							value={formData.email}
							onChange={handleChange}
							placeholder='Enter email address'
							disabled
						/>
						<small className={styles.helpText}>
							Email cannot be changed. Contact support for assistance.
						</small>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='timezone'>Timezone</label>
						<select
							id='timezone'
							name='timezone'
							value={formData.timezone}
							onChange={handleChange}
						>
							<option value='America/New_York'>Eastern Time (ET)</option>
							<option value='America/Chicago'>Central Time (CT)</option>
							<option value='America/Denver'>Mountain Time (MT)</option>
							<option value='America/Los_Angeles'>Pacific Time (PT)</option>
							<option value='America/Phoenix'>Arizona (MT - No DST)</option>
							<option value='America/Anchorage'>Alaska Time (AKT)</option>
							<option value='Pacific/Honolulu'>Hawaii Time (HT)</option>
							<option value='UTC'>UTC</option>
						</select>
						<small className={styles.helpText}>
							Used for scheduling emails and displaying timestamps
						</small>
					</div>

					<div className={styles.formActions}>
						<button type='submit' className={styles.primaryButton}>
							Save Changes
						</button>
					</div>
				</form>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Account Security</h2>
				<div className={styles.securityOptions}>
					<div className={styles.securityItem}>
						<div>
							<h3>Password</h3>
							<p>Manage your password through Auth0</p>
						</div>
						<button className={styles.secondaryButton}>Change Password</button>
					</div>

					<div className={styles.securityItem}>
						<div>
							<h3>Two-Factor Authentication</h3>
							<p>Add an extra layer of security to your account</p>
						</div>
						<button className={styles.secondaryButton}>Enable 2FA</button>
					</div>

					<div className={styles.securityItem}>
						<div>
							<h3>Active Sessions</h3>
							<p>Manage devices where you're currently logged in</p>
						</div>
						<button className={styles.secondaryButton}>View Sessions</button>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Account Data</h2>
				<div className={styles.dataOptions}>
					<div className={styles.dataItem}>
						<div>
							<h3>Export Data</h3>
							<p>Download all your contacts, messages, and sequences</p>
						</div>
						<button className={styles.secondaryButton}>Export Data</button>
					</div>

					<div className={styles.dataItem}>
						<div>
							<h3>Delete Account</h3>
							<p className={styles.dangerText}>
								Permanently delete your account and all associated data
							</p>
						</div>
						<button className={styles.dangerButton}>Delete Account</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AccountSettings;
