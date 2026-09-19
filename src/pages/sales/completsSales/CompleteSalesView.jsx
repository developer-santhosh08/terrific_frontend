import { useLoader } from '../../../context/LoaderContext';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CompleteSalesView = () => {
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [data, setData] = useState({
        customerName: '-',
        enquiryNumber: '-',
        allottedTo: '-',
        products: []
    });

    useEffect(() => {
        const fetchViewData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/invoice/${id}`, { headers });
                const json = await response.json();
                
                if (json.status && json.data) {
                    const profile = json.data.customer_profile || {};
                    const details = json.data.invoice_details || [];
                    
                    setData({
                        customerName: profile.customer_name || '-',
                        enquiryNumber: profile.enquiry_no || '-',
                        allottedTo: profile.allotted_to || '-',
                        products: details.map(d => ({
                            id: d.id,
                            name: d.product_description || 'Product',
                            qty: parseFloat(d.quantity) || 0,
                            price: parseFloat(d.rate || 0).toFixed(2)
                        }))
                    });
                }
            } catch (error) {
                console.error("Error fetching view data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchViewData();
        }
    }, [id, setLoading]);

    const totalQty = data.products.reduce((acc, curr) => acc + curr.qty, 0);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Completed Sales View</h3>
                        <button 
                            className="btn-header-back"
                            onClick={() => navigate('/sales/complete-sales')}
                        >
                            Back
                        </button>
                    </div>
                    
                    <div className="card-body">
                        {/* ── Top info bar ─────────────────────── */}
                        <div
                            className="tw-mb-5"
                            style={{
                                background: '#cce9f7', borderRadius: 6,
                                padding: '14px 24px',
                                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0,
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Customer Name</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{data.customerName}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Enquiry Number</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{data.enquiryNumber}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Allotted To</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{data.allottedTo}</span>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped no-margin">
                                <thead>
                                    <tr>
                                        <th className="tw-w-16">S.No</th>
                                        <th>Product Name</th>
                                        <th className="tw-w-24 tw-text-center">Qty</th>
                                        <th className="tw-w-40 tw-text-right">Price (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.products.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td className="tw-text-center">{item.qty}</td>
                                            <td className="tw-text-right">{item.price}</td>
                                        </tr>
                                    ))}
                                    {data.products.length > 0 && (
                                        <tr className="tw-bg-gray-50 tw-font-bold">
                                            <td colSpan="2" className="tw-text-right">Total Quantity:</td>
                                            <td className="tw-text-center tw-text-blue-700 tw-text-lg">{totalQty}</td>
                                            <td></td>
                                        </tr>
                                    )}
                                    {data.products.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="tw-text-center tw-text-slate-400 tw-py-4">No products found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CompleteSalesView;
