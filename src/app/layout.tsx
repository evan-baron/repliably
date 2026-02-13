import type { Metadata, Viewport } from 'next';

import AppProviders from './AppProviders';

// Styles imports
import './reset.css';
import './globals.scss';

export const metadata: Metadata = {
	metadataBase: new URL('https://www.repliably.com'),
	title: 'Repliably | Email Automation for the Modern Job Seeker',
	description:
		'Repliably is an email automation tool designed to help job seekers manage their job applications and follow-ups efficiently. With Repliably, you can create personalized email templates, schedule automated follow-ups, and track your email outreach data all in one place. Say goodbye to manual emailing and hello to a more sophisticated strategy with Repliably.',

	openGraph: {
		title: 'Repliably | Email Automation for the Modern Job Seeker',
		description:
			'Repliably is an email automation tool designed to help job seekers manage their job applications and follow-ups efficiently. With Repliably, you can create personalized email templates, schedule automated follow-ups, and track your email outreach data all in one place. Say goodbye to manual emailing and hello to a more sophisticated strategy with Repliably.',
		url: 'https://www.repliably.com',
		siteName: 'Repliably',
		images: [
			{
				url: '/og-image.jpg',
				width: 1200,
				height: 630,
				alt: 'Repliably - Email Automation for the Modern Job Seeker',
			},
		],
		locale: 'en_US',
		type: 'website',
	},

	twitter: {
		card: 'summary_large_image',
		title: 'Repliably | Email Automation for the Modern Job Seeker',
		description:
			'Repliably is an email automation tool designed to help job seekers manage their job applications and follow-ups efficiently. With Repliably, you can create personalized email templates, schedule automated follow-ups, and track your email outreach data all in one place. Say goodbye to manual emailing and hello to a more sophisticated strategy with Repliably.',
		images: ['/og-image.jpg'],
	},

	keywords: [
		'email automation',
		'job seekers',
		'personalized email templates',
		'scheduled follow-ups',
		'email outreach tracking',
		'productivity tools',
		'reply all',
		'reply automation',
	],
	authors: [{ name: 'Repliably' }],
	creator: 'Repliably',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},

	icons: [
		{
			url: '/favicon.ico',
			type: 'image/x-icon',
		},
		{
			url: '/favicon-16x16.png',
			type: 'image/png',
			sizes: '16x16',
		},
		{
			url: '/favicon-32x32.png',
			type: 'image/png',
			sizes: '32x32',
		},
	],
};

const structuredData = {
	'@context': 'https://schema.org',
	'@type': 'ProfessionalService',
	name: 'Repliably',
	description:
		'Repliably is an email automation tool designed to help job seekers manage their job applications and follow-ups efficiently. With Repliably, you can create personalized email templates, schedule automated follow-ups, and track your email outreach data all in one place. Say goodbye to manual emailing and hello to a more sophisticated strategy with Repliably.',
	url: 'https://www.repliably.com',
	email: 'support@repliably.com',
	telephone: '720-727-7834',
	founder: {
		'@type': 'Person',
		name: 'Evan Baron',
	},
	address: {
		'@type': 'PostalAddress',
		addressCountry: 'USA',
		addressLocality: 'Denver',
		addressRegion: 'CO',
		postalCode: '80202',
	},
	serviceType: [
		'Email Automation',
		'Job Application Management',
		'Productivity Tools',
	],
	areaServed: 'USA',
	image: 'https://www.repliably.com/og-image.webp',
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<head>
				<meta
					name='google-site-verification'
					content='blZZaTve9mPeKsgVj96k--eIypYf76168hGT4mz5Hk4'
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>
			</head>
			<body>
				<AppProviders>
					<div id='root' role='application'>
						{children}
					</div>
					<div id='modal-root' aria-live='polite' aria-atomic='true'></div>
				</AppProviders>
			</body>
		</html>
	);
}
