'use client';

// Library imports
import { useState, Fragment } from 'react';
import Link from 'next/link';

// Styles imports
import styles from './masterTable.module.scss';

// Helper functions imports
import { parseEmailContent } from '@/lib/helpers/emailHelpers';

// Components imports
import TableHeader from './TableHeader';
import NestedTable from './NestedTable';

// Types imports
import { MasterTableData } from '@/types/masterTableTypes';

const MasterTable = ({
	multiPage = false,
	parentDiv,
	inModal,
	tableData,
	tableType,
	tableSize,
}: {
	multiPage?: boolean;
	parentDiv?: string;
	inModal?: boolean;
	tableData: MasterTableData;
	tableType:
		| 'contacts'
		| 'activeSequence'
		| 'previousSequences'
		| 'allActivities'
		| 'replies'
		| 'pendingEmails';
	tableSize: number;
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

	const parsedTableType = parseTableType(tableType);

	const handleSort = (type: string) => {
		if (sortType === type) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortType(type);
			setSortOrder('asc');
		}
	};

	const handleClick = (rowId: number) => {
		const selection = window.getSelection();
		if (selection && selection.toString().length > 0) {
			return;
		}

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
				<p>No {parsedTableType} found</p>
			</div>
		);

	const { columnHeaders } = tableData;

	const fillerRows = sortedRowData.length > 0 && sortedRowData.length < 10;

	// If there are less than 10 rows, add empty rows to maintain table structure and height for better UX
	const fillerRowCount = fillerRows ? 10 - sortedRowData.length : 0;

	return (
		<table
			className={`${styles['master-table']} ${inModal ? styles.inModal : ''} ${parentDiv === 'DashboardClient' ? styles.dashboardTable : ''}`}
			role='table'
			aria-label={`${parsedTableType} table`}
			aria-rowcount={sortedRowData.length + 1}
		>
			<TableHeader columnHeaders={columnHeaders} handleSort={handleSort} />
			<tbody
				className={`${styles.tableBody} ${multiPage ? styles.multiPage : ''} ${fillerRows ? styles.fillerRows : ''}`}
			>
				{sortedRowData.map((row, rowIndex) => {
					const nestedRowData = row.nestedData?.value ?? null;
					const isExpanded = selectedRow === row.rowId;

					return nestedRowData ?
							<Fragment key={row.rowId}>
								<tr
									className={`
								${selectedRow === row.rowId ? styles.selected : ''} 
								${styles.bodyRow} ${row.rowStyling ? styles[row.rowStyling] : ''}
							`}
									onClick={() => handleClick(row.rowId)}
									role='row'
									aria-expanded={isExpanded}
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
													key={`nestedCellMaster-${cellIndex}`}
													className={`${styles[cell.size]} ${cell.cellStyling ? styles[cell.cellStyling] : ''} ${styles['content-cell']}`}
													role='cell'
													aria-colindex={cellIndex + 1}
												>
													<div className={styles['parsed-content']}>
														<div className={styles['message-preview']}>
															{parsedContent[0]}
														</div>
														{parsedContent.length > 1 &&
															parsedContent
																.slice(1)
																.map((text: string, index: number) => (
																	<div key={index}>{text}</div>
																))}
													</div>
												</td>
											:	<td
													key={`nestedCellMaster-${cellIndex}`}
													className={`${styles[cell.size]} ${cell.cellStyling ? styles[cell.cellStyling] : ''} ${cell.cellOrientation ? styles[cell.cellOrientation] : ''} ${cell.value === 'N/A' ? styles.transparent : ''}`}
													role='cell'
													aria-colindex={cellIndex + 1}
												>
													{cell.isDate ?
														new Date(cell.value as string).toLocaleDateString()
													: cell.isLink ?
														<Link
															href={cell.href}
															onClick={(e) => {
																e.stopPropagation();
															}}
														>
															{cell.value}
														</Link>
													:	cell.value}
												</td>;
									})}
								</tr>
								{isExpanded && (
									<tr
										className={`${styles['expanded-row']} ${
											selectedRow === row.rowId ? styles.selected : ''
										} ${styles.bodyRow}`}
										role='row'
										aria-label='Expanded row details'
									>
										<td colSpan={tableSize} role='cell'>
											<NestedTable
												inModal={inModal}
												tableData={nestedRowData}
												tableType={tableType}
											/>
										</td>
									</tr>
								)}
							</Fragment>
						:	<tr
								key={row.rowId}
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
												key={`nestedCellMaster-${cellIndex}`}
												className={`${styles[cell.size]} ${cell.cellStyling ? styles[cell.cellStyling] : ''} ${styles['content-cell']}`}
												role='cell'
												aria-colindex={cellIndex + 1}
											>
												<div className={styles['parsed-content']}>
													<div
														className={`
														${styles['message-preview']} 
														${
															(
																cell.subjectContentCell &&
																row.rowStyling !== 'cancelled'
															) ?
																styles.subject
															:	''
														}
														`}
													>
														{parsedContent[0]}
													</div>
													{selectedRow === row.rowId &&
														parsedContent.length > 1 &&
														parsedContent
															.slice(1)
															.map((text: string, index: number) => {
																return (
																	<div
																		key={`nestedCellMaster-${cellIndex}-parsed-${index}`}
																	>
																		{text || '\u00A0'}
																	</div>
																);
															})}
												</div>
											</td>
										:	<td
												key={`nestedCellMaster-${cellIndex}`}
												className={`${styles[cell.size]}  ${cell.cellStyling ? styles[cell.cellStyling] : ''} ${cell.cellOrientation ? styles[cell.cellOrientation] : ''} ${cell.value === 'N/A' ? styles.transparent : ''}`}
												role='cell'
												aria-colindex={cellIndex + 1}
											>
												{cell.isDate ?
													new Date(cell.value as string).toLocaleDateString()
												: cell.isLink ?
													<Link
														href={cell.href}
														onClick={(e) => {
															e.stopPropagation();
														}}
													>
														{cell.value}
													</Link>
												:	cell.value}
											</td>;
								})}
							</tr>;
				})}
				{Array.from({ length: fillerRowCount }).map((_, index) => (
					<tr
						key={`empty-row-${index}`}
						className={`${styles.fillerRow} `}
						aria-hidden='true'
						tabIndex={-1}
					>
						<td colSpan={tableSize} />
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default MasterTable;
