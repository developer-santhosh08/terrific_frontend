import { logoBase64 } from '../../assets/logoBase64';
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
    Image,
    pdf
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    container: {
        borderWidth: 1.5,
        borderColor: '#000',
        padding: 15,
        flexDirection: 'column',
    },
    title: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: '#1d4ed8',
        textAlign: 'center',
        padding: 8,
        textTransform: 'uppercase',
        borderBottomWidth: 1.5,
        borderBottomColor: '#000',
    },
    headerRow: {
        padding: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: '#000',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    companyInfo: {
        flex: 1,
        paddingRight: 10,
    },
    companyName: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
    },
    companyAddress: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#333',
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
    bodyContent: {
        padding: 15,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    metaText: {
        fontSize: 10,
        lineHeight: 1.5,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginVertical: 10,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginVertical: 6,
    },
    labelText: {
        width: 180,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    valueText: {
        flex: 1,
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: '#000',
        paddingBottom: 2,
    },
    amountSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 25,
        paddingTop: 10,
    },
    amountBox: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 12,
        borderWidth: 1.5,
        borderColor: '#000',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 15,
        paddingRight: 15,
    },
    signatureBox: {
        alignItems: 'center',
        width: 200,
    },
    signatureLine: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        width: '100%',
        textAlign: 'center',
        marginTop: 35,
        paddingTop: 5,
        fontSize: 9,
    },
    watermarkTop: {
        position: 'absolute',
        top: '25%',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 42,
        fontFamily: 'Helvetica-Bold',
        color: '#ef4444',
        opacity: 0.12,
        transform: 'rotate(-25deg)',
        zIndex: -1,
    }
});

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

const VoucherDocument = ({ data, type, isCancelled }) => {
    const { header, company, receipt_number, receipt_date, receipt_amount, payment_mode_name } = data;

    const words = numberToWords(receipt_amount);
    const address = [header?.customer_address1, header?.customer_address2, header?.customer_address3].filter(Boolean).join(', ');

    return (
        <Document title={header?.customer_name ? `Receipt-${receipt_number}-${header.customer_name}` : 'Receipt'}>
            <Page size="A4" style={styles.page}>
                {isCancelled && <Text style={styles.watermarkTop}>CANCELLED RECEIPT</Text>}
                <View style={[styles.container, { padding: 0 }]}>
                    <Text style={styles.title}>CASH RECEIPT</Text>

                    <View style={styles.headerRow}>
                        <View style={styles.companyInfo}>
                            <Text style={styles.companyName}>{company?.name}</Text>
                            <Text style={styles.companyAddress}>{company?.address1}</Text>
                            <Text style={styles.companyAddress}>Mobile : {company?.mobile}</Text>
                            <Text style={[styles.companyAddress, { fontFamily: 'Helvetica-Bold' }]}>GSTIN NO: {company?.tin}</Text>
                        </View>
                        <View style={styles.logoTextContainer}>
                            <Image style={{ width: 120, objectFit: 'contain' }} src={logoBase64} />
                        </View>
                    </View>

                    <View style={styles.bodyContent}>
                        <View style={styles.metaRow}>
                            <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.metaText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Receipt Number : </Text>{receipt_number}</Text>
                                <Text style={styles.metaText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Date                  : </Text>{receipt_date}</Text>
                                <Text style={styles.metaText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Payment Type    : </Text>Cash Receipt</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.contentRow}>
                            <Text style={styles.labelText}>Received with thanks Mr./Ms.</Text>
                            <Text style={styles.valueText}>: {header?.customer_name} {header?.customer_mobile ? `(${header.customer_mobile})` : ''}</Text>
                        </View>

                        <View style={styles.contentRow}>
                            <Text style={styles.labelText}>Address</Text>
                            <Text style={styles.valueText}>: {address}</Text>
                        </View>

                        <View style={styles.contentRow}>
                            <Text style={styles.labelText}>the sum of Rupee only by</Text>
                            <Text style={styles.valueText}>: {words}</Text>
                        </View>

                        <View style={styles.contentRow}>
                            <Text style={styles.labelText}>Payment Mode</Text>
                            <Text style={styles.valueText}>: {payment_mode_name}</Text>
                        </View>

                        <View style={styles.contentRow}>
                            <Text style={styles.labelText}>Details</Text>
                            <Text style={styles.valueText}>: date {receipt_date} through as cash receipt payment</Text>
                        </View>

                        <View style={styles.amountSection}>
                            <Text style={styles.amountBox}>Rs. {Number(receipt_amount || 0).toFixed(2)}/-</Text>
                            <View style={styles.signatureBox}>
                                <Text style={{ fontSize: 9 }}>For <Text style={{ fontFamily: 'Helvetica-Bold' }}>{company?.name}</Text></Text>
                                <Text style={styles.signatureLine}>Authorized Signatory</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

const CashDiscountPrint = () => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isCancelled = searchParams.get('cancelled') === 'true';
    const { setLoading } = useLoader();
    const [printData, setPrintData] = useState(null);

    // Determine type
    const type = 'cash_discount';
    const apiEndpoint = `${import.meta.env.VITE_API_BASE_URL}/api/enquiry/cash-discount/print/${id}`;

    useEffect(() => {
        const fetchPrintData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const response = await fetch(apiEndpoint, { headers });
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

        fetchPrintData();
    }, [id, apiEndpoint]);

    if (!printData) {
        return null;
    }

    const fileName = printData.header?.customer_name ? `Receipt-${printData.receipt_number}-${printData.header.customer_name}.pdf` : 'Receipt.pdf';
    document.title = fileName;

    const handleDownload = async () => {
        setLoading(true);
        try {
            const blob = await pdf(<VoucherDocument data={printData} type={type} isCancelled={isCancelled} />).toBlob();
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
            const blob = await pdf(<VoucherDocument data={printData} type={type} isCancelled={isCancelled} />).toBlob();
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
                    <VoucherDocument data={printData} type={type} isCancelled={isCancelled} />
                </PDFViewer>
            </div>
        </div>
    );
};

export default CashDiscountPrint;
