import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { FilePdf, FileXls, FileCsv, Image as ImageIcon } from '@phosphor-icons/react';

const ExportButtons = ({ data, columns, filename = 'Report', title = 'Report', tableId }) => {
    
    // EXPORT TO PDF
    const exportPDF = () => {
        if (!data || !columns) return;
        const doc = new jsPDF();
        
        doc.setFontSize(14);
        doc.text(title, 14, 20);
        
        const tableColumns = columns.map(col => col.header);
        const tableRows = data.map(row => columns.map(col => row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : ''));

        autoTable(doc, {
            startY: 25,
            head: [tableColumns],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`${filename}.pdf`);
    };

    // EXPORT TO EXCEL
    const exportExcel = async () => {
        if (!data || !columns) return;
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Title Row
        const numColumns = columns.length;
        worksheet.mergeCells(`A1:${String.fromCharCode(64 + numColumns)}1`);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = title;
        titleCell.font = { size: 14, bold: true };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Empty Row
        worksheet.addRow([]);

        // Header Row
        const headerRow = worksheet.addRow(columns.map(col => col.header));
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2980B9' } // Blue theme
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Data Rows
        data.forEach(row => {
            const rowData = columns.map(col => row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '');
            const dataRow = worksheet.addRow(rowData);
            dataRow.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Auto fit columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
                if(rowNumber > 2) { // Skip title and empty row
                    const columnLength = cell.value ? cell.value.toString().length : 0;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${filename}.xlsx`);
    };

    // EXPORT TO CSV
    const exportCSV = () => {
        if (!data || !columns) return;
        const worksheetData = [
            [title],
            [], // Empty row for spacing
            columns.map(col => col.header),
            ...data.map(row => columns.map(col => row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : ''))
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${filename}.csv`, { bookType: "csv" });
    };

    // EXPORT TO PNG
    const exportPNG = async () => {
        if (!tableId) {
            alert("PNG export requires a table element to capture.");
            return;
        }
        const element = document.getElementById(tableId);
        if (!element) {
            alert("Table not found on screen.");
            return;
        }
        
        // Hide pagination or controls if needed, but for now we capture the raw table.
        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `${filename}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Failed to export PNG", err);
            alert("Failed to capture PNG image.");
        }
    };

    return (
        <div className="d-flex tw-gap-2 tw-flex-wrap">
            <button onClick={exportPDF} className="btn btn-sm btn-danger d-flex align-items-center tw-gap-1" title="Export as PDF">
                <FilePdf size={16} /> PDF
            </button>
            <button onClick={exportExcel} className="btn btn-sm btn-success d-flex align-items-center tw-gap-1" title="Export as Excel">
                <FileXls size={16} /> Excel
            </button>
            <button onClick={exportCSV} className="btn btn-sm btn-info tw-text-white d-flex align-items-center tw-gap-1" title="Export as CSV">
                <FileCsv size={16} /> CSV
            </button>
            {tableId && (
                <button onClick={exportPNG} className="btn btn-sm btn-secondary d-flex align-items-center tw-gap-1" title="Export as PNG">
                    <ImageIcon size={16} /> PNG
                </button>
            )}
        </div>
    );
};

export default ExportButtons;
