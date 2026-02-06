'use client';

// Styles imports
import styles from './settings.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

// Components imports
import AccountSettingsForm from '@/app/components/forms/accountSettings/AccountSettingsForm';

const AccountSettings = ({ user }: { user: UserToClientFromDB }) => {
	return (
		<div className={styles['settings-container']}>
			<section className={styles.section}>
				<h3 className={styles['section-title']}>Profile Information</h3>
				<AccountSettingsForm user={user} />
			</section>

			<section className={styles.section}>
				<h3 className={styles['section-title']}>Account Security</h3>
				<div className={styles.options}>
					<div className={styles.item}>
						<div>
							<h4>Password</h4>
							<small>Manage your password through Auth0</small>
						</div>
						<button className={'button settings-button'}>
							Change Password
						</button>
					</div>

					<div className={styles.item}>
						<div>
							<h4>Two-Factor Authentication</h4>
							<small>Add an extra layer of security to your account</small>
						</div>
						<button className={'button settings-button'}>Enable 2FA</button>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<h3 className={styles['section-title']}>Account Data</h3>
				<div className={styles.options}>
					<div className={styles.item}>
						<div>
							<h4>Export Data</h4>
							<small>Download all your contacts, messages, and sequences</small>
						</div>
						<button className={'button settings-button'}>Export Data</button>
					</div>

					<div className={styles.item}>
						<div>
							<h4>Delete Account</h4>
							<small className={styles.dangerText}>
								Permanently delete your account and all associated data
							</small>
						</div>
						<button className={'button delete-account'}>Delete Account</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AccountSettings;
