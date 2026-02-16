// Libraries
import Link from 'next/link';

// Styles imports
import styles from '../privacy/privacy.module.scss';

// MUI imports
import { West } from '@mui/icons-material';

// Components imports
import FAB from '../components/FAB/FAB';

const Page = async () => {
	return (
		<div className={styles.page}>
			<div className={styles.container}>
				<div className={styles.headerBg}></div>

				<FAB type='ttt' />

				<Link href='/' className={styles.goBack}>
					<West /> Back to home
				</Link>

				<header>
					<h1>Terms of Service</h1>
					<p className={styles.lastUpdated}>Last Updated: February 12, 2026</p>
				</header>

				<nav>
					<h2>Table of Contents</h2>
					<ul>
						<li>
							<Link href='#acceptance'>Acceptance of Terms</Link>
						</li>
						<li>
							<Link href='#description'>Service Description</Link>
						</li>
						<li>
							<Link href='#account'>Account Registration</Link>
						</li>
						<li>
							<Link href='#acceptable-use'>Acceptable Use Policy</Link>
						</li>
						<li>
							<Link href='#gmail-terms'>Gmail Integration Terms</Link>
						</li>
						<li>
							<Link href='#content'>Your Content & Data</Link>
						</li>
						<li>
							<Link href='#intellectual-property'>Intellectual Property</Link>
						</li>
						<li>
							<Link href='#fees'>Fees & Payment</Link>
						</li>
						<li>
							<Link href='#termination'>Termination</Link>
						</li>
						<li>
							<Link href='#warranties'>Warranties & Disclaimers</Link>
						</li>
						<li>
							<Link href='#limitation'>Limitation of Liability</Link>
						</li>
						<li>
							<Link href='#indemnification'>Indemnification</Link>
						</li>
						<li>
							<Link href='#changes'>Changes to Terms</Link>
						</li>
						<li>
							<Link href='#contact'>Contact Information</Link>
						</li>
					</ul>
				</nav>

				<main>
					<section id='acceptance'>
						<h2>Acceptance of Terms</h2>
						<p>
							Welcome to our email automation platform ("Service"). These Terms
							of Service ("Terms") constitute a legally binding agreement
							between you ("User," "you," or "your") and Repliably ("Company,"
							"we," "us," or "our").
						</p>

						<div className={styles['highlight-box']}>
							<p>
								<strong>
									By accessing or using our Service, you agree to be bound by
									these Terms.
								</strong>{' '}
								If you do not agree to these Terms, you may not access or use
								the Service.
							</p>
						</div>

						<p>
							These Terms apply to all users of the Service, including without
							limitation users who are browsers, customers, and contributors of
							content.
						</p>
					</section>

					<section id='description'>
						<h2>Service Description</h2>
						<p>Our platform provides email automation services that include:</p>
						<ul>
							<li>Integration with your Gmail account via the Gmail API</li>
							<li>Automated email sending and follow-up sequences</li>
							<li>AI-powered email content generation using GPT technology</li>
							<li>Contact management and organization</li>
							<li>Reply tracking and sequence management via webhooks</li>
							<li>Email scheduling and queue management</li>
						</ul>

						<p>
							We reserve the right to modify, suspend, or discontinue any aspect
							of the Service at any time, with or without notice. We will not be
							liable to you or any third party for any modification, suspension,
							or discontinuance of the Service.
						</p>
					</section>

					<section id='account'>
						<h2>Account Registration</h2>

						<h3>Account Creation</h3>
						<p>To use our Service, you must:</p>
						<ul>
							<li>
								Create an account by providing accurate and complete information
							</li>
							<li>
								Be at least 18 years of age or the age of majority in your
								jurisdiction
							</li>
							<li>Have the legal capacity to enter into a binding contract</li>
							<li>Provide a valid email address that you own and control</li>
						</ul>

						<h3>Account Security</h3>
						<p>You are responsible for:</p>
						<ul>
							<li>
								Maintaining the confidentiality of your account credentials
							</li>
							<li>All activities that occur under your account</li>
							<li>
								Notifying us immediately of any unauthorized use of your account
							</li>
							<li>
								Ensuring your account information remains accurate and
								up-to-date
							</li>
						</ul>

						<h3>Account Restrictions</h3>
						<ul>
							<li>
								You may not create an account on behalf of another person
								without authorization
							</li>
							<li>
								You may not have more than one account unless expressly
								permitted
							</li>
							<li>
								You may not transfer or sell your account to another person
							</li>
							<li>
								You may not use false or misleading information when creating
								your account
							</li>
						</ul>
					</section>

					<section id='acceptable-use'>
						<h2>Acceptable Use Policy</h2>
						<p>
							You agree to use our Service only for lawful purposes and in
							accordance with these Terms. You agree not to use the Service:
						</p>

						<h3>Prohibited Activities</h3>
						<ul>
							<li>
								<strong>Spam:</strong> To send unsolicited bulk emails, spam, or
								any form of harassment
							</li>
							<li>
								<strong>Illegal Content:</strong> To transmit any content that
								is unlawful, harmful, threatening, abusive, defamatory, or
								otherwise objectionable
							</li>
							<li>
								<strong>Phishing:</strong> To impersonate any person or entity,
								or falsely state or misrepresent your affiliation with a person
								or entity
							</li>
							<li>
								<strong>Malware:</strong> To transmit viruses, malware, or any
								other malicious code
							</li>
							<li>
								<strong>Privacy Violations:</strong> To violate the privacy
								rights or other rights of third parties
							</li>
							<li>
								<strong>Fraud:</strong> To engage in any fraudulent, deceptive,
								or misleading practices
							</li>
							<li>
								<strong>Intellectual Property:</strong> To infringe upon the
								intellectual property rights of others
							</li>
							<li>
								<strong>System Interference:</strong> To interfere with or
								disrupt the Service or servers/networks connected to the Service
							</li>
						</ul>

						<h3>Email Sending Restrictions & Legal Compliance</h3>
						<div className={styles['warning-box']}>
							<p>
								<strong>Critical: Platform Limitations</strong>
							</p>
							<p>
								Our platform is a basic email sending tool that uses the Gmail
								API. We do NOT provide:
							</p>
							<ul>
								<li>Built-in unsubscribe mechanisms or links</li>
								<li>Compliance management features</li>
								<li>Spam prevention tools</li>
								<li>Consent tracking or opt-out management</li>
							</ul>
						</div>

						<p>
							<strong>
								You are solely and completely responsible for ensuring your use
								of this platform complies with all applicable anti-spam laws,
								including:
							</strong>
						</p>
						<ul>
							<li>CAN-SPAM Act (United States)</li>
							<li>GDPR (European Union)</li>
							<li>CASL (Canada)</li>
							<li>Any other applicable local laws and regulations</li>
						</ul>

						<p>
							<strong>Your Legal Obligations:</strong>
						</p>
						<p>When using our platform, you are responsible for:</p>
						<ul>
							<li>
								Obtaining proper consent before sending emails to recipients
							</li>
							<li>Providing accurate sender identification in your emails</li>
							<li>
								Including a valid unsubscribe method in your email content if
								required by law (you must create and manage this yourself - our
								platform does not provide this)
							</li>
							<li>
								Honoring all opt-out requests, including manually removing
								recipients from sequences
							</li>
							<li>Using truthful subject lines and headers</li>
							<li>Maintaining your own records of consent and opt-outs</li>
						</ul>

						<div className={styles['warning-box']}>
							<p>
								<strong>Important Limitation:</strong> While our platform will
								remove recipients from a sequence if they reply, this does NOT
								constitute an unsubscribe mechanism and does NOT prevent you
								from adding them to new sequences. You are responsible for
								tracking and honoring all opt-out requests and not re-contacting
								recipients who have opted out.
							</p>
						</div>

						<p>
							<strong>
								We do not monitor, enforce, or assist with your compliance.
							</strong>{' '}
							Failure to comply with applicable laws may result in legal action
							against you, suspension of your Gmail account by Google, and
							termination of your account with our Service.
						</p>

						<h3>Enforcement</h3>
						<p>
							We reserve the right to investigate and take appropriate action
							against anyone who, in our sole discretion, violates this
							Acceptable Use Policy, including without limitation removing
							content, suspending or terminating accounts, and reporting to law
							enforcement authorities.
						</p>
					</section>

					<section id='gmail-terms'>
						<h2>Gmail Integration Terms</h2>

						<h3>Authorization</h3>
						<p>
							By connecting your Gmail account to our Service, you authorize us
							to:
						</p>
						<ul>
							<li>Access your Gmail account via the Gmail API</li>
							<li>Send emails on your behalf through your Gmail account</li>
							<li>Monitor your replies folder for response tracking</li>
							<li>Manage and modify scheduled emails in your sequences</li>
						</ul>

						<h3>Gmail API Compliance</h3>
						<p>
							Our use of the Gmail API is subject to the{' '}
							<Link href='https://developers.google.com/terms/api-services-user-data-policy'>
								Google API Services User Data Policy
							</Link>
							, including the Limited Use requirements. You acknowledge that:
						</p>
						<ul>
							<li>
								Your Gmail data will only be used to provide the Service
								features you've requested
							</li>
							<li>
								We will not transfer your Gmail data to third parties except as
								necessary to provide the Service
							</li>
							<li>We will not use your Gmail data for advertising purposes</li>
						</ul>

						<h3>Your Gmail Responsibilities</h3>
						<p>You are solely responsible for:</p>
						<ul>
							<li>
								The content of emails sent through your Gmail account via our
								Service
							</li>
							<li>
								Compliance with Gmail's Terms of Service and Program Policies
							</li>
							<li>Maintaining the security of your Gmail account</li>
							<li>
								Any consequences resulting from emails sent through our Service
							</li>
						</ul>

						<div className={styles['warning-box']}>
							<p>
								<strong>Gmail Suspension Risk:</strong> Sending spam or
								violating Gmail's policies may result in the suspension or
								termination of your Gmail account by Google. We are not
								responsible for any such actions taken by Google.
							</p>
						</div>

						<h3>Revoking Access</h3>
						<p>
							You may revoke our access to your Gmail account at any time
							through your account settings or Google Account permissions.
							Revoking access will disable email sending and tracking features
							but will not terminate your account with our Service.
						</p>
					</section>

					<section id='content'>
						<h2>Your Content & Data</h2>

						<h3>Ownership</h3>
						<p>
							You retain all ownership rights to the content you create, upload,
							or transmit through our Service, including:
						</p>
						<ul>
							<li>Email content and templates</li>
							<li>Contact information and lists</li>
							<li>Any other data you input into the platform</li>
						</ul>

						<h3>License to Us</h3>
						<p>
							By using our Service, you grant us a limited, non-exclusive,
							royalty-free license to use, store, process, and transmit your
							content solely for the purpose of providing and improving the
							Service. This license ends when you delete your content or
							terminate your account.
						</p>

						<h3>AI-Generated Content</h3>
						<p>Content generated by our AI/GPT features:</p>
						<ul>
							<li>Is created based on your prompts and instructions</li>
							<li>Becomes your content once generated</li>
							<li>Is your responsibility to review before sending</li>
							<li>
								May not be unique and similar content could be generated for
								other users
							</li>
						</ul>

						<h3>Content Responsibility</h3>
						<p>You are solely responsible for:</p>
						<ul>
							<li>
								The accuracy, legality, and appropriateness of your content
							</li>
							<li>
								Ensuring you have necessary rights to use and share your content
							</li>
							<li>Reviewing AI-generated content before sending</li>
							<li>Any claims or legal issues arising from your content</li>
						</ul>

						<h3>Backup and Data Loss</h3>
						<p>
							While we implement backup procedures, you are responsible for
							maintaining your own backups of important data. We are not liable
							for any loss or corruption of your content.
						</p>
					</section>

					<section id='intellectual-property'>
						<h2>Intellectual Property</h2>

						<h3>Our Rights</h3>
						<p>
							The Service and its original content, features, and functionality
							are owned by Repliably and are protected by international
							copyright, trademark, patent, trade secret, and other intellectual
							property laws.
						</p>

						<p>
							Our trademarks, service marks, logos, and trade dress may not be
							used without our prior written permission. All other trademarks
							not owned by us that appear on the Service are the property of
							their respective owners.
						</p>

						<h3>Restrictions</h3>
						<p>You may not:</p>
						<ul>
							<li>Copy, modify, or create derivative works of the Service</li>
							<li>
								Reverse engineer, decompile, or disassemble any aspect of the
								Service
							</li>
							<li>
								Remove or alter any copyright, trademark, or other proprietary
								notices
							</li>
							<li>
								Use any robot, spider, scraper, or automated means to access the
								Service
							</li>
							<li>Frame or mirror any part of the Service</li>
						</ul>

						<h3>Feedback</h3>
						<p>
							If you provide us with any feedback, suggestions, or ideas about
							the Service, you grant us the right to use such feedback without
							any obligation to you.
						</p>
					</section>

					<section id='fees'>
						<h2>Fees & Payment</h2>

						<h3>Subscription Plans</h3>
						<p>
							Access to certain features of the Service may require payment of
							fees. Subscription plans and pricing are available on our website
							and may be changed at any time.
						</p>

						<h3>Payment Terms</h3>
						<ul>
							<li>
								<strong>Billing:</strong> Subscription fees are billed in
								advance on a recurring basis (monthly, annually, etc.)
							</li>
							<li>
								<strong>Payment Method:</strong> You must provide a valid
								payment method and authorize us to charge it
							</li>
							<li>
								<strong>Auto-Renewal:</strong> Subscriptions automatically renew
								unless canceled before the renewal date
							</li>
							<li>
								<strong>Price Changes:</strong> We may change our fees with 30
								days' notice
							</li>
						</ul>

						<h3>Refunds</h3>
						<p>
							Except as required by law, all fees are non-refundable. We do not
							provide refunds or credits for partial months of service or unused
							features.
						</p>

						<h3>Late Payments</h3>
						<p>
							If payment fails, we may suspend your access to paid features
							until payment is received. Continued failure to pay may result in
							account termination.
						</p>

						<h3>Taxes</h3>
						<p>
							Fees do not include applicable taxes. You are responsible for
							paying all taxes associated with your use of the Service.
						</p>
					</section>

					<section id='termination'>
						<h2>Termination</h2>

						<h3>Termination by You</h3>
						<p>You may terminate your account at any time by:</p>
						<ul>
							<li>
								Accessing your account settings and selecting the delete account
								option
							</li>
							<li>Contacting our support team</li>
						</ul>
						<p>
							Upon termination, your right to use the Service will immediately
							cease. Subscription fees are non-refundable.
						</p>

						<h3>Termination by Us</h3>
						<p>
							We may suspend or terminate your account immediately, without
							prior notice or liability, for any reason, including but not
							limited to:
						</p>
						<ul>
							<li>Violation of these Terms</li>
							<li>Violation of our Acceptable Use Policy</li>
							<li>Fraudulent, abusive, or illegal activity</li>
							<li>Non-payment of fees</li>
							<li>Extended periods of inactivity</li>
						</ul>

						<h3>Effect of Termination</h3>
						<p>Upon termination:</p>
						<ul>
							<li>Your access to the Service will be immediately disabled</li>
							<li>Scheduled emails will be canceled</li>
							<li>Gmail API access will be revoked</li>
							<li>
								Your data will be deleted in accordance with our Privacy Policy
							</li>
							<li>
								Provisions that should survive termination (warranties,
								disclaimers, limitations of liability) will remain in effect
							</li>
						</ul>

						<h3>Data Export</h3>
						<p>
							We recommend exporting your data before terminating your account.
							After termination, we may not be able to recover your data.
						</p>
					</section>

					<section id='warranties'>
						<h2>Warranties & Disclaimers</h2>

						<h3>As-Is Basis</h3>
						<div className={styles['warning-box']}>
							<p>
								<strong>IMPORTANT:</strong> THE SERVICE IS PROVIDED ON AN "AS
								IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND,
								EITHER EXPRESS OR IMPLIED.
							</p>
						</div>

						<p>We disclaim all warranties, including but not limited to:</p>
						<ul>
							<li>
								Warranties of merchantability, fitness for a particular purpose,
								and non-infringement
							</li>
							<li>
								Warranties that the Service will be uninterrupted, secure, or
								error-free
							</li>
							<li>
								Warranties regarding the accuracy, reliability, or completeness
								of content
							</li>
							<li>Warranties that defects will be corrected</li>
						</ul>

						<h3>AI-Generated Content</h3>
						<p>
							We make no warranties regarding AI-generated content, including:
						</p>
						<ul>
							<li>
								Accuracy, appropriateness, or quality of generated content
							</li>
							<li>Compliance with any specific style or requirements</li>
							<li>Freedom from errors, bias, or offensive content</li>
						</ul>
						<p>
							You are solely responsible for reviewing and approving all
							AI-generated content before use.
						</p>

						<h3>Third-Party Services</h3>
						<p>
							We are not responsible for the availability, accuracy, or content
							of third-party services, including Gmail and OpenAI. Your use of
							such services is governed by their respective terms and policies.
						</p>

						<h3>Email Deliverability</h3>
						<p>
							We do not guarantee that emails sent through our Service will be
							delivered, accepted by recipients' mail servers, or not marked as
							spam. Email deliverability depends on many factors outside our
							control.
						</p>
					</section>

					<section id='limitation'>
						<h2>Limitation of Liability</h2>

						<div className={styles['warning-box']}>
							<p>
								<strong>
									TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL
									REPLIABLY, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE
									LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
									OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:
								</strong>
							</p>
							<ul>
								<li>Loss of profits, data, use, or goodwill</li>
								<li>Business interruption</li>
								<li>Service failures or interruptions</li>
								<li>Unauthorized access to or alteration of your content</li>
								<li>Statements or conduct of any third party on the Service</li>
								<li>Gmail account suspension or termination by Google</li>
							</ul>
						</div>

						<h3>Maximum Liability</h3>
						<p>
							Our total liability to you for all claims arising out of or
							relating to these Terms or the Service shall not exceed the
							greater of:
						</p>
						<ul>
							<li>
								The amount you paid us in the twelve (12) months preceding the
								claim, or
							</li>
							<li>One hundred dollars ($100)</li>
						</ul>

						<h3>Basis of the Bargain</h3>
						<p>
							These limitations of liability reflect the allocation of risk
							between the parties. The limitations will apply even if any
							limited remedy fails of its essential purpose.
						</p>

						<h3>Jurisdictional Limitations</h3>
						<p>
							Some jurisdictions do not allow the exclusion or limitation of
							incidental or consequential damages, so the above limitations may
							not apply to you.
						</p>
					</section>

					<section id='indemnification'>
						<h2>Indemnification</h2>
						<p>
							You agree to defend, indemnify, and hold harmless Repliably, its
							affiliates, and their respective directors, officers, employees,
							and agents from and against any claims, liabilities, damages,
							losses, and expenses, including reasonable attorneys' fees,
							arising out of or in any way connected with:
						</p>
						<ul>
							<li>Your access to or use of the Service</li>
							<li>Your violation of these Terms</li>
							<li>
								Your violation of any third-party right, including intellectual
								property, privacy, or publicity rights
							</li>
							<li>Content you submit, post, or transmit through the Service</li>
							<li>Emails sent through your Gmail account via our Service</li>
							<li>
								Any claim that your content caused damage to a third party
							</li>
							<li>Your violation of any laws or regulations</li>
						</ul>

						<p>
							We reserve the right to assume exclusive defense and control of
							any matter subject to indemnification by you, in which event you
							will cooperate in asserting any available defenses.
						</p>
					</section>

					<section id='changes'>
						<h2>Changes to Terms</h2>
						<p>
							We reserve the right to modify or replace these Terms at any time
							at our sole discretion.
						</p>

						<h3>Notice of Changes</h3>
						<p>If we make material changes, we will:</p>
						<ul>
							<li>Update the "Last Updated" date at the top of these Terms</li>
							<li>
								Send you an email notification to your registered email address
							</li>
							<li>Display a prominent notice within the Service</li>
						</ul>

						<h3>Continued Use</h3>
						<p>
							Your continued use of the Service after any changes to these Terms
							constitutes your acceptance of the new Terms. If you do not agree
							to the revised Terms, you must stop using the Service.
						</p>

						<h3>Review Terms Regularly</h3>
						<p>
							We encourage you to review these Terms periodically. It is your
							responsibility to check these Terms for changes.
						</p>
					</section>

					<section id='general'>
						<h2>General Provisions</h2>

						<h3>Governing Law</h3>
						<p>
							These Terms shall be governed by and construed in accordance with
							the laws of [Your State/Country], without regard to its conflict
							of law provisions.
						</p>

						<h3>Dispute Resolution</h3>
						<p>
							Any disputes arising out of or relating to these Terms or the
							Service shall be resolved through binding arbitration in
							accordance with the rules of [Arbitration Organization], except
							that either party may seek injunctive relief in court.
						</p>

						<h3>Severability</h3>
						<p>
							If any provision of these Terms is held to be invalid or
							unenforceable, the remaining provisions will continue in full
							force and effect.
						</p>

						<h3>Waiver</h3>
						<p>
							Our failure to enforce any right or provision of these Terms will
							not be deemed a waiver of such right or provision.
						</p>

						<h3>Assignment</h3>
						<p>
							You may not assign or transfer these Terms or your rights under
							these Terms without our prior written consent. We may assign our
							rights and obligations under these Terms without restriction.
						</p>

						<h3>Entire Agreement</h3>
						<p>
							These Terms, together with our Privacy Policy, constitute the
							entire agreement between you and us regarding the Service and
							supersede all prior agreements and understandings.
						</p>

						<h3>Third-Party Beneficiaries</h3>
						<p>These Terms do not create any third-party beneficiary rights.</p>
					</section>

					<section id='contact'>
						<h2>Contact Information</h2>
						<p>
							If you have any questions about these Terms of Service, please
							contact us:
						</p>

						<div className={styles['contact-info']}>
							<h3>Get In Touch</h3>
							<p>
								<strong>Email:</strong>{' '}
								<Link href='mailto:contact@repliably.com'>
									contact@repliably.com
								</Link>
							</p>
							<p>
								<strong>Support:</strong>{' '}
								<Link href='mailto:support@repliably.com'>
									support@repliably.com
								</Link>
							</p>
							{/* <p>
								<strong>Address:</strong> Repliably Address]
							</p> */}

							<p>
								We aim to respond to all legal inquiries within 5 business days.
							</p>
						</div>
					</section>
				</main>

				<footer>
					<p>&copy; 2026 Repliably. All rights reserved.</p>
					<p>
						<Link href='/privacy'>Privacy Policy</Link>
					</p>
				</footer>
			</div>
		</div>
	);
};

export default Page;
