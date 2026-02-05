'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './DisplayPreferences.module.scss';

// Types imports
import { UserToClientFromDB } from '@/types/userTypes';

const DisplayPreferences = ({ user }: { user: UserToClientFromDB }) => {
	const [preferences, setPreferences] = useState({
		theme: 'system',
		density: 'comfortable',
		dateFormat: 'MM/DD/YYYY',
		timeFormat: '12h',
		showAvatars: true,
		animationsEnabled: true,
		compactTables: false,
		highlightReplies: true,
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		setPreferences((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Implement save functionality
		console.log('Saving display preferences:', preferences);
	};

	return (
		<div className={styles.displayPreferences}>
			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Appearance</h2>
				<p className={styles.sectionDescription}>
					Customize how the application looks and feels
				</p>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.formGroup}>
						<label htmlFor='theme'>Theme</label>
						<select
							id='theme'
							name='theme'
							value={preferences.theme}
							onChange={handleChange}
						>
							<option value='light'>Light</option>
							<option value='dark'>Dark</option>
							<option value='system'>System (Auto)</option>
						</select>
						<small>Choose your preferred color theme</small>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='density'>Interface Density</label>
						<select
							id='density'
							name='density'
							value={preferences.density}
							onChange={handleChange}
						>
							<option value='compact'>Compact</option>
							<option value='comfortable'>Comfortable</option>
							<option value='spacious'>Spacious</option>
						</select>
						<small>Adjust spacing and padding throughout the interface</small>
					</div>

					<div className={styles.formGroup}>
						<label>
							<input
								type='checkbox'
								name='animationsEnabled'
								checked={preferences.animationsEnabled}
								onChange={handleChange}
							/>
							<span>Enable animations</span>
						</label>
						<small>Smooth transitions and animated effects</small>
					</div>

					<div className={styles.formGroup}>
						<label>
							<input
								type='checkbox'
								name='showAvatars'
								checked={preferences.showAvatars}
								onChange={handleChange}
							/>
							<span>Show contact avatars</span>
						</label>
						<small>Display profile pictures when available</small>
					</div>
				</form>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Date & Time</h2>
				<p className={styles.sectionDescription}>
					Configure how dates and times are displayed
				</p>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.formGroup}>
						<label htmlFor='dateFormat'>Date Format</label>
						<select
							id='dateFormat'
							name='dateFormat'
							value={preferences.dateFormat}
							onChange={handleChange}
						>
							<option value='MM/DD/YYYY'>MM/DD/YYYY (US)</option>
							<option value='DD/MM/YYYY'>DD/MM/YYYY (Europe)</option>
							<option value='YYYY-MM-DD'>YYYY-MM-DD (ISO)</option>
							<option value='MMM DD, YYYY'>MMM DD, YYYY (Text)</option>
						</select>
						<small>Example: {new Date().toLocaleDateString()}</small>
					</div>

					<div className={styles.formGroup}>
						<label htmlFor='timeFormat'>Time Format</label>
						<select
							id='timeFormat'
							name='timeFormat'
							value={preferences.timeFormat}
							onChange={handleChange}
						>
							<option value='12h'>12-hour (AM/PM)</option>
							<option value='24h'>24-hour</option>
						</select>
						<small>Example: {new Date().toLocaleTimeString()}</small>
					</div>
				</form>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Table & List Settings</h2>
				<p className={styles.sectionDescription}>
					Customize how data is displayed in tables and lists
				</p>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.formGroup}>
						<label>
							<input
								type='checkbox'
								name='compactTables'
								checked={preferences.compactTables}
								onChange={handleChange}
							/>
							<span>Compact table view</span>
						</label>
						<small>Show more rows with reduced padding</small>
					</div>

					<div className={styles.formGroup}>
						<label>
							<input
								type='checkbox'
								name='highlightReplies'
								checked={preferences.highlightReplies}
								onChange={handleChange}
							/>
							<span>Highlight contacts who replied</span>
						</label>
						<small>Visual indicator for contacts with recent activity</small>
					</div>
				</form>
			</section>

			<section className={styles.section}>
				<h2 className={styles.sectionTitle}>Accessibility</h2>
				<p className={styles.sectionDescription}>
					Options to improve accessibility and readability
				</p>

				<div className={styles.accessibilityOptions}>
					<div className={styles.optionItem}>
						<div>
							<h3>Font Size</h3>
							<p>Adjust the base font size across the application</p>
						</div>
						<div className={styles.fontSizeControls}>
							<button type='button' className={styles.fontButton}>
								A-
							</button>
							<span>Normal</span>
							<button type='button' className={styles.fontButton}>
								A+
							</button>
						</div>
					</div>

					<div className={styles.optionItem}>
						<div>
							<h3>High Contrast Mode</h3>
							<p>Increase contrast for better visibility</p>
						</div>
						<button type='button' className={styles.secondaryButton}>
							Enable
						</button>
					</div>

					<div className={styles.optionItem}>
						<div>
							<h3>Reduce Motion</h3>
							<p>Minimize animations for accessibility</p>
						</div>
						<button type='button' className={styles.secondaryButton}>
							Enable
						</button>
					</div>
				</div>
			</section>

			<div className={styles.formActions}>
				<button
					type='submit'
					className={styles.primaryButton}
					onClick={handleSubmit}
				>
					Save All Changes
				</button>
				<button type='button' className={styles.secondaryButton}>
					Reset to Defaults
				</button>
			</div>
		</div>
	);
};

export default DisplayPreferences;
