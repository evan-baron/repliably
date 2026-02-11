'use client';

// Library imports
import { useState } from 'react';

// Styles imports
import styles from './masterTable.module.scss';

// Helper functions imports
import { parseEmailContent } from '@/lib/helpers/emailHelpers';

// Components imports
import TableHeader from './TableHeader';

// Types imports
import { MasterTableData } from '@/types/masterTableTypes';

const NestedTable = ({
	inModal,
	tableData,
	tableType,
}: {
	inModal?: boolean;
	tableData: MasterTableData;
	tableType:
		| 'contacts'
		| 'activeSequence'
		| 'previousSequences'
		| 'allActivities'
		| 'replies'
		| 'pendingEmails';
}) => {
	const [sortType, setSortType] = useState<string | null>(null);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [selectedRow, setSelectedRow] = useState<number | null>(null);

	const parseTableType = (type: string) => {
		switch (type) {
			case 'contacts':
				return 'contacts';
			case 'activeSequence':
				return 'active sequences';
			case 'previousSequences':
				return 'previous sequences';
			case 'allActivities':
				return 'activities';
			case 'replies':
				return 'replies';
			case 'pendingEmails':
				return 'pending emails';
			default:
				return 'items';
		}
	};

	const handleSort = (type: string) => {
		if (sortType === type) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortType(type);
			setSortOrder('asc');
		}
	};

	const handleClick = (rowId: number) => {
		if (selectedRow === rowId) {
			setSelectedRow(null);
			return;
		}

		setSelectedRow(rowId);
	};

	const sortedRowData = tableData.rowData.sort((a, b) => {
		const sortIndex = tableData.columnHeaders.findIndex(
			(header) => header.label === sortType,
		);

		if (!sortType) return 0;
		const valA = (a.cellData[sortIndex]?.value || '').toString().toLowerCase();
		const valB = (b.cellData[sortIndex]?.value || '').toString().toLowerCase();
		if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
		if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
		return 0;
	});

	if (!tableData.rowData.length)
		return (
			<div className={styles.activity}>
				<p>No {parseTableType(tableType)} found</p>
			</div>
		);

	const { columnHeaders } = tableData;
	const parsedTableType = parseTableType(tableType);

	return (
		<table
			className={`${styles['nested-table']} ${inModal ? styles.inModal : ''}`}
			role='table'
			aria-label={`Nested ${parsedTableType} details`}
			aria-rowcount={sortedRowData.length + 1}
		>
			<TableHeader columnHeaders={columnHeaders} handleSort={handleSort} />
			<tbody className={styles.tableBody}>
				{sortedRowData.map((row, rowIndex) => {
					const isExpanded = selectedRow === row.rowId;

					return (
						<tr
							key={`nestedRowNested-${rowIndex}`}
							className={`${styles.bodyRow} ${
								row.rowStyling ? styles[row.rowStyling] : ''
							}`}
							onClick={() => handleClick(row.rowId)}
							role='row'
							aria-rowindex={rowIndex + 2}
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleClick(row.rowId);
								}
							}}
						>
							{row.cellData.map((cell: any, cellIndex: number) => {
								const parsedContent =
									cell.contentCell && parseEmailContent(cell.value);

								return cell.contentCell ?
										<td
											key={`nestedCellNested-${cellIndex}`}
											className={`${styles[cell.size]} ${
												cell.cellStyling ? styles[cell.cellStyling] : ''
											} ${styles['content-cell']}`}
											role='cell'
											aria-colindex={cellIndex + 1}
										>
											<div className={styles['parsed-content']}>
												<div
													className={`${styles['message-preview']} ${
														(
															cell.subjectContentCell &&
															row.rowStyling !== 'cancelled'
														) ?
															styles.subject
														:	''
													}`}
												>
													{parsedContent[0]}
												</div>
												{isExpanded &&
													parsedContent.length > 1 &&
													parsedContent
														.slice(1)
														.map((text: string, index: number) => (
															<div key={index}>{text || '\u00A0'}</div>
														))}
											</div>
										</td>
									:	<td
											key={`nestedCellNested-${cellIndex}`}
											className={`${styles[cell.size]} ${
												cell.cellStyling ? styles[cell.cellStyling] : ''
											} ${
												cell.cellOrientation ? styles[cell.cellOrientation] : ''
											}`}
											role='cell'
											aria-colindex={cellIndex + 1}
										>
											{cell.value}
										</td>;
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default NestedTable;
