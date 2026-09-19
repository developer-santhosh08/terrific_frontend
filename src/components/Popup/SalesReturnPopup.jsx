import { useState } from 'react';

const dummyRows = [
    { id: 1, productName: 'TERRIFIC-TF-7.5 W', brandName: 'Terrific', serialNumber: 'SN-1001' },
    { id: 2, productName: 'TERRIFIC-TF-10 W',  brandName: 'Terrific', serialNumber: 'SN-1002' },
];

const SalesReturnPopup = ({ isOpen, onClose, enqNo }) => {
    const [rows] = useState(dummyRows);

    if (!isOpen) return null;

    const handleSubmit = () => {
        console.log('Sales Return submitted', { enqNo, rows });
        onClose();
    };

    return (
        <div className="d-flex align-items-center justify-content-center"
            style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'transparent' }}>

            <div className="modal-overlay"
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
                onClick={onClose}
            />

            <div className="modal-dialog"
                style={{ zIndex: 1060, maxWidth: '780px', width: 'calc(100% - 40px)', boxSizing: 'border-box' }}>

                <div className="modal-content p-0"
                    style={{ position: 'relative', borderRadius: 12, border: '2px solid #374151', boxShadow: '0 12px 40px rgba(55,65,81,0.15)', overflow: 'hidden', backgroundColor: '#fff' }}>

                    {/* Header */}
                    <div className="d-flex p-3" style={{ alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                        <h5 className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, flex: 1, color: '#374151' }}>
                            Sales Return List
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
                                        <th>Product Name</th>
                                        <th>Brand Name</th>
                                        <th>Serial Number</th>
                                        <th style={{ width: 80 }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, idx) => (
                                        <tr key={r.id}>
                                            <td className="tw-align-middle">{idx + 1}</td>
                                            <td className="tw-align-middle">{r.productName}</td>
                                            <td className="tw-align-middle">{r.brandName}</td>
                                            <td className="tw-align-middle">{r.serialNumber}</td>
                                            <td className="tw-align-middle tw-text-center">
                                                <button type="button" className="table-delete" onClick={() => {}}>
                                                    <i className="bi bi-trash" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="tw-text-center tw-text-slate-400 tw-py-6">No records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-center tw-mt-4">
                            <button type="button" className="btn-save" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SalesReturnPopup;
