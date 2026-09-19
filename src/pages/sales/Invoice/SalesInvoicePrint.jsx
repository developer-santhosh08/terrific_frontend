import { logoBase64 } from '../../../assets/logoBase64';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLoader } from '../../../context/LoaderContext';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
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
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        alignItems: 'stretch',
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    // Top Header Columns
    mainTitle: {
        fontSize: 16,
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    companyDetailsText: {
        flex: 1,
        paddingRight: 20,
    },
    logoText: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: '#0891b2',
        textAlign: 'left',
        lineHeight: 1.2,
    },
    logoTextContainer: {
        padding: 6,
        alignSelf: 'flex-end',
        alignItems: 'flex-start',
        backgroundColor: '#22C1C3'
    },

    // Middle Header Columns
    billToBox: { width: '45%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    shipToBox: { width: '30%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    metaBox: { width: '25%', padding: 5 },
    flexRowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },

    // Table Header
    itemsHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        fontFamily: 'Helvetica-Bold',
        alignItems: 'stretch',
    },
    itemsRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        alignItems: 'stretch',
    },

    colSn: { width: '3%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 1, textAlign: 'center', justifyContent: 'center', fontSize: 6.8 },
    colModel: { width: '7%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 1, textAlign: 'center', justifyContent: 'center', fontSize: 6.8 },
    colCap: { width: '6%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 1, textAlign: 'center', justifyContent: 'center', fontSize: 6.8 },
    colDesc: { width: '15%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 2, paddingRight: 2, justifyContent: 'center', fontSize: 6.8 },
    colHsn: { width: '6%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 1, textAlign: 'center', justifyContent: 'center', fontSize: 6.8 },
    colQty: { width: '4%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 1, textAlign: 'center', justifyContent: 'center', fontSize: 6.8 },
    colUnit: { width: '11%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 2, textAlign: 'right', justifyContent: 'center', fontSize: 6.8 },
    colBuy: { width: '9%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 2, textAlign: 'right', justifyContent: 'center', fontSize: 6.8 },
    colBasic: { width: '11%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 2, textAlign: 'right', justifyContent: 'center', fontSize: 6.8 },
    colPf: { width: '6%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 1, textAlign: 'center', justifyContent: 'center', fontSize: 6.8 },
    colTax: { width: '10%', borderRightWidth: 1, borderRightColor: '#000', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 2, textAlign: 'right', justifyContent: 'center', fontSize: 6.8 },
    colTotal: { width: '12%', paddingTop: 2, paddingBottom: 2, paddingLeft: 1, paddingRight: 2, textAlign: 'right', justifyContent: 'center', fontSize: 6.8 },

    // Total Row
    totalRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        alignItems: 'stretch',
    },
    colTotalLabel: { width: '65%', borderRightWidth: 1, borderRightColor: '#000', padding: 2, textAlign: 'center', justifyContent: 'center', fontFamily: 'Helvetica-Bold' },

    // Sub Total Row
    subTotalRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        alignItems: 'stretch',
    },
    colSubTotalLabel: { width: '89%', borderRightWidth: 1, borderRightColor: '#000', padding: 2, textAlign: 'right', justifyContent: 'center', fontFamily: 'Helvetica-Bold' },

    // Remarks and Tax Summary
    summaryRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        alignItems: 'stretch',
    },
    remarksBox: { width: '38%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    gstinBox: { width: '25%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, justifyContent: 'center', alignItems: 'center' },
    taxSummaryLabel: { width: '25%', borderRightWidth: 1, borderRightColor: '#000', padding: 2 },
    taxSummaryValue: { width: '12%', padding: 2, alignItems: 'flex-end' },

    // Amount in Words & Net Total
    wordsRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        alignItems: 'stretch',
    },
    wordsBox: { width: '65%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    netTotalBox: { width: '35%', padding: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    // Footer
    footerRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    bankDetailsBox: { width: '65%', padding: 5 },
    signatureBox: { width: '35%', padding: 5, alignItems: 'center', justifyContent: 'space-between' },
});

const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const numberToWords = (num) => {
    if (!num) return '';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const count = (n, suffix) => {
        if (n === 0) return '';
        let str = '';
        if (n > 99) {
            str += a[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            str += a[n] + ' ';
        }
        return str + suffix + ' ';
    };

    let n = Math.floor(num);
    let str = '';
    str += count(Math.floor(n / 10000000), 'Crore');
    str += count(Math.floor((n % 10000000) / 100000), 'Lakh');
    str += count(Math.floor((n % 100000) / 1000), 'Thousand');
    str += count(Math.floor((n % 1000) / 100), 'Hundred');

    let rem = n % 100;
    if (rem > 19) {
        str += b[Math.floor(rem / 10)] + ' ';
        rem %= 10;
    }
    if (rem > 0) {
        if (n > 100 && (n % 100) < 20) {
            str += 'and ';
        }
        str += a[rem] + ' ';
    }

    return str.trim() + ' Rupees Only';
};

const InvoiceDocument = ({ data }) => {
    const { company, bank_details, bill_to, ship_to, header, details, totals, remarks } = data;

    const totalPfAmount = details?.reduce((sum, item) => sum + ((Number(item.pf || 0) / 100) * Number(item.basic || 0)), 0) || 0;

    return (
        <Document title={`Invoice-${header?.invoice_no}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.pageBorder}>

                    {/* Header Row 1 */}
                    <Text style={styles.mainTitle}>TAX INVOICE</Text>

                    {/* Company Details */}
                    <View style={styles.companyHeader}>
                        <View style={styles.companyDetailsText}>
                            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#000', marginBottom: 12 }}>{company?.name || 'Terrific Technologies'}</Text>
                            <Text>{company?.address || company?.address1 || '62/1, Chitralaya Nagar, Nallur, Tamil Nadu, Tiruppur-641606'}</Text>
                            <Text>Mobile : {company?.mobile || '9944680677'}</Text>
                            <Text style={styles.bold}>GSTIN NO: {company?.gstin || company?.tin || '33AAYFT1975H1ZK'}</Text>
                        </View>
                        <View style={styles.logoTextContainer}>
                            <Image style={{ width: 120, objectFit: 'contain' }} src={logoBase64} />
                        </View>
                    </View>

                    {/* Header Row 2 */}
                    <View style={styles.row}>
                        <View style={styles.billToBox}>
                            <Text style={styles.bold}>Bill To</Text>
                            <Text>Mr./Ms. {bill_to?.name}</Text>
                            <Text>{bill_to?.address}</Text>
                            <Text style={{ marginTop: 4 }}>Phone : {bill_to?.phone}</Text>
                            <Text style={styles.bold}>GSTIN : {bill_to?.gstin}</Text>
                        </View>
                        <View style={styles.shipToBox}>
                            <Text style={styles.bold}>Ship to</Text>
                            <Text>Mr./Ms. {ship_to?.name}</Text>
                            <Text>{ship_to?.address}</Text>
                            <Text style={{ marginTop: 4 }}>Phone : {ship_to?.phone}</Text>
                        </View>
                        <View style={styles.metaBox}>
                            <View style={styles.flexRowBetween}>
                                <Text>Invoice No</Text><Text>: {header?.invoice_no}</Text>
                            </View>
                            <View style={styles.flexRowBetween}>
                                <Text>Date</Text><Text>: {header?.date}</Text>
                            </View>
                            <View style={styles.flexRowBetween}>
                                <Text>DC No</Text><Text>: {header?.dc_no}</Text>
                            </View>
                            <View style={styles.flexRowBetween}>
                                <Text>Engineer</Text><Text>: {header?.engineer}</Text>
                            </View>
                            <View style={styles.flexRowBetween}>
                                <Text>Payment</Text><Text>: {header?.payment_terms}</Text>
                            </View>
                            <View style={styles.flexRowBetween}>
                                <Text>Terms</Text><Text></Text>
                            </View>
                        </View>
                    </View>

                    {/* Items Header */}
                    <View style={styles.itemsHeaderRow}>
                        <View style={styles.colSn}><Text>S</Text><Text>No</Text></View>
                        <View style={styles.colModel}><Text style={{ textAlign: 'center' }}>Model</Text></View>
                        <View style={styles.colCap}><Text>Capacity</Text></View>
                        <View style={styles.colDesc}><Text style={{ textAlign: 'center' }}>Description</Text></View>
                        <View style={styles.colHsn}><Text>HSN/SA</Text><Text>C</Text></View>
                        <View style={styles.colQty}><Text>Qty</Text></View>
                        <View style={styles.colUnit}><Text>Unit</Text><Text>Price</Text></View>
                        <View style={styles.colBuy}><Text>Buy</Text><Text>Back</Text></View>
                        <View style={styles.colBasic}><Text>Basic</Text></View>
                        <View style={styles.colPf}><Text>P&F</Text></View>
                        <View style={styles.colTax}><Text>Tax Value</Text></View>
                        <View style={styles.colTotal}><Text style={{ textAlign: 'center' }}>Total Price</Text></View>
                    </View>

                    {/* Items List */}
                    {details?.map((item, i) => (
                        <View style={styles.itemsRow} key={i}>
                            <View style={styles.colSn}><Text>{item.s_no}</Text></View>
                            <View style={styles.colModel}><Text>{item.model_name || item.model || item.modal}</Text></View>
                            <View style={styles.colCap}><Text>{item.capacity}</Text></View>
                            <View style={styles.colDesc}><Text>{item.description}</Text></View>
                            <View style={styles.colHsn}><Text>{item.hsn}</Text></View>
                            <View style={styles.colQty}>
                                <Text>{item.qty} -</Text>
                                <Text>{item.unit_name}</Text>
                            </View>
                            <View style={styles.colUnit}><Text>{formatMoney(item.unit_price)}</Text></View>
                            <View style={styles.colBuy}><Text>{formatMoney(item.buy_back)}</Text></View>
                            <View style={styles.colBasic}><Text>{formatMoney(item.basic)}</Text></View>
                            <View style={styles.colPf}>
                                <Text>{Number(item.pf || 0).toFixed(2)}%</Text>
                                <Text>{formatMoney((item.pf / 100) * item.basic)}</Text>
                            </View>
                            <View style={styles.colTax}>
                                <Text>{Number(item.tax_percent || 18).toFixed(2)}%</Text>
                                <Text>{formatMoney(item.tax_value)}</Text>
                            </View>
                            <View style={styles.colTotal}>
                                <Text>{formatMoney(item.total_price)}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Total Row */}
                    <View style={styles.totalRow}>
                        <View style={styles.colTotalLabel}><Text>Total</Text></View>
                        <View style={styles.colBasic}><Text>{formatMoney(totals?.sub_total)}</Text></View>
                        <View style={styles.colPf}><Text>{formatMoney(totalPfAmount)}</Text></View>
                        <View style={styles.colTax}><Text>{formatMoney((totals?.sgst_amount || 0) + (totals?.cgst_amount || 0) + (totals?.igst_amount || 0))}</Text></View>
                        <View style={styles.colTotal}><Text>{formatMoney(totals?.grand_total)}</Text></View>
                    </View>

                    {/* Sub Total Row */}
                    <View style={styles.subTotalRow}>
                        <View style={styles.colSubTotalLabel}><Text>Sub Total</Text></View>
                        <View style={styles.colTotal}><Text style={styles.bold}>{formatMoney(totals?.grand_total)}</Text></View>
                    </View>

                    {/* Remarks and Tax Summary */}
                    <View style={styles.summaryRow}>
                        <View style={styles.remarksBox}>
                            <Text><Text style={styles.bold}>Remarks:</Text> {remarks}</Text>
                        </View>
                        <View style={styles.gstinBox}>
                            <Text style={styles.bold}>GSTIN   {bill_to?.gstin}</Text>
                        </View>
                        <View style={styles.taxSummaryLabel}>
                            <Text style={styles.bold}>SGST</Text>
                            <Text style={styles.bold}>CGST</Text>
                            <Text style={styles.bold}>IGST</Text>
                            <Text style={styles.bold}>Freight</Text>
                        </View>
                        <View style={styles.taxSummaryValue}>
                            <Text>{formatMoney(totals?.sgst_amount)}</Text>
                            <Text>{formatMoney(totals?.cgst_amount)}</Text>
                            <Text>{formatMoney(totals?.igst_amount)}</Text>
                            <Text>{formatMoney(totals?.freight)}</Text>
                        </View>
                    </View>

                    {/* Amount in Words & Net Total */}
                    <View style={styles.wordsRow}>
                        <View style={styles.wordsBox}>
                            <Text><Text style={styles.bold}>Amount (in words):</Text> {numberToWords(totals?.grand_total)}</Text>
                        </View>
                        <View style={styles.netTotalBox}>
                            <Text style={styles.bold}>Net Total(Incl Tax)</Text>
                            <Text style={styles.bold}>{formatMoney(totals?.grand_total)}</Text>
                        </View>
                    </View>

                    {/* Bank Details & Signature */}
                    <View style={styles.footerRow}>
                        <View style={styles.bankDetailsBox}>
                            <Text style={styles.bold}>Bank Details</Text>
                            <Text style={{ marginTop: 2 }}>Name : {bank_details?.name}</Text>
                            <Text>A/c No : {bank_details?.ac_no}</Text>
                            <Text>Branch : {bank_details?.branch}</Text>
                            <Text>IFSC Code : {bank_details?.ifsc}</Text>
                            <Text>Bank : {bank_details?.bank}</Text>
                            <Text>Account Type: {bank_details?.account_type}</Text>
                        </View>
                        <View style={styles.signatureBox}>
                            <Text style={{ marginTop: 20 }}>For</Text>
                            <Text style={{ marginTop: 40, marginBottom: 10 }}>Authorised Signature</Text>
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
};

const SalesInvoicePrint = () => {
    const { id } = useParams();
    const { setLoading } = useLoader();
    const [printData, setPrintData] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const fetchPrintData = async () => {
            setLoading(true);
            setErrorMsg(null);
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/print/${id}`, { headers });

                let result;
                try {
                    result = await response.json();
                } catch (e) {
                    // Not JSON (e.g. standard Laravel 404 HTML)
                    setErrorMsg(`HTTP Error: ${response.status} - Route might not exist on the API.`);
                    return;
                }

                if (response.ok && result.status && result.data) {
                    setPrintData(result.data);
                } else {
                    console.error("Failed to fetch print data");
                    setErrorMsg(result.message || `Failed with status ${response.status}`);
                }
            } catch (error) {
                console.error("Error fetching print data:", error);
                setErrorMsg("A network error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrintData();
    }, [id]);

    if (errorMsg) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h2 style={{ color: 'red' }}>Error Loading Invoice</h2>
                <p>{errorMsg}</p>
                <button
                    onClick={() => window.close()}
                    style={{ marginTop: '1rem', padding: '8px 16px', cursor: 'pointer' }}
                >
                    Close Window
                </button>
            </div>
        );
    }

    if (!printData) {
        return null;
    }

    const fileName = printData.header?.invoice_no ? `Invoice-${printData.header.invoice_no}.pdf` : 'Invoice.pdf';
    document.title = fileName;

    const handleDownload = async () => {
        setLoading(true);
        try {
            const blob = await pdf(<InvoiceDocument data={printData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
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
            const blob = await pdf(<InvoiceDocument data={printData} />).toBlob();
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
                <PDFViewer width="100%" height="100%" showToolbar={true}>
                    <InvoiceDocument data={printData} />
                </PDFViewer>
            </div>
        </div>
    );
};

export default SalesInvoicePrint;
