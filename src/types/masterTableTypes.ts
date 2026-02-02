type ColumnHeader = {
	label: string;
	size: string;
	sortable?: boolean;
	sortableType?: string;
};

type CellValue = string | number | Date | null;

type CellSize = 'lrg' | 'sm' | 'md' | string;

export type CellStyling =
	| 'bold'
	| 'italic'
	| 'pending'
	| 'scheduled'
	| 'transparent'
	| 'link'
	| null;

export type CellOrientation = 'left' | 'center' | 'right' | null;

type CellData = {
	value: CellValue;
	size: CellSize;
	cellStyling?: CellStyling;
	cellOrientation?: CellOrientation;
	contentCell?: boolean;
	subjectContentCell?: boolean;
	isDate?: boolean;
};

type NestedData = {
	value: MasterTableData | null;
};

type RowStyling = 'scheduled' | 'pending' | 'cancelled' | 'processed' | null;

type RowData = {
	rowId: number;
	cellData: CellData[];
	nestedData?: NestedData;
	rowStyling?: RowStyling;
};

export interface MasterTableData {
	columnHeaders: ColumnHeader[];
	rowData: RowData[];
}
