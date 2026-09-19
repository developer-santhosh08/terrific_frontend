import { logoBase64 } from '../../assets/logoBase64';
import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const EnquiryPrint = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state || {};
    const enqNo = data.enqNo || `ENQ-${id || '000'}`;
    const enqDate = data.enqDate || new Date().toLocaleDateString();
    const customerName = data.customerName || 'Customer Name';
    const mobile = data.mobile || '0000000000';
    const fallbackProducts = [
        { model: '11kw', product: 'COMPTECH-Air Filter - CT00000483', capacity: 'Compressor', perUnit: 2500.0, qty: 1, tax: 18, taxAmount: 531.0, rate: 2950.0 }
    ];
    const products = Array.isArray(data.products) && data.products.length ? data.products : fallbackProducts;

    const subtotal = products.reduce((s, p) => s + Number(p.perUnit || 0) * Number(p.qty || 0), 0).toFixed(2);
    const totalTax = products.reduce((s, p) => s + Number(p.taxAmount || 0), 0).toFixed(2);
    const netTotal = (Number(subtotal) + Number(totalTax)).toFixed(2);

    useEffect(() => {
        // small delay then print to allow paint
        const t = setTimeout(() => window.print(), 300);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <style>{`
                @page { size: A4; margin: 20mm }
                .print-a4 { width: 210mm; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; color: #222 }
                .print-header { text-align: center; margin-bottom: 12px }
                .print-table { width: 100%; border-collapse: collapse; font-size: 12px }
                .print-table th, .print-table td { border: 1px solid #ccc; padding: 6px }
                .print-table thead th { background: #e9f0f7; font-weight: 700 }
                .summary { width: 320px; float: right; margin-top: 8px }
                .muted { color: #666; font-size: 12px }
                .section-title { font-weight: 700; margin: 8px 0 }
                @media print { .no-print { display: none } }
            `}</style>

            <div className="print-a4">
                <div style={{ background: '#12366a', color: '#fff', padding: '18px 20px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, letterSpacing: 1 }}>MACAWFIT</h3>
                            <div style={{ fontSize: 12, opacity: 0.9 }}>Lifestyle & Fitness Studio</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h3 style={{ margin: 0 }}>INVOICE</h3>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8, opacity: 0.95 }}>Macaw Fit Lifestyle And Fitness Studio, 4B Vctv Main Road, 2nd & 3rd Floor, Shakthi Road, Opposite To Lotus Tvs Agency, Erode - 638003 | Phone: 9500232003 | GST: 33CDAPA3408D2ZH</div>
                </div>

                <div style={{ border: '1px solid #ddd', padding: 10, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '65%', fontSize: 12 }}>
                        <div style={{ fontWeight: 700 }}>To :</div>
                        <div style={{ whiteSpace: 'pre-line' }}>{customerName}</div>
                        <div className="muted">Phone : {mobile}</div>
                    </div>
                    <div style={{ width: '30%', fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>Invoice No</div>
                            <div style={{ fontWeight: 700 }}>{enqNo}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                            <div>Invoice Date</div>
                            <div style={{ fontWeight: 700 }}>{enqDate}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                            <div>Payment Mode</div>
                            <div style={{ fontWeight: 700 }}>--</div>
                        </div>
                    </div>
                </div>

                <table className="print-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Model</th>
                            <th>Product</th>
                            <th>Capacity</th>
                            <th>Per Unit</th>
                            <th>Qty</th>
                            <th>Tax</th>
                            <th>Tax Amount</th>
                            <th>Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, i) => (
                            <tr key={i}>
                                <td style={{ width: 40 }}>{i + 1}</td>
                                <td>{p.model}</td>
                                <td>{p.product}</td>
                                <td>{p.capacity}</td>
                                <td style={{ textAlign: 'right' }}>{Number(p.perUnit || 0).toFixed(2)}</td>
                                <td style={{ textAlign: 'right' }}>{p.qty}</td>
                                <td style={{ textAlign: 'right' }}>{p.tax}</td>
                                <td style={{ textAlign: 'right' }}>{Number(p.taxAmount || 0).toFixed(2)}</td>
                                <td style={{ textAlign: 'right' }}>{Number(p.rate || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="summary">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>Sub Amount</td>
                                <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #eee' }}>{subtotal}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>CGST ({(Number(totalTax) / 2).toFixed(2) ? (Number(totalTax) / 2 / Number(subtotal || 1) * 100).toFixed(2) : '0'}%)</td>
                                <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #eee' }}>{(Number(totalTax) / 2).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 6, borderBottom: '1px solid #eee' }}>SGST ({(Number(totalTax) / 2).toFixed(2) ? (Number(totalTax) / 2 / Number(subtotal || 1) * 100).toFixed(2) : '0'}%)</td>
                                <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #eee' }}>{(Number(totalTax) / 2).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: 6 }}><strong>Grand Total</strong></td>
                                <td style={{ padding: 6, textAlign: 'right' }}><strong>{netTotal}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={{ clear: 'both', marginTop: 24 }}>
                    <p className="muted">DELIVERY : Immediate / DAYS &nbsp;&nbsp; PAID : &nbsp; TOPAY : &nbsp; Warranty Terms :</p>
                    <p className="muted">PAYMENT : 100% Advance Payment </p>

                    <div style={{ border: '1px solid #222', marginTop: 18, padding: 8 }}>
                        <h4 style={{ textAlign: 'center', margin: 6 }}>INSTALLATION</h4>
                        <table className="print-table" style={{ marginTop: 6 }}>
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>S.NO</th>
                                    <th>DETAILS</th>
                                    <th>MODEL</th>
                                    <th>PRICE</th>
                                    <th>QUANTITY</th>
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td colSpan={6} style={{ height: 40 }}></td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <p className="muted">MAINTENANCE CONTRACT : After the first year we shall be pleased to offer you an all - inclusive maintenance contract at reasonable rates</p>
                        <p className="muted">KINDLY REFER TO OUR TERMS & CONDITIONS MENTIONED OVERLEAF:</p>
                        <p>We hope our offer is in line with your requirement in case you require any further information / clarification please feel free to contact us.</p>
                        <p>Thanking you and assuring you of our best attention at all times.</p>
                        <p>Very Truly Yours,</p>
                        <p style={{ color: 'red' }}>For</p>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 20 }}><strong>This is System Generated Document, Hence No Signature Required</strong></div>

                    <div style={{ marginTop: 20 }} className="no-print">
                        <button onClick={() => navigate(-1)} className="btn-cancel">Back</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnquiryPrint;
