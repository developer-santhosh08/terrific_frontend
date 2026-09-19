import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { DotsThreeVertical, ImageSquare, FilePdf, Table, ArrowsOutSimple } from '@phosphor-icons/react';

const ExportMenu = ({ chartRef, data, title, fileName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getEchartsInstance = () => {
        if (!chartRef || !chartRef.current || !window.echarts) return null;
        return window.echarts.getInstanceByDom(chartRef.current);
    };

    const toggleFullScreen = () => {
        if (!chartRef || !chartRef.current) return;
        const elem = chartRef.current;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                alert(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsOpen(false);
    };

    const downloadImage = async (type) => {
        if (!chartRef || !chartRef.current) return;
        const instance = getEchartsInstance();
        
        let url;
        if (type === 'svg' && instance) {
            url = instance.getDataURL({
                type: 'svg',
                backgroundColor: '#fff'
            });
        } else {
            // Use html2canvas to reliably rasterize SVG/DOM into PNG/JPEG
            const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: '#fff' });
            const mimeType = type === 'jpeg' ? 'image/jpeg' : 'image/png';
            url = canvas.toDataURL(mimeType, 1.0);
        }

        const a = document.createElement('a');
        a.href = url;
        const fileExt = (type === 'svg' && !instance) ? 'png' : type;
        a.download = `${fileName || title || 'Chart'}.${fileExt}`;
        a.click();
        setIsOpen(false);
    };

    const downloadPDF = async () => {
        if (!chartRef || !chartRef.current) return;

        // Use html2canvas to guarantee a reliable PNG for the PDF
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: '#fff' });
        const url = canvas.toDataURL('image/png', 1.0);

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [800, 400]
        });

        pdf.text(title || 'Chart Export', 20, 20);
        pdf.addImage(url, 'PNG', 20, 40, 760, 320);
        pdf.save(`${fileName || title || 'Chart'}.pdf`);
        setIsOpen(false);
    };

    const downloadExcel = () => {
        if (!data || data.length === 0) {
            alert('No data available to export');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${fileName || title || 'Data'}.xlsx`);
        setIsOpen(false);
    };

    const downloadCSV = () => {
        if (!data || data.length === 0) {
            alert('No data available to export');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName || title || 'Data'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative' }} ref={menuRef}>
            <div 
                style={{ cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => setIsOpen(!isOpen)}
            >
                <DotsThreeVertical size={20} color="#64748b" weight="bold" />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    minWidth: 240,
                    maxHeight: 280,
                    overflowY: 'auto',
                    zIndex: 1000,
                    padding: '8px 0',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    {chartRef && (
                        <>
                            <MenuItem icon={<ArrowsOutSimple />} label="View in full screen" onClick={toggleFullScreen} />
                            
                            <div style={{ height: 1, backgroundColor: '#f1f5f9', margin: '8px 0' }}></div>

                            <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Export Image
                            </div>
                            <MenuItem icon={<ImageSquare />} label="Download PNG image" onClick={() => downloadImage('png')} />
                            <MenuItem icon={<ImageSquare />} label="Download JPEG image" onClick={() => downloadImage('jpeg')} />
                            {getEchartsInstance() && <MenuItem icon={<ImageSquare />} label="Download SVG vector image" onClick={() => downloadImage('svg')} />}
                            
                            <div style={{ height: 1, backgroundColor: '#f1f5f9', margin: '8px 0' }}></div>
                            
                            <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Export Document
                            </div>
                            <MenuItem icon={<FilePdf />} label="Download PDF document" onClick={downloadPDF} />
                            
                            <div style={{ height: 1, backgroundColor: '#f1f5f9', margin: '8px 0' }}></div>
                        </>
                    )}
                    
                    <div style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Export Data
                    </div>
                    <MenuItem icon={<Table />} label="Download CSV" onClick={downloadCSV} />
                    <MenuItem icon={<Table />} label="Download XLS" onClick={downloadExcel} />
                </div>
            )}
        </div>
    );
};

const MenuItem = ({ icon, label, onClick }) => {
    return (
        <div 
            onClick={onClick}
            style={{ 
                padding: '8px 16px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                fontSize: 14,
                color: '#475569',
                transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
        >
            <div style={{ display: 'flex', color: '#94a3b8' }}>
                {React.cloneElement(icon, { size: 18, weight: 'duotone' })}
            </div>
            {label}
        </div>
    );
};

export default ExportMenu;
