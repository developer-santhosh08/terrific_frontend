import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLoader } from '../../../context/LoaderContext';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
    pdf
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
        fontSize: 8,
    },
    pageBorder: {
        borderWidth: 1,
        borderColor: '#000',
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#1d4ed8',
        textAlign: 'center',
        padding: 8,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    companyHeader: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    logoTextContainer: {
        padding: 6,
        alignSelf: 'flex-end',
        alignItems: 'flex-start',
    },
    logoText: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: '#0891b2',
        textAlign: 'left',
        lineHeight: 1.2,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        alignItems: 'stretch',
    },
    col: {
        borderRightWidth: 1,
        borderRightColor: '#000',
        padding: 5,
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    // Columns for top section
    colSupplier: { width: '35%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, justifyContent: 'center' },
    colInvoice: { width: '35%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, justifyContent: 'center' },
    colMeta: { width: '30%', padding: 5, justifyContent: 'center' },

    // Grid layout for Items
    colSn: { width: '5%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, textAlign: 'center', justifyContent: 'center' },
    colModel: { width: '15%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, textAlign: 'center', justifyContent: 'center' },
    colDesc: { width: '30%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, justifyContent: 'center' },
    colQty: { width: '5%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, textAlign: 'center', justifyContent: 'center' },
    colPrice: { width: '15%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, textAlign: 'right', justifyContent: 'center' },
    colScheme: { width: '8%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, textAlign: 'center', justifyContent: 'center' },
    colTax: { width: '10%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, textAlign: 'center', justifyContent: 'center' },
    colTotal: { width: '12%', padding: 5, textAlign: 'right', justifyContent: 'center' },

    itemsHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#f9fafb',
        alignItems: 'stretch',
    },
    itemsRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        alignItems: 'stretch',
    },

    // Summary
    summaryLeft: { width: '65%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    summaryRight: { width: '35%', flexDirection: 'row' },
    summaryLabelCol: { width: '50%', padding: 5, alignItems: 'flex-end', justifyContent: 'center' },
    summaryValueCol: { width: '50%', padding: 5, alignItems: 'flex-end', justifyContent: 'center' },

    // Flex helpers
    flexRowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }
});

const PODocument = ({ data }) => {
    const { header, details, company, tax_breakdown, special_instructions, payment_history, balance_total, total_paid_amount } = data;

    return (
        <Document title={header?.vendor_name ? `Receipt-${header?.po_no ? `${header.po_no} ` : ''}${header.vendor_name}` : 'Advanced Payment Receipt'}>
            <Page size="A4" style={styles.page}>
                <View style={styles.pageBorder}>

                    <Text style={styles.title}>Further Receipt</Text>

                    {/* <View style={styles.companyHeader}>
                        <View style={styles.logoTextContainer}>
                            <Text style={styles.logoText}>Terrific</Text>
                            <Text style={styles.logoText}>Technologies</Text>
                        </View>
                    </View> */}

                    {/* Header Row 1 */}
                    <View style={styles.row}>
                        <View style={styles.colSupplier}>
                            <Text style={styles.bold}>Supplier</Text>
                            <Text style={styles.bold}>{header?.vendor_name}</Text>
                            <Text>{header?.vendor_address1}</Text>
                            <Text>{header?.vendor_address2}</Text>
                            <Text>{header?.vendor_address3}</Text>
                            <Text>Mobile: {header?.vendor_mobile}, Phone: {header?.vendor_phone}</Text>
                        </View>
                        <View style={styles.colInvoice}>
                            <Text style={styles.bold}>Invoice To</Text>
                            <Text style={styles.bold}>{company?.name}</Text>
                            <Text>{company?.address1}</Text>
                            <Text>{company?.address2}</Text>
                            <Text>Cell: {company?.mobile}, {company?.phone}</Text>
                        </View>
                        <View style={styles.colMeta}>
                            <View style={styles.flexRowBetween}>
                                <Text>No</Text><Text>: {header?.po_no}</Text>
                            </View>
                            <View style={styles.flexRowBetween}>
                                <Text>Date</Text><Text>: {header?.po_date?.split(' ')[0]}</Text>
                            </View>
                            <View style={styles.flexRowBetween}>
                                <Text>Ref</Text><Text>: {header?.ref_1}</Text>
                            </View>
                            <View style={styles.flexRowBetween}>
                                <Text>Ref</Text><Text>: {header?.ref_2}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Header Row 2 */}
                    <View style={styles.row}>
                        <View style={styles.colSupplier}>
                            <Text>Contact Person : {header?.contact_person_name}</Text>
                        </View>
                        <View style={styles.colInvoice}>
                            <Text>Contact Person : {company?.contact_person}</Text>
                        </View>
                        <View style={{ ...styles.colMeta, alignItems: 'center' }}>
                            <Text style={styles.bold}>{company?.name}</Text>
                        </View>
                    </View>

                    {/* Header Row 3 */}
                    <View style={styles.row}>
                        <View style={styles.colSupplier}>
                            <Text>Contact No : {header?.vendor_contact_no}</Text>
                        </View>
                        <View style={styles.colInvoice}>
                            <Text>Contact No : {company?.contact_no || company?.mobile}</Text>
                        </View>
                        <View style={styles.colMeta}></View>
                    </View>

                    {/* Items Header */}
                    <View style={styles.itemsHeaderRow}>
                        <View style={styles.colSn}><Text>S.N</Text></View>
                        <View style={styles.colModel}><Text>MODEL NO</Text></View>
                        <View style={styles.colDesc}><Text>DESCRIPTION</Text></View>
                        <View style={styles.colQty}><Text>QTY</Text></View>
                        <View style={styles.colPrice}><Text>UNIT PRICE</Text></View>
                        <View style={styles.colScheme}><Text>SCHEME DISC</Text></View>
                        <View style={styles.colTax}><Text>TAX</Text></View>
                        <View style={styles.colTotal}><Text>TOTAL PRICE</Text></View>
                    </View>

                    {/* Items List */}
                    {details?.map((item, i) => (
                        <View style={styles.itemsRow} key={i}>
                            <View style={styles.colSn}><Text>{i + 1}</Text></View>
                            <View style={styles.colModel}><Text>{item.model_name}</Text></View>
                            <View style={styles.colDesc}>
                                <Text>{item.product_name}</Text>
                                <Text>{item.product_description}</Text>
                            </View>
                            <View style={styles.colQty}><Text>{item.quantity}</Text></View>
                            <View style={styles.colPrice}><Text>{Number(item.unit_price || 0).toFixed(2)}</Text></View>
                            <View style={styles.colScheme}><Text>{Number(item.scheme_disc || 0).toFixed(2)}%</Text></View>
                            <View style={{ ...styles.colTax, alignItems: 'center' }}>
                                <Text>{item.tax_percent}%</Text>
                                <Text>{Number(item.tax_amount || 0).toFixed(2)}</Text>
                            </View>
                            <View style={styles.colTotal}><Text>{Number(item.line_total_price || 0).toFixed(2)}</Text></View>
                        </View>
                    ))}

                    {/* Delivery & Tax Summary */}
                    <View style={styles.row}>
                        <View style={styles.summaryLeft}>
                            <Text style={{ marginBottom: 4 }}><Text style={styles.bold}>Terms Of Delivery :</Text> {header?.terms_of_delivery}</Text>
                            <Text style={{ marginBottom: 4 }}><Text style={styles.bold}>Terms Of Payment :</Text> {header?.terms_of_payment}</Text>
                            <Text><Text style={styles.bold}>Date Of Delivery :</Text> {header?.delivery_date}</Text>
                        </View>
                        <View style={styles.summaryRight}>
                            <View style={styles.summaryLabelCol}>
                                <Text>SGST Amount</Text>
                                <Text>CGST Amount</Text>
                                {Number(tax_breakdown?.igst_amount) > 0 && <Text>IGST Amount</Text>}
                                <Text>ROUND OFF</Text>
                            </View>
                            <View style={styles.summaryValueCol}>
                                <Text>{Number(tax_breakdown?.sgst_amount || 0).toFixed(2)}</Text>
                                <Text>{Number(tax_breakdown?.cgst_amount || 0).toFixed(2)}</Text>
                                {Number(tax_breakdown?.igst_amount) > 0 && <Text>{Number(tax_breakdown?.igst_amount || 0).toFixed(2)}</Text>}
                                <Text>0.00</Text>
                            </View>
                        </View>
                    </View>

                    {/* Address & Grand Total */}
                    <View style={styles.row}>
                        <View style={styles.summaryLeft}>
                            <Text style={{ ...styles.bold, textDecoration: 'underline', marginBottom: 4 }}>Delivery Address</Text>
                            <Text style={styles.bold}>{company?.name}</Text>
                            <Text>{company?.address1}</Text>
                            <Text>{company?.address2}</Text>
                            <Text>Cell: {company?.mobile}, {company?.phone}</Text>
                        </View>
                        <View style={styles.summaryRight}>
                            <View style={styles.summaryLabelCol}>
                                <Text style={styles.bold}>TOTAL TAX</Text>
                                <Text style={styles.bold}>TOTAL</Text>
                            </View>
                            <View style={styles.summaryValueCol}>
                                <Text style={styles.bold}>{Number(tax_breakdown?.total_tax_amount || 0).toFixed(2)}</Text>
                                <Text style={styles.bold}>{Number(tax_breakdown?.grand_total || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Company IDs */}
                    <View style={styles.row}>
                        <View style={{ padding: 5, width: '100%' }}>
                            <Text style={styles.bold}>
                                TIN : {company?.tin} | CST : {company?.cst} | SERVICE TAX : {company?.service_tax} | PAN : {company?.pan}
                            </Text>
                        </View>
                    </View>

                    {/* Payments Header */}
                    <View style={{ ...styles.row, backgroundColor: '#f9fafb' }}>
                        <View style={{ width: '10%', ...styles.col }}><Text>S.No</Text></View>
                        <View style={{ width: '40%', ...styles.col }}><Text>Payment</Text></View>
                        <View style={{ width: '25%', ...styles.col }}><Text>Paid Date</Text></View>
                        <View style={{ width: '25%', padding: 5 }}><Text>Paid Amount</Text></View>
                    </View>

                    {/* Payment History List */}
                    {payment_history && payment_history.length > 0 ? (
                        payment_history.map((pay, i) => (
                            <View style={styles.row} key={i}>
                                <View style={{ width: '10%', ...styles.col }}><Text>{pay.s_no || (i + 1)}</Text></View>
                                <View style={{ width: '40%', ...styles.col }}><Text>{pay.payment || ''}</Text></View>
                                <View style={{ width: '25%', ...styles.col }}><Text>{pay.paid_date || ''}</Text></View>
                                <View style={{ width: '25%', padding: 5, alignItems: 'flex-end' }}>
                                    <Text>{Number(pay.paid_amount || 0).toFixed(2)}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.row}>
                            <View style={{ width: '100%', padding: 5, alignItems: 'center' }}>
                                <Text>No Paid Amount</Text>
                            </View>
                        </View>
                    )}

                    {/* Balance */}
                    <View style={styles.row}>
                        <View style={{ width: '75%', ...styles.col, alignItems: 'flex-end' }}>
                            <Text style={styles.bold}>Balance Total</Text>
                        </View>
                        <View style={{ width: '25%', padding: 5, alignItems: 'flex-end' }}>
                            <Text style={{ ...styles.bold, color: '#dc2626' }}>{Number(balance_total !== undefined ? balance_total : (tax_breakdown?.grand_total || 0)).toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Remarks / Footer */}
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ width: '65%', ...styles.col, borderBottomWidth: 0, padding: 10 }}>
                            <Text style={{ ...styles.bold, marginBottom: 5 }}>Other Remarks :</Text>
                            <Text style={{ ...styles.bold, marginBottom: 5 }}>Special Instruction:</Text>
                            {special_instructions?.map((instruction, idx) => (
                                <Text key={idx} style={{ marginBottom: 2 }}>{instruction}</Text>
                            ))}
                        </View>
                        <View style={{ width: '35%', padding: 15, alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Text style={{ marginBottom: 40 }}>For <Text style={styles.bold}>{company?.name}</Text></Text>
                            <Text style={{ borderTopWidth: 1, borderTopColor: '#000', width: '80%', textAlign: 'center', paddingTop: 5 }}>Authorized Signatory</Text>
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
};

const FurtherReceiptPrint = () => {
    const { id } = useParams();
    const { setLoading } = useLoader();
    const [printData, setPrintData] = useState(null);

    useEffect(() => {
        const fetchPrintData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/further-payments/receipts-print/${id}`, { headers });
                const result = await response.json();

                if (result.status && result.data) {
                    setPrintData(result.data);
                } else {
                    console.error("Failed to fetch print data");
                }
            } catch (error) {
                console.error("Error fetching print data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPrintData();
        }
    }, [id, setLoading]);

    if (!printData) {
        return <div style={{ padding: 20 }}>Loading PDF document...</div>;
    }

    const fileName = printData.header?.vendor_name ? `Receipt-${printData.header?.po_no ? `${printData.header.po_no} ` : ''}${printData.header.vendor_name}.pdf` : 'Further_Receipt.pdf';
    document.title = fileName;

    const handleDownload = async () => {
        setLoading(true);
        try {
            const blob = await pdf(<PODocument data={printData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to generate download:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!navigator.share) {
            alert('Sharing is not supported on this browser.');
            return;
        }
        setLoading(true);
        try {
            const blob = await pdf(<PODocument data={printData} />).toBlob();
            const file = new File([blob], fileName, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: fileName,
                    text: `Please find attached: ${fileName}`,
                });
            } else {
                alert('File sharing is not supported on this device/browser.');
            }
        } catch (err) {
            console.error("Failed to share:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
            <div style={{ height: '45px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', color: '#fff', fontFamily: 'sans-serif' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{fileName.replace('.pdf', '')}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleShare}
                        style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                        Share PDF
                    </button>
                    <button
                        onClick={handleDownload}
                        style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                        Download PDF
                    </button>
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <PDFViewer width="100%" height="100%" style={{ border: 'none' }} title={fileName}>
                    <PODocument data={printData} />
                </PDFViewer>
            </div>
        </div>
    );
};

export default FurtherReceiptPrint;
