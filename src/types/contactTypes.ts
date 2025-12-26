export interface ContactFormData {
	firstName: string;
	lastName: string;
	company: string;
	title: string;
	email: string;
	phone: string;
	linkedIn: string;
	importance: string;
	associatedRole: string;
}

export interface ContactData {
	firstName: string;
	lastName: string;
	company?: string;
	title?: string;
	email: string;
	phone?: string;
	linkedIn?: string;
	importance?: string;
	associatedRole?: string;
}

export interface ContactResponse {
	success: boolean;
	duplicate?: boolean;
	existingContact?: {
		id: number;
		firstName: string;
		lastName: string;
		company: string;
		title: string;
		email: string;
		phone: string;
		linkedIn: string;
		importance: number;
		associatedRole: string;
	};
	contact: {
		id: number;
		firstName: string;
		lastName: string;
		company?: string;
		title?: string;
		email: string;
		phone?: string;
		linkedIn?: string;
		importance?: number;
		associatedRole?: string;
		createdAt: string;
		updatedAt: string;
	};
}

export interface ContactUpdateData {
	id: number;
	firstName?: string;
	lastName?: string;
	company?: string;
	title?: string;
	email?: string;
	phone?: string;
	linkedIn?: string;
	importance?: string;
	associatedRole?: string;
}
