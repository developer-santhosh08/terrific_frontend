import React, { useState, useEffect } from 'react';

const FollowupHistoryPopup = ({ isOpen, onClose, customerName, enquiryId }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && enquiryId) {
            setLoading(true);
            fetch(`/api/sales/followups/history/${enquiryId}`)
                .then(res => res.json())
                .then(json => {
                    if (json.status) {
                        setRows(json.data.map(r => ({ ...r, customerName })));
                    } else {
                        setRows([]);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setRows([]);
                })
                .finally(() => setLoading(false));
        } else {
            setRows([]);
        }
    }, [isOpen, enquiryId, customerName]);

    if (!isOpen) return null;

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'transparent' }}>
            <div className="modal-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
            <div className="modal-dialog" style={{ zIndex: 1060, maxWidth: '860px', width: 'calc(100% - 40px)', boxSizing: 'border-box' }}>
                <div className="modal-content p-0" style={{ position: 'relative', borderRadius: 12, border: '2px solid #374151', boxShadow: '0 12px 40px rgba(55,65,81,0.15)', overflow: 'hidden', backgroundColor: '#fff' }}>

                    {/* Header */}
                    <div className="d-flex p-3" style={{ alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                        <h5 className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, flex: 1, color: '#374151' }}>
                            Followup History
                        </h5>
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={onClose}
                            style={{ background: '#ef4444', border: 'none', color: '#fff', fontSize: '1.1rem', width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 17, cursor: 'pointer' }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body p-4">
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th style={{ width: 46 }}>#</th>
                                        <th>Customer Name</th>
                                        <th>Remark</th>
                                        <th>Category</th>
                                        <th>Follow Up Date</th>
                                        <th>Next Follow Up Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-4">Loading history...</td></tr>
                                    ) : rows.length > 0 ? (
                                        rows.map((r, idx) => (
                                            <tr key={r.id}>
                                                <td className="tw-align-middle">{idx + 1}</td>
                                                <td className="tw-align-middle">{r.customerName}</td>
                                                <td className="tw-align-middle">{r.remark}</td>
                                                <td className="tw-align-middle">{r.category}</td>
                                                <td className="tw-align-middle">{r.followUpDate}</td>
                                                <td className="tw-align-middle">{r.nextFollowUpDate}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center py-4 text-muted">No history found.</td></tr>
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

export default FollowupHistoryPopup;
