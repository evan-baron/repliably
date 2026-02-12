'use client';

// Styles imports
import styles from './settings.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';
import { hasPasswordAuth, Auth0Identity } from '@/lib/helpers/checkAuthMethod';

// Components imports
import AccountSettingsForm from '@/app/components/forms/accountSettings/AccountSettingsForm';

// Context
import { useAppContext } from '@/app/context/AppContext';

const AccountSettings = ({
	user,
	identities,
}: {
	user: UserToClientFromDB;
	identities: Auth0Identity[];
}) => {
	const { setModalType } = useAppContext();
	const passwordAuth = hasPasswordAuth(identities);

	return (
		<div className={styles['settings-container']}>
			<section className={styles.section} aria-labelledby='profile-title'>
				<h3 id='profile-title' className={styles['section-title']}>
					Profile Information
				</h3>
				<AccountSettingsForm user={user} />
			</section>

			<section
				className={styles.section}
				aria-labelledby='account-security-title'
			>
				<h3 id='account-security-title' className={styles['section-title']}>
					Account Security
				</h3>
				<div className={styles.options}>
					<div className={styles.item}>
						<div>
							<h4 id='password-title'>Password</h4>
							<small id='password-help'>
								{passwordAuth ?
									'Manage your password through Auth0'
								:	'Password management is not available for your authentication method (eg. Google, Microsoft, etc.)'
								}
							</small>
						</div>
						<button
							type='button'
							className={'button settings-button'}
							disabled={!passwordAuth}
							aria-describedby='password-help'
							aria-label='Change Password'
						>
							Change Password
						</button>
					</div>

					{/* <div className={styles.item}>
                        <div>
                            <h4>Two-Factor Authentication</h4>
                            <p className={styles.description}>
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <button type='button' className={'button settings-button'}>
                            Enable 2FA
                        </button>
                    </div> */}
				</div>
			</section>

			<section className={styles.section} aria-labelledby='account-data-title'>
				<h3 id='account-data-title' className={styles['section-title']}>
					Account Data
				</h3>
				<div className={styles.options}>
					<div className={styles.item}>
						<div>
							<h4 id='export-data-title'>Export Data (Coming Soon)</h4>
							<small id='export-data-help'>
								Download all your contacts, messages, and sequences
							</small>
						</div>
						<button
							type='button'
							className={'button settings-button'}
							disabled={true}
							aria-describedby='export-data-help'
							aria-label='Export Data'
						>
							Export Data
						</button>
					</div>

					<div className={styles.item}>
						<div>
							<h4 id='delete-account-title'>Delete Account</h4>
							<small id='delete-description' className={styles.dangerText}>
								Permanently delete your account and all associated data
							</small>
						</div>
						<button
							type='button'
							className={'button settings-button'}
							onClick={() => setModalType('deleteAccount')}
							aria-describedby='delete-description'
						>
							Delete Account
						</button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AccountSettings;
