import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const ProductDetailsPopup = ({ isOpen, onClose, installationId, isReadOnly = false }) => {
    const [products, setProducts] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        if (isOpen && installationId) {
            fetchData();
        } else {
            setProducts([]);
        }
    }, [isOpen, installationId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/invoice/${installationId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const result = await res.json();
            if (result.status && result.data && result.data.invoice_details) {
                let mapped = result.data.invoice_details.map(p => ({
                    ...p,
                    isAddingNew: false,
                    inputSerialNumber: p.serial_number || ''
                }));
                
                if (!isReadOnly) {
                    mapped = mapped.filter(p => !p.serial_number);
                }
                
                setProducts(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        setProducts(newProducts);
    };

    const handleSaveClick = () => {
        if (!installationId) {
            onClose();
            return;
        }

        for (const p of products) {
            if (!p.inputSerialNumber || !p.inputSerialNumber.trim()) {
                alert('Please provide a serial number for all products.');
                return;
            }
        }
        
        setIsConfirmOpen(true);
    };

    const confirmSave = async () => {
        setIsConfirmOpen(false);
        try {
            setIsSaving(true);
            const items = products.map(p => ({
                invoice_detail_id: p.id,
                vendor_product_mapping_id: p.vendor_product_mapping_id,
                serial_number: p.inputSerialNumber.trim()
            }));
            const payload = { items };
            
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/installation-pending/submit/${installationId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.status) {
                onClose(true); // pass true to refresh list if needed
            } else {
                alert(data.message || 'Error saving serial numbers');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'transparent' }}>
            <style>{`
                .modal-dialog { margin: 24px auto; }
                .modal-content { box-sizing: border-box; }
                .close-btn { position: relative; }
                .table-headers th {
                    background: #f8fafc;
                    font-weight: 600;
                    color: #475569;
                    padding: 12px 16px;
                    border-bottom: 2px solid #e2e8f0;
                }
                .table-body td {
                    padding: 16px;
                    vertical-align: top;
                    color: #334155;
                    border-bottom: 1px solid #e2e8f0;
                }
                .btn-save {
                    background: #0ea5e9;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 6px 16px;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .btn-save:hover {
                    background: #0284c7;
                    color: #fff;
                }
                .add-new-link {
                    color: #0ea5e9;
                    font-size: 0.85rem;
                    text-decoration: underline;
                    cursor: pointer;
                    margin-left: 12px;
                }
                .add-new-link:hover {
                    color: #0284c7;
                }
                @media (max-width: 767px) {
                    .modal-dialog { width: 96% !important; max-width: 900px !important; }
                    .modal-content { padding: 16px !important; border-radius: 10px !important; }
                    .modal-title { font-size: 1.15rem !important; }
                }
            `}</style>

            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />

            <div className="modal-dialog modal-xl" style={{ position: 'relative', width: '90%', maxWidth: '1000px', margin: 'auto', zIndex: 1060 }}>
                <div className="modal-content" style={{ border: 'none', borderRadius: '10px', boxShadow: '0 15px 40px rgba(0,0,0,0.15)', background: '#fff' }}>

                    <div className="modal-header d-flex justify-content-between align-items-center" style={{ padding: '24px 32px 18px', borderBottom: '1px solid #e2e8f0' }}>
                        <h4 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#334155' }}>Product Details</h4>
                        <button type="button" className="close close-btn" onClick={onClose} style={{ border: 'none', background: '#ef4444', fontSize: '1.25rem', color: '#fff', cursor: 'pointer', lineHeight: 1, width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '2px' }}>&times;</button>
                    </div>

                    <div className="modal-body" style={{ padding: '24px 32px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                        <h5 className="tw-text-gray-700 tw-text-lg tw-mb-4 tw-font-medium">Main Products</h5>

                        <div className="table-responsive">
                            <table className="table table-bordered tw-w-full tw-mb-0">
                                <thead className="table-headers">
                                    <tr>
                                        <th style={{ width: '50px' }}>#</th>
                                        <th>Product Name</th>
                                        <th style={{ width: '250px' }}>Serial Number</th>
                                        <th>Qty</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">Loading products...</td>
                                        </tr>
                                    ) : products.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">No products found.</td>
                                        </tr>
                                    ) : (
                                        products.map((p, idx) => {
                                            const hasExistingSerial = !!p.serial_number;
                                            
                                            const validSerials = p.available_serial_numbers ? p.available_serial_numbers.filter(sn => sn && sn.trim() !== '') : [];
                                            const options = validSerials.map(sn => ({ value: sn, label: sn }));
                                            const selectedOption = options.find(o => o.value === p.inputSerialNumber) || null;

                                            return (
                                                <tr key={p.id}>
                                                    <td>{idx + 1}</td>
                                                    <td>{p.product_description}</td>
                                                    <td>
                                                        {(hasExistingSerial || isReadOnly) ? (
                                                            <input 
                                                                type="text" 
                                                                className="form-control" 
                                                                value={p.inputSerialNumber || 'Not Assigned'} 
                                                                readOnly 
                                                            />
                                                        ) : (
                                                            <>
                                                                {p.isAddingNew ? (
                                                                    <input 
                                                                        type="text" 
                                                                        className="form-control tw-mb-2" 
                                                                        placeholder="Enter Serial Number" 
                                                                        value={p.inputSerialNumber} 
                                                                        onChange={(e) => handleProductChange(idx, 'inputSerialNumber', e.target.value)} 
                                                                    />
                                                                ) : (
                                                                    <Select
                                                                        options={options}
                                                                        placeholder="Select Serial Number"
                                                                        isSearchable={false}
                                                                        className="react-select-container tw-mb-2"
                                                                        classNamePrefix="react-select"
                                                                        menuPortalTarget={document.body}
                                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                                        value={selectedOption}
                                                                        onChange={(opt) => handleProductChange(idx, 'inputSerialNumber', opt ? opt.value : '')}
                                                                    />
                                                                )}
                                                                <div className="d-flex align-items-center">
                                                                    <span className="add-new-link tw-ml-0" onClick={() => {
                                                                        handleProductChange(idx, 'isAddingNew', !p.isAddingNew);
                                                                        handleProductChange(idx, 'inputSerialNumber', ''); 
                                                                    }}>
                                                                        {p.isAddingNew ? 'Cancel' : 'Add new'}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td>{p.quantity}</td>
                                                    <td>{p.rate}</td>
                                                    <td>{p.amount || (p.rate * p.quantity)}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end align-items-center popup-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 32px' }}>
                        {isReadOnly ? (
                            <button type="button" className="btn-cancel tw-px-6 tw-py-2 tw-rounded tw-bg-gray-500 tw-text-white tw-font-medium hover:tw-bg-gray-600 tw-transition-colors" onClick={() => onClose(false)}>Close</button>
                        ) : (
                            <div className="tw-flex tw-gap-3 tw-items-center">
                                <button type="button" className="btn-cancel tw-px-6 tw-py-2 tw-rounded tw-bg-orange-500 tw-text-white tw-font-medium hover:tw-bg-orange-600 tw-transition-colors" style={{ border: 'none' }} onClick={() => onClose(false)}>Cancel</button>
                                <button type="button" className="btn-save tw-px-6 tw-py-2 tw-rounded tw-bg-green-500 tw-text-white tw-font-medium hover:tw-bg-green-600 tw-transition-colors" style={{ border: 'none' }} onClick={handleSaveClick} disabled={isSaving || isLoading || products.length === 0}>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isConfirmOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1070, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <style>{`
                        @keyframes popIn {
                            0%  { opacity: 0; transform: scale(0.85) translateY(20px); }
                            100%{ opacity: 1; transform: scale(1) translateY(0); }
                        }
                        .confirm-popup-box {
                            animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
                        }
                        .confirm-btn-cancel:hover  { background: #e2e8f0 !important; }
                        .confirm-btn-submit:hover  { background: #15803d !important; }
                    `}</style>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} onClick={() => setIsConfirmOpen(false)} />
                    <div className="confirm-popup-box" style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 380, padding: '36px 32px 28px', boxShadow: '0 25px 60px rgba(0,0,0,0.22)', textAlign: 'center', border: '1.5px solid #bbf7d0', zIndex: 1080 }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(22,163,74,0.25)' }}>
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <h5 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a', marginBottom: 8 }}>Submit Confirmation</h5>
                        <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 28 }}>
                            Are you sure you want to <strong style={{ color: '#16a34a' }}>submit</strong> this data?<br /><br />
                            <strong style={{ color: '#ef4444' }}>Highlight:</strong> Once a serial number has been saved, it cannot be modified or reverted.
                        </p>
                        <div style={{ height: 1, background: '#f1f5f9', marginBottom: 22 }} />
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                className="confirm-btn-cancel"
                                onClick={() => setIsConfirmOpen(false)}
                                style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-btn-submit"
                                onClick={confirmSave}
                                style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
                            >
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPopup;
