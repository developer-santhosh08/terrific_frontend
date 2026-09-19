import React, { useState, useEffect } from 'react';

const StatusChangePopup = ({ isOpen, onClose, onConfirm, title = "Convert Followup", dateLabel = "Next Follow-up Date" }) => {
    const [remark, setRemark] = useState('');
    const [nextDate, setNextDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    useEffect(() => {
        if (isOpen) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            setNextDate(`${year}-${month}-${day}`);
            setRemark('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!nextDate) {
            alert(`Please select a ${dateLabel.toLowerCase()}`);
            return;
        }
        onConfirm(remark, nextDate);
        setRemark('');
        setNextDate('');
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'transparent' }}>
            <div className="modal-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
            <div className="modal-dialog" style={{ zIndex: 1060, maxWidth: '400px', width: 'calc(100% - 40px)', boxSizing: 'border-box' }}>
                <div className="modal-content p-0" style={{ position: 'relative', borderRadius: 12, border: '2px solid #374151', boxShadow: '0 12px 40px rgba(55,65,81,0.15)', overflow: 'hidden', backgroundColor: '#fff' }}>

                    {/* Header */}
                    <div className="d-flex p-3" style={{ alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                        <h5 className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, flex: 1, color: '#374151' }}>
                            {title}
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
                        <div className="form-group mb-3">
                            <label style={{ fontWeight: 600, color: '#374151', marginBottom: 8, display: 'block' }}>
                                {dateLabel} <span className="text-danger">*</span>
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={nextDate}
                                onChange={e => setNextDate(e.target.value)}
                                style={{ borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 15 }}
                            />
                            
                            <label style={{ fontWeight: 600, color: '#374151', marginBottom: 8, display: 'block' }}>
                                Add a Remark
                            </label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Enter remark (e.g. Customer agreed to pricing)"
                                value={remark}
                                onChange={e => setRemark(e.target.value)}
                                style={{ borderRadius: 8, border: '1px solid #d1d5db', resize: 'none' }}
                            ></textarea>
                        </div>
                        <div className="d-flex justify-content-end tw-gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary tw-bg-gray-100 tw-text-gray-700 tw-border-gray-200 hover:tw-bg-gray-200"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-success tw-bg-green-600 hover:tw-bg-green-700 tw-border-green-600 tw-text-white"
                                onClick={handleSubmit}
                            >
                                Convert
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StatusChangePopup;
