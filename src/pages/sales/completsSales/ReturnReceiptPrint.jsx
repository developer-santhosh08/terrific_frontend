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
    page: { padding: 20, fontFamily: 'Helvetica', fontSize: 8 },
    pageBorder: { borderWidth: 1, borderColor: '#000', flex: 1 },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', alignItems: 'stretch' },
    bold: { fontFamily: 'Helvetica-Bold' },
    mainTitle: {
        fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1d4ed8', textAlign: 'center', padding: 8,
        textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#000'
    },
    companyHeader: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#000', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    companyDetailsText: { flex: 1, paddingRight: 20 },
    logoTextContainer: { padding: 6, alignSelf: 'flex-end', alignItems: 'flex-start', backgroundColor: '#22C1C3' },
    billToBox: { width: '45%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    shipToBox: { width: '30%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    metaBox: { width: '25%', padding: 5 },
    flexRowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    itemsHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', fontFamily: 'Helvetica-Bold', alignItems: 'stretch' },
    itemsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', alignItems: 'stretch' },
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
    totalRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', alignItems: 'stretch' },
    colTotalLabel: { width: '65%', borderRightWidth: 1, borderRightColor: '#000', padding: 2, textAlign: 'center', justifyContent: 'center', fontFamily: 'Helvetica-Bold' },
    subTotalRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', alignItems: 'stretch' },
    colSubTotalLabel: { width: '89%', borderRightWidth: 1, borderRightColor: '#000', padding: 2, textAlign: 'right', justifyContent: 'center', fontFamily: 'Helvetica-Bold' },
    summaryRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', alignItems: 'stretch' },
    remarksBox: { width: '38%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    gstinBox: { width: '25%', borderRightWidth: 1, borderRightColor: '#000', padding: 5, justifyContent: 'center', alignItems: 'center' },
    taxSummaryLabel: { width: '25%', borderRightWidth: 1, borderRightColor: '#000', padding: 2 },
    taxSummaryValue: { width: '12%', padding: 2, alignItems: 'flex-end' },
    wordsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', alignItems: 'stretch' },
    wordsBox: { width: '65%', borderRightWidth: 1, borderRightColor: '#000', padding: 5 },
    netTotalBox: { width: '35%', padding: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerRow: { flexDirection: 'row', alignItems: 'stretch' },
    bankDetailsBox: { width: '65%', padding: 5 },
    signatureBox: { width: '35%', padding: 5, alignItems: 'center', justifyContent: 'space-between' },
});

const formatMoney = (amount) => Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const numberToWords = (num) => {
    if (!num) return '';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const count = (n, suffix) => {
        if (n === 0) return '';
        let str = '';
        if (n > 99) { str += a[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
        if (n > 19) { str += b[Math.floor(n / 10)] + ' '; n %= 10; }
        if (n > 0) { str += a[n] + ' '; }
        return str + suffix + ' ';
    };
    let n = Math.floor(num);
    let str = '';
    str += count(Math.floor(n / 10000000), 'Crore');
    str += count(Math.floor((n % 10000000) / 100000), 'Lakh');
    str += count(Math.floor((n % 100000) / 1000), 'Thousand');
    str += count(Math.floor((n % 1000) / 100), 'Hundred');
    let rem = n % 100;
    if (rem > 19) { str += b[Math.floor(rem / 10)] + ' '; rem %= 10; }
    if (rem > 0) {
        if (n > 100 && (n % 100) < 20) { str += 'and '; }
        str += a[rem] + ' ';
    }
    return str.trim() + ' Rupees Only';
};

const ReturnReceiptDocument = ({ data }) => {
    const { credit_note, invoice, products, bank_details } = data;

    let subTotal = 0;
    let sgstTotal = 0;
    let cgstTotal = 0;
    let igstTotal = 0;
    let grandTotal = 0;

    const details = products?.map((item, i) => {
        const qty = parseFloat(item.returned_quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const basic = qty * rate;
        const taxVal = parseFloat(item.tax_amount) || 0;
        const total = parseFloat(item.total_amount) || 0;
        const taxPercent = parseFloat(item.tax_percentage) || 0;
        
        subTotal += basic;
        sgstTotal += (taxVal / 2);
        cgstTotal += (taxVal / 2);
        grandTotal += total;

        return {
            s_no: i + 1,
            model_name: item.model_name || ' ',
            capacity: item.capacity || ' ',
            description: (item.product_description || ' ') + (item.serial_number ? ` (S/N: ${item.serial_number})` : ''),
            hsn: item.hsn_code || ' ',
            qty: qty,
            unit_name: item.unit_name || 'NOS',
            unit_price: rate,
            buy_back: 0,
            basic: basic,
            pf: 0,
            tax_percent: taxPercent,
            tax_value: taxVal,
            total_price: total
        };
    }) || [];

    return (
        <Document title={`CN-${credit_note?.credit_note_number || '0000'}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.pageBorder}>
                    <Text style={styles.mainTitle}>CREDIT NOTE / RETURN RECEIPT</Text>

                    <View style={styles.companyHeader}>
                        <View style={styles.companyDetailsText}>
                            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#000', marginBottom: 12 }}>Terrific Technologies</Text>
                            <Text>62/1, Chitralaya Nagar, Nallur, Tamil Nadu, Tiruppur-641606</Text>
                            <Text>Mobile : 9944680677</Text>
                            <Text style={styles.bold}>GSTIN NO: 33AAYFT1975H1ZK</Text>
                        </View>
                        <View style={styles.logoTextContainer}>
                            <Image style={{ width: 120, objectFit: 'contain' }} src={logoBase64} />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.billToBox}>
                            <Text style={styles.bold}>Bill To</Text>
                            <Text>Mr./Ms. {invoice?.company_name || ' '}</Text>
                            <Text>{invoice?.address1 || ' '}</Text>
                            <Text>{invoice?.address2 || ' '}</Text>
                            <Text>{invoice?.address3 || ' '}</Text>
                            <Text style={{ marginTop: 4 }}>Pincode : {invoice?.pincode || ' '}</Text>
                            <Text style={styles.bold}>GSTIN : {invoice?.gst_number || ' '}</Text>
                        </View>
                        <View style={styles.shipToBox}>
                            <Text style={styles.bold}>Ship to</Text>
                            <Text>Mr./Ms. {invoice?.company_name || ' '}</Text>
                            <Text>{invoice?.address1 || ' '}</Text>
                            <Text>{invoice?.address2 || ' '}</Text>
                            <Text>{invoice?.address3 || ' '}</Text>
                            <Text style={{ marginTop: 4 }}>Pincode : {invoice?.pincode || ' '}</Text>
                        </View>
                        <View style={styles.metaBox}>
                            <View style={styles.flexRowBetween}><Text>CN No</Text><Text>: {credit_note?.credit_note_number || ' '}</Text></View>
                            <View style={styles.flexRowBetween}><Text>CN Date</Text><Text>: {credit_note?.credit_note_date || ' '}</Text></View>
                            <View style={styles.flexRowBetween}><Text>Inv No</Text><Text>: {invoice?.invoice_number || ' '}</Text></View>
                            <View style={styles.flexRowBetween}><Text>Inv Date</Text><Text>: {invoice?.invoice_date || ' '}</Text></View>
                            <View style={styles.flexRowBetween}><Text>Engineer</Text><Text>:  </Text></View>
                            <View style={styles.flexRowBetween}><Text>Payment</Text><Text>:  </Text></View>
                            <View style={styles.flexRowBetween}><Text>Terms</Text><Text> </Text></View>
                        </View>
                    </View>

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

                    {details.map((item, i) => (
                        <View style={styles.itemsRow} key={i}>
                            <View style={styles.colSn}><Text>{item.s_no || ' '}</Text></View>
                            <View style={styles.colModel}><Text>{item.model_name || ' '}</Text></View>
                            <View style={styles.colCap}><Text>{item.capacity || ' '}</Text></View>
                            <View style={styles.colDesc}><Text>{item.description || ' '}</Text></View>
                            <View style={styles.colHsn}><Text>{item.hsn || ' '}</Text></View>
                            <View style={styles.colQty}>
                                <Text>{item.qty} -</Text>
                                <Text>{item.unit_name || 'NOS'}</Text>
                            </View>
                            <View style={styles.colUnit}><Text>{formatMoney(item.unit_price)}</Text></View>
                            <View style={styles.colBuy}><Text>{formatMoney(item.buy_back)}</Text></View>
                            <View style={styles.colBasic}><Text>{formatMoney(item.basic)}</Text></View>
                            <View style={styles.colPf}>
                                <Text>{Number(item.pf || 0).toFixed(2)}%</Text>
                                <Text>{formatMoney((item.pf / 100) * item.basic)}</Text>
                            </View>
                            <View style={styles.colTax}>
                                <Text>{Number(item.tax_percent || 0).toFixed(2)}%</Text>
                                <Text>{formatMoney(item.tax_value)}</Text>
                            </View>
                            <View style={styles.colTotal}>
                                <Text>{formatMoney(item.total_price)}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.totalRow}>
                        <View style={styles.colTotalLabel}><Text>Total</Text></View>
                        <View style={styles.colBasic}><Text>{formatMoney(subTotal)}</Text></View>
                        <View style={styles.colPf}><Text>{formatMoney(0)}</Text></View>
                        <View style={styles.colTax}><Text>{formatMoney(sgstTotal + cgstTotal + igstTotal)}</Text></View>
                        <View style={styles.colTotal}><Text>{formatMoney(grandTotal)}</Text></View>
                    </View>

                    <View style={styles.subTotalRow}>
                        <View style={styles.colSubTotalLabel}><Text>Sub Total</Text></View>
                        <View style={styles.colTotal}><Text style={styles.bold}>{formatMoney(grandTotal)}</Text></View>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.remarksBox}><Text><Text style={styles.bold}>Remarks:</Text> Goods Returned</Text></View>
                        <View style={styles.gstinBox}><Text style={styles.bold}>GSTIN   {invoice?.gst_number || ' '}</Text></View>
                        <View style={styles.taxSummaryLabel}>
                            <Text style={styles.bold}>SGST</Text>
                            <Text style={styles.bold}>CGST</Text>
                            <Text style={styles.bold}>IGST</Text>
                            <Text style={styles.bold}>Freight</Text>
                        </View>
                        <View style={styles.taxSummaryValue}>
                            <Text>{formatMoney(sgstTotal)}</Text>
                            <Text>{formatMoney(cgstTotal)}</Text>
                            <Text>{formatMoney(igstTotal)}</Text>
                            <Text>{formatMoney(0)}</Text>
                        </View>
                    </View>

                    <View style={styles.wordsRow}>
                        <View style={styles.wordsBox}><Text><Text style={styles.bold}>Amount (in words):</Text> {numberToWords(grandTotal)}</Text></View>
                        <View style={styles.netTotalBox}><Text style={styles.bold}>Net Total(Incl Tax)</Text><Text style={styles.bold}>{formatMoney(grandTotal)}</Text></View>
                    </View>

                    <View style={styles.footerRow}>
                        <View style={styles.bankDetailsBox}>
                            <Text style={styles.bold}>Bank Details</Text>
                            <Text style={{ marginTop: 2 }}>Name : {bank_details?.name || ' '}</Text>
                            <Text>A/c No : {bank_details?.ac_no || ' '}</Text>
                            <Text>Branch : {bank_details?.branch || ' '}</Text>
                            <Text>IFSC Code : {bank_details?.ifsc || ' '}</Text>
                            <Text>Bank : {bank_details?.bank || ' '}</Text>
                            <Text>Account Type: {bank_details?.account_type || ' '}</Text>
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

const ReturnReceiptPrint = () => {
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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/return-receipt/${id}`, { headers });
                
                let result;
                try {
                    result = await response.json();
                } catch (e) {
                    setErrorMsg(`HTTP Error: ${response.status}`);
                    return;
                }

                if (response.ok && result.status && result.data) {
                    setPrintData(result.data);
                } else {
                    setErrorMsg(result.message || `Failed with status ${response.status}`);
                }
            } catch (error) {
                console.error("Error fetching print data:", error);
                setErrorMsg("A network error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPrintData();
        }
    }, [id]);

    if (errorMsg) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h2 style={{ color: 'red' }}>Error Loading Return Receipt</h2>
                <p>{errorMsg}</p>
                <button onClick={() => window.close()} style={{ marginTop: '1rem', padding: '8px 16px', cursor: 'pointer' }}>Close Window</button>
            </div>
        );
    }

    if (!printData) {
        return null;
    }

    const fileName = printData.credit_note?.credit_note_number ? `CN-${printData.credit_note.credit_note_number}.pdf` : 'CreditNote.pdf';
    document.title = fileName;

    const handleDownload = async () => {
        setLoading(true);
        try {
            const blob = await pdf(<ReturnReceiptDocument data={printData} />).toBlob();
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
            const blob = await pdf(<ReturnReceiptDocument data={printData} />).toBlob();
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
                    <button onClick={handleShare} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Share PDF</button>
                    <button onClick={handleDownload} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Download PDF</button>
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <PDFViewer width="100%" height="100%" showToolbar={true}>
                    <ReturnReceiptDocument data={printData} />
                </PDFViewer>
            </div>
        </div>
    );
};

export default ReturnReceiptPrint;
