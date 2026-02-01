import { prisma } from '@/lib/prisma';

/**
 * Audit action constants for consistency across the application.
 */
export const AUDIT_ACTIONS = {
	// Webhook events
	WEBHOOK_RECEIVED: 'webhook.received',
	WEBHOOK_REJECTED: 'webhook.rejected',
	WEBHOOK_RATE_LIMITED: 'webhook.rate_limited',

	// Email actions
	EMAIL_SEND: 'email.send',
	EMAIL_SEND_FAILED: 'email.send_failed',

	// Contact actions
	CONTACT_CREATE: 'contact.create',
	CONTACT_UPDATE: 'contact.update',
	CONTACT_DELETE: 'contact.delete',

	// Sequence actions
	SEQUENCE_CREATE: 'sequence.create',
	SEQUENCE_UPDATE: 'sequence.update',
	SEQUENCE_DELETE: 'sequence.delete',
	SEQUENCE_DEACTIVATE: 'sequence.deactivate',

	// Message actions
	MESSAGE_APPROVE: 'message.approve',
	MESSAGE_CREATE: 'message.create',

	// Rate limiting
	RATE_LIMITED: 'rate_limited',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type ActorType = 'user' | 'system' | 'webhook' | 'cron';

export interface AuditOptions {
	userId?: number | null;
	actorType: ActorType;
	actorIp?: string | null;
	action: AuditAction;
	resource: string;
	resourceId?: string | null;
	details?: Record<string, unknown> | null;
	status?: 'success' | 'failure';
	errorMsg?: string | null;
	userAgent?: string | null;
	requestId?: string | null;
}

/**
 * Core audit logging function.
 * Logs an audit entry to the database.
 */
export async function audit(options: AuditOptions): Promise<void> {
	try {
		await prisma.auditLog.create({
			data: {
				userId: options.userId ?? null,
				actorType: options.actorType,
				actorIp: options.actorIp ?? null,
				action: options.action,
				resource: options.resource,
				resourceId: options.resourceId ?? null,
				details: options.details ?? null,
				status: options.status ?? 'success',
				errorMsg: options.errorMsg ?? null,
				userAgent: options.userAgent ?? null,
				requestId: options.requestId ?? null,
			},
		});
	} catch (error) {
		// Log to console but don't throw - audit failures shouldn't break requests
		console.error('Failed to write audit log:', error);
	}
}

/**
 * Helper for logging user-initiated actions.
 */
export async function auditUserAction(
	request: Request,
	userId: number,
	action: AuditAction,
	resource: string,
	resourceId?: string | number | null,
	details?: Record<string, unknown> | null,
	status: 'success' | 'failure' = 'success',
	errorMsg?: string | null
): Promise<void> {
	const forwardedFor = request.headers.get('x-forwarded-for');
	const actorIp = forwardedFor
		? forwardedFor.split(',')[0].trim()
		: request.headers.get('x-real-ip') ?? null;

	await audit({
		userId,
		actorType: 'user',
		actorIp,
		action,
		resource,
		resourceId: resourceId != null ? String(resourceId) : null,
		details,
		status,
		errorMsg,
		userAgent: request.headers.get('user-agent'),
		requestId: request.headers.get('x-request-id'),
	});
}

/**
 * Helper for logging webhook events.
 */
export async function auditWebhook(
	request: Request,
	action: AuditAction,
	details?: Record<string, unknown> | null,
	status: 'success' | 'failure' = 'success',
	errorMsg?: string | null
): Promise<void> {
	const forwardedFor = request.headers.get('x-forwarded-for');
	const actorIp = forwardedFor
		? forwardedFor.split(',')[0].trim()
		: request.headers.get('x-real-ip') ?? null;

	await audit({
		userId: null,
		actorType: 'webhook',
		actorIp,
		action,
		resource: 'webhook',
		resourceId: null,
		details,
		status,
		errorMsg,
		userAgent: request.headers.get('user-agent'),
		requestId: request.headers.get('x-request-id'),
	});
}
