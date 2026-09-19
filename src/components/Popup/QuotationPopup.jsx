import React, { useState, useEffect } from 'react';
import { Printer } from '@phosphor-icons/react';

const QuotationPopup = ({ isOpen, onClose, row }) => {
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && row?.id) {
            fetchHistory();
        } else {
            setTableData([]);
        }
    }, [isOpen, row]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/quotation/history/${row.id}`);
            const json = await res.json();
            if (json.status) {
                setTableData(json.data || []);
            }
        } catch (err) {
            console.error('Error fetching quotation history', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'transparent' }}>
            <style>{`
                .modal-dialog { margin: 24px auto; }
                .modal-content { box-sizing: border-box; }
                .sv-action-icon {
                    width: 28px; height: 28px; border-radius: 8px; border: none;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background-color .12s ease, transform .06s ease;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.10);
                }
                .sv-action-icon:hover { transform: translateY(-1px); }
                .sv-action-icon:focus { outline: none; }
                .sv-print { background-color: #0ea5e9; color: #ffffff; }
                .sv-print:hover { background-color: #0284c7; }
            `}</style>
            <div className="modal-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
            <div className="modal-dialog" style={{ zIndex: 1060, maxWidth: '800px', width: 'calc(100% - 40px)', boxSizing: 'border-box' }}>
                <div className="modal-content p-0" style={{ position: 'relative', borderRadius: 12, border: '2px solid #374151', boxShadow: '0 12px 40px rgba(55,65,81,0.15)', overflow: 'hidden', backgroundColor: '#fff' }}>
                    
                    <div className="d-flex p-3" style={{ position: 'relative', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                        <h5 className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, flex: 1, color: '#374151' }}>Quotation List</h5>
                        <button type="button" aria-label="Close" onClick={onClose} style={{background:'#ef4444',border:'none',color:'#fff',fontSize:'1.1rem',width:34,height:34,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:17,cursor:'pointer'}}>×</button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th style={{ width: 50 }} className="tw-align-middle">#</th>
                                        <th className="tw-align-middle">Enq. No</th>
                                        <th className="tw-align-middle">Created Date</th>
                                        <th className="tw-align-middle">Created By</th>
                                        <th style={{ width: 80 }} className="tw-align-middle">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center">No quotation history found</td></tr>
                                    ) : (
                                        tableData.map((item, idx) => (
                                            <tr key={item.quotation_id || idx}>
                                                <td className="tw-align-middle">{idx + 1}</td>
                                                <td className="tw-align-middle">{item.quotation_no || row?.enqNo}</td>
                                                <td className="tw-align-middle">{item.created_date}</td>
                                                <td className="tw-align-middle">{item.created_by_name}</td>
                                                <td className="tw-align-middle">
                                                    <button type="button" className="sv-action-icon sv-print" title="Print Quotation" onClick={() => window.open(`/enquiry/quotationPdf/${row.id}?quotation_id=${item.quotation_id}`, '_blank')}>
                                                        <Printer weight="bold" className="tw-w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default QuotationPopup;
