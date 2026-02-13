// Libraries
import Link from 'next/link';

// Styles imports
import styles from './privacy.module.scss';

// MUI imports
import { West } from '@mui/icons-material';

const Page = async () => {
	return (
		<div className={styles.page}>
			<div className={styles.container}>
				<div className={styles.headerBg}></div>

				<Link href='/' className={styles.goBack}>
					<West /> Back to home
				</Link>

				<header>
					<h1>Privacy Policy</h1>
					<p className={styles.lastUpdated}>Last Updated: February 12, 2026</p>
				</header>

				<nav>
					<h2>Table of Contents</h2>
					<ul>
						<li>
							<Link href='#introduction'>Introduction</Link>
						</li>
						<li>
							<Link href='#information-collected'>Information We Collect</Link>
						</li>
						<li>
							<Link href='#how-we-use'>How We Use Your Information</Link>
						</li>
						<li>
							<Link href='#gmail-integration'>
								Gmail Integration & API Usage
							</Link>
						</li>
						<li>
							<Link href='#data-storage'>Data Storage & Security</Link>
						</li>
						<li>
							<Link href='#third-party'>Third-Party Services</Link>
						</li>
						<li>
							<Link href='#data-retention'>Data Retention</Link>
						</li>
						<li>
							<Link href='#your-rights'>Your Rights & Choices</Link>
						</li>
						<li>
							<Link href='#changes'>Changes to This Policy</Link>
						</li>
						<li>
							<Link href='#contact'>Contact Us</Link>
						</li>
					</ul>
				</nav>

				<main>
					<section id='introduction'>
						<h2>Introduction</h2>
						<p>
							Welcome to our email automation platform. We are committed to
							protecting your privacy and handling your data with transparency
							and care. This Privacy Policy explains how we collect, use, store,
							and protect your information when you use our service.
						</p>
						<p>
							By using our platform, you agree to the collection and use of
							information in accordance with this policy. If you do not agree
							with our policies and practices, please do not use our service.
						</p>
					</section>

					<section id='information-collected'>
						<h2>Information We Collect</h2>
						<p>
							We collect several types of information to provide and improve our
							service:
						</p>

						<h3>Account Information</h3>
						<ul>
							<li>
								<strong>Email Address:</strong> Used for account creation,
								authentication, and communication
							</li>
							<li>
								<strong>Login Credentials:</strong> Securely stored
								authentication information
							</li>
						</ul>

						<h3>Gmail Account Data</h3>
						<p>
							When you connect your Gmail account to our platform, we collect
							and access:
						</p>
						<ul>
							<li>
								<strong>Gmail Refresh Token:</strong> Allows our platform to
								send emails on your behalf via the Gmail API
							</li>
							<li>
								<strong>Email Metadata:</strong> Information about sent emails,
								including recipients, timestamps, and delivery status
							</li>
							<li>
								<strong>Reply Tracking Data:</strong> We monitor your replies
								folder via webhooks to detect when recipients respond to your
								emails
							</li>
							<li>
								<strong>Email Content:</strong> The content of emails you
								create, queue, and send through our platform
							</li>
						</ul>

						<h3>Contact Information</h3>
						<ul>
							<li>
								<strong>Contact Details:</strong> Names, email addresses, and
								any other information you store about your contacts
							</li>
							<li>
								<strong>Contact Lists:</strong> Organization and segmentation of
								your contact database
							</li>
							<li>
								<strong>Engagement Data:</strong> Information about how your
								contacts interact with your emails
							</li>
						</ul>

						<h3>Usage Information</h3>
						<ul>
							<li>
								<strong>Platform Activity:</strong> Actions you take within the
								platform (creating sequences, scheduling emails, etc.)
							</li>
							<li>
								<strong>Technical Data:</strong> IP addresses, browser type,
								device information, and access times
							</li>
						</ul>
					</section>

					<section id='how-we-use'>
						<h2>How We Use Your Information</h2>
						<p>We use the collected information for the following purposes:</p>

						<h3>Service Delivery</h3>
						<ul>
							<li>Send emails from your Gmail account using the Gmail API</li>
							<li>
								Automate follow-up email sequences based on your configurations
							</li>
							<li>
								Monitor recipient replies to manage email queues and sequences
							</li>
							<li>Store and manage your contact database</li>
							<li>
								Generate and queue AI-written emails based on your preferences
							</li>
						</ul>

						<h3>Service Improvement</h3>
						<ul>
							<li>Analyze usage patterns to improve platform functionality</li>
							<li>
								Troubleshoot technical issues and provide customer support
							</li>
							<li>Develop new features and optimize existing ones</li>
						</ul>

						<h3>Communication</h3>
						<ul>
							<li>Send service-related notifications and updates</li>
							<li>Respond to your inquiries and support requests</li>
							<li>Inform you of changes to our service or policies</li>
						</ul>
					</section>

					<section id='gmail-integration'>
						<h2>Gmail Integration & API Usage</h2>

						<div className={styles['highlight-box']}>
							<p>
								<strong>Important:</strong> Our platform's use and transfer of
								information received from Google APIs adheres to{' '}
								<Link href='https://developers.google.com/terms/api-services-user-data-policy'>
									Google API Services User Data Policy
								</Link>
								, including the Limited Use requirements.
							</p>
						</div>

						<h3>Gmail API Scopes</h3>
						<p>We request the following Gmail API permissions:</p>
						<ul>
							<li>
								<strong>Send Email:</strong> To send emails on your behalf
								through your connected Gmail account
							</li>
							<li>
								<strong>Read Email Metadata:</strong> To track replies and
								manage email sequences
							</li>
							<li>
								<strong>Modify Email:</strong> To delete or modify scheduled
								emails when recipients reply
							</li>
						</ul>

						<h3>How We Use Your Gmail Data</h3>
						<ul>
							<li>
								<strong>Email Sending:</strong> We use your Gmail refresh token
								to authenticate and send emails through the Gmail API as if you
								were sending them directly
							</li>
							<li>
								<strong>Reply Detection:</strong> Webhooks monitor your replies
								folder to detect when recipients respond to your outreach
							</li>
							<li>
								<strong>Sequence Management:</strong> When a reply is detected,
								we automatically remove the recipient from active sequences and
								delete pending scheduled emails
							</li>
							<li>
								<strong>AI Content Generation:</strong> GPT technology generates
								email content based on your prompts and sends it via your Gmail
								account
							</li>
						</ul>

						<h3>Data Access Limitations</h3>
						<p>
							We only access the specific Gmail data necessary to provide our
							service. We do not:
						</p>
						<ul>
							<li>
								Read the content of emails not created through our platform
							</li>
							<li>
								Access emails in folders other than those necessary for reply
								tracking
							</li>
							<li>
								Share your Gmail data with third parties for advertising or
								marketing purposes
							</li>
							<li>
								Use your Gmail data to build user profiles for purposes other
								than providing our service
							</li>
						</ul>

						<h3>Revoking Access</h3>
						<p>
							You can revoke our platform's access to your Gmail account at any
							time through:
						</p>
						<ul>
							<li>Your platform account settings</li>
							<li>Your Google Account permissions page</li>
						</ul>
						<p>
							Note that revoking access will prevent our platform from sending
							emails on your behalf and managing your sequences.
						</p>
					</section>

					<section id='data-storage'>
						<h2>Data Storage & Security</h2>

						<h3>How We Store Your Data</h3>
						<ul>
							<li>
								<strong>Secure Databases:</strong> All account information,
								contacts, and email data are stored in encrypted databases
							</li>
							<li>
								<strong>Token Security:</strong> Gmail refresh tokens are
								encrypted at rest and in transit
							</li>
							<li>
								<strong>Geographic Location:</strong> Data is stored on secure
								servers in the US.
							</li>
						</ul>

						<h3>Security Measures</h3>
						<p>
							We implement industry-standard security measures to protect your
							data:
						</p>
						<ul>
							<li>SSL/TLS encryption for all data transmission</li>
							<li>Encrypted storage of sensitive credentials and tokens</li>
							<li>Regular security audits and vulnerability assessments</li>
							<li>Access controls and authentication requirements for staff</li>
							<li>Monitoring and logging of system access</li>
						</ul>

						<div className={styles['highlight-box']}>
							<p>
								<strong>Please Note:</strong> While we implement robust security
								measures, no method of transmission over the internet or
								electronic storage is 100% secure. We cannot guarantee absolute
								security of your data.
							</p>
						</div>
					</section>

					<section id='third-party'>
						<h2>Third-Party Services</h2>
						<p>
							Our platform integrates with and uses the following third-party
							services:
						</p>

						<h3>Google Gmail API</h3>
						<ul>
							<li>
								<strong>Purpose:</strong> Email sending and reply tracking
								functionality
							</li>
							<li>
								<strong>Data Shared:</strong> Email content, recipient
								information, authentication tokens
							</li>
							<li>
								<strong>Privacy Policy:</strong>{' '}
								<Link href='https://policies.google.com/privacy'>
									Google Privacy Policy
								</Link>
							</li>
						</ul>

						<h3>OpenAI (GPT)</h3>
						<ul>
							<li>
								<strong>Purpose:</strong> AI-powered email content generation
							</li>
							<li>
								<strong>Data Shared:</strong> Email prompts and context you
								provide for content generation
							</li>
							<li>
								<strong>Privacy Policy:</strong>{' '}
								<Link href='https://openai.com/policies/privacy-policy'>
									OpenAI Privacy Policy
								</Link>
							</li>
						</ul>

						<h3>Hosting & Infrastructure</h3>
						<ul>
							<li>
								<strong>Purpose:</strong> Platform hosting and data storage
							</li>
							<li>
								<strong>Data Shared:</strong> All platform data necessary for
								service operation
							</li>
							<li>
								<strong>Note:</strong> We use reputable cloud service providers
								with strong security and privacy commitments
							</li>
						</ul>

						<p>
							We carefully select third-party service providers that maintain
							appropriate security and privacy standards. However, we are not
							responsible for the privacy practices of these third-party
							services.
						</p>
					</section>

					<section id='data-retention'>
						<h2>Data Retention</h2>
						<p>
							We retain your information for as long as necessary to provide our
							services and fulfill the purposes outlined in this policy:
						</p>

						<h3>Active Accounts</h3>
						<ul>
							<li>
								<strong>Account Data:</strong> Retained for the duration of your
								account
							</li>
							<li>
								<strong>Contact Information:</strong> Stored until you delete
								contacts or close your account
							</li>
							<li>
								<strong>Email History:</strong> Maintained to provide sequence
								analytics and service functionality
							</li>
						</ul>

						<h3>Account Deletion</h3>
						<p>When you delete your account:</p>
						<ul>
							<li>
								Your account information and contacts are permanently deleted
								within 30 days
							</li>
							<li>Gmail API access is immediately revoked</li>
							<li>Scheduled emails are cancelled and deleted</li>
							<li>
								Some data may be retained for legal or security purposes as
								required by law
							</li>
						</ul>

						<h3>Legal Retention</h3>
						<p>
							Certain information may be retained longer if required by law,
							such as for tax, accounting, or legal purposes, or to resolve
							disputes and enforce our agreements.
						</p>
					</section>

					<section id='your-rights'>
						<h2>Your Rights & Choices</h2>
						<p>
							You have the following rights regarding your personal information:
						</p>

						<h3>Access & Portability</h3>
						<ul>
							<li>
								<strong>View Your Data:</strong> Access all information we have
								stored about you
							</li>
							<li>
								<strong>Export Your Data:</strong> Request a copy of your data
								in a portable format
							</li>
						</ul>

						<h3>Correction & Deletion</h3>
						<ul>
							<li>
								<strong>Update Information:</strong> Modify your account details
								and contact information
							</li>
							<li>
								<strong>Delete Contacts:</strong> Remove individual contacts or
								entire contact lists
							</li>
							<li>
								<strong>Delete Account:</strong> Permanently delete your account
								and associated data
							</li>
						</ul>

						<h3>Control Over Gmail Access</h3>
						<ul>
							<li>
								<strong>Disconnect Gmail:</strong> Revoke our platform's access
								to your Gmail account at any time
							</li>
							<li>
								<strong>Modify Permissions:</strong> Adjust the level of access
								granted to our platform
							</li>
						</ul>

						<h3>Communication Preferences</h3>
						<ul>
							<li>
								<strong>Opt-Out:</strong> Unsubscribe from marketing
								communications (service-related emails will still be sent)
							</li>
							<li>
								<strong>Notification Settings:</strong> Control what
								notifications you receive
							</li>
						</ul>

						<h3>Exercising Your Rights</h3>
						<p>
							To exercise any of these rights, please contact us using the
							information in the Contact Us section below. We will respond to
							your request within 30 days.
						</p>
					</section>

					<section id='changes'>
						<h2>Changes to This Policy</h2>
						<p>
							We may update this Privacy Policy from time to time to reflect
							changes in our practices, technology, legal requirements, or other
							factors.
						</p>

						<h3>How We Notify You</h3>
						<ul>
							<li>
								We will update the "Last Updated" date at the top of this policy
							</li>
							<li>
								For material changes, we will send you an email notification
							</li>
							<li>
								We may also display a prominent notice within the platform
							</li>
						</ul>

						<h3>Your Continued Use</h3>
						<p>
							Your continued use of our platform after any changes to this
							Privacy Policy will constitute your acknowledgment of the
							modifications and your consent to abide by the updated policy.
						</p>

						<p>
							We encourage you to review this Privacy Policy periodically to
							stay informed about how we are protecting your information.
						</p>
					</section>

					<section id='contact'>
						<h2>Contact Us</h2>
						<p>
							If you have any questions, concerns, or requests regarding this
							Privacy Policy or our data practices, please contact us:
						</p>

						<div className={styles['contact-info']}>
							<h3>Get In Touch</h3>

							<p>
								<strong>Email:</strong>{' '}
								<Link href='mailto:support@repliably.com'>
									support@repliably.com
								</Link>
							</p>
							{/* <p>
								<strong>Address:</strong> [Your Company Address]
							</p> */}

							<p>
								We aim to respond to all privacy-related inquiries within 48
								hours during business days.
							</p>
						</div>
					</section>
				</main>

				<footer>
					<p>&copy; 2026 Repliably. All rights reserved.</p>
					<p>
						<Link href='/terms'>Terms of Service</Link>
					</p>
				</footer>
			</div>
		</div>
	);
};

export default Page;
