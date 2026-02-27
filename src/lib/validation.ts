import { z } from 'zod';

/**
 * Validation schemas for user settings updates
 */

// Account Settings Schema (includes sending preferences)
export const accountSettingsSchema = z.object({
	firstName: z
		.string()
		.min(1, 'First name is required')
		.max(50, 'First name must be less than 50 characters')
		.regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
		.transform((val) => val.trim())
		.optional(),
	lastName: z
		.string()
		.min(1, 'Last name is required')
		.max(50, 'Last name must be less than 50 characters')
		.regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
		.transform((val) => val.trim())
		.optional(),
	timezone: z
		.string()
		.refine(
			(tz) => {
				const validTimezones = Intl.supportedValuesOf('timeZone');
				return validTimezones.includes(tz);
			},
			{ message: 'Invalid timezone' },
		)
		.optional(),
	// Sending Preferences (part of user table)
	trackEmailOpens: z.boolean().optional(),
	trackLinkClicks: z.boolean().optional(),
	// Notification Settings (part of user table)
	notificationBounce: z.boolean().optional(),
	notificationSendFailure: z.boolean().optional(),
	notificationSequenceComplete: z.boolean().optional(),
	notificationMessageApproval: z.boolean().optional(),
	// Sequence Defaults (part of user table)
	defaultRequireApproval: z.boolean().optional(),
	defaultSequenceDuration: z.number().int().nullable().optional(),
	defaultReferencePrevious: z.boolean().optional(),
	defaultAlterSubjectLine: z.boolean().optional(),
	defaultSendDelay: z.number().int().min(0).nullable().optional(),
	defaultSequenceType: z
		.union([
			z.literal(3),
			z.literal(7),
			z.literal(14),
			z.literal(28),
			z.literal(31),
		])
		.nullable()
		.optional(),
});

// Signature Schema (for updates - all fields optional)
export const signatureSchema = z.object({
	name: z.string().min(1).max(50).optional(),
	content: z.string().max(500).optional(),
	isDefault: z.boolean().optional(),
});

// Signature Creation Schema (name and content required)
export const createSignatureSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(50, 'Name must be less than 50 characters'),
	content: z
		.string()
		.min(1, 'Content is required')
		.max(500, 'Content must be less than 500 characters'),
	isDefault: z.boolean().optional(),
});

// Message Update Schema
export const messageUpdateSchema = z.object({
	subject: z
		.string()
		.min(1, 'Subject line is required')
		.max(500, 'Subject line must be less than 500 characters'),
	contents: z
		.string()
		.min(1, 'Message content is required')
		.max(5000, 'Message content must be less than 5000 characters'),
});

// Send Email Schema - matches StoredEmailData interface
export const sendEmailSchema = z.object({
	to: z.email('Invalid recipient email address'),
	subject: z
		.string()
		.min(1, 'Subject line is required')
		.max(200, 'Subject line must be less than 200 characters'),
	body: z
		.string()
		.min(1, 'Email body is required')
		.max(4500, 'Email body must be less than 4500 characters'),
	autoSend: z.boolean(),
	cadenceType: z.enum(
		['none', '1day', '3day', '31day', 'weekly', 'biweekly', 'monthly'],
		{
			message: 'Invalid cadence type',
		},
	),
	// autoSendDelay can be 'never', '', or a string number - storeSentEmail expects string
	autoSendDelay: z.string().optional(),
	// cadenceDuration is a string like '30', '60', '90', 'indefinite'
	cadenceDuration: z.string(),
	override: z.boolean().optional(),
	referencePreviousEmail: z.boolean().nullable().optional(),
	alterSubjectLine: z.boolean().nullable().optional(),
	activeSequenceId: z.number().int().positive().optional(),
});

export const waitlistEmailSchema = z.object({
	email: z.email('Invalid email address'),
});

// Types
export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
export type SignatureInput = z.infer<typeof signatureSchema>;
export type EmailSendInput = z.infer<typeof sendEmailSchema>;
export type WaitlistEmailInput = z.infer<typeof waitlistEmailSchema>;
