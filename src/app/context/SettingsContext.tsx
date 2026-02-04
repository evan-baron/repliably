'use client';

// Libraries imports
import { createContext, useContext, useState, ReactNode } from 'react';

type SettingsTab =
	| 'account'
	| 'email'
	| 'sequences'
	| 'notifications'
	| 'display';

interface SettingsContextType {
	activeTab: SettingsTab;
	setActiveTab: (tab: SettingsTab) => void;
	hasUnsavedChanges: boolean;
	setHasUnsavedChanges: (hasChanges: boolean) => void;
	settingsError: string | null;
	setSettingsError: (error: string | null) => void;
	isSaving: boolean;
	setIsSaving: (saving: boolean) => void;
	clearSettingsContext: () => void;
	resetForm: boolean;
	setResetForm: (reset: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

export const SettingsContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [activeTab, setActiveTab] = useState<SettingsTab>('account');
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
	const [settingsError, setSettingsError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [resetForm, setResetForm] = useState<boolean>(false);

	const clearSettingsContext = () => {
		setActiveTab('account');
		setHasUnsavedChanges(false);
		setSettingsError(null);
		setIsSaving(false);
		setResetForm(false);
	};

	return (
		<SettingsContext.Provider
			value={{
				activeTab,
				setActiveTab,
				hasUnsavedChanges,
				setHasUnsavedChanges,
				settingsError,
				setSettingsError,
				isSaving,
				setIsSaving,
				clearSettingsContext,
				resetForm,
				setResetForm,
			}}
		>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettingsContext = (): SettingsContextType => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error(
			'useSettingsContext must be used within a SettingsContextProvider',
		);
	}
	return context;
};
