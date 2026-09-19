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
    Image
} from '@react-pdf/renderer';
import { logoBase64 } from '../../../assets/logoBase64';

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10 },
    container: { borderWidth: 1, borderColor: '#000', flexDirection: 'column' },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
    rowNoBorder: { flexDirection: 'row' },
    col: { borderRightWidth: 1, borderRightColor: '#000' },
    cell: { padding: 6, justifyContent: 'center' },
    textBold: { fontFamily: 'Helvetica-Bold' },
    textCenter: { textAlign: 'center' },
    signatureRow: { flexDirection: 'row', height: 70 },
    signatureCell: { paddingBottom: 10, justifyContent: 'flex-end', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
    signatureCellLast: { paddingBottom: 10, justifyContent: 'flex-end', textAlign: 'center' }
});

const PaymentVoucherDoc = ({ data }) => {
    // Exact mapping from print API
    const payTo = data.pay_to || '';
    const paymentModeName = data.by_mode || '';
    const amount = data.amount || '0.00';
    const remark = data.work_details || '-';
    
    const suspenceOld = data.suspense?.old || '0.00';
    const suspenceCurrent = data.suspense?.current || '0.00';
    const suspenceNet = data.suspense?.net || '0.00';
    
    const salaryOld = data.salary_advance?.old || '0.00';
    const salaryCurrent = data.salary_advance?.current || '0.00';
    const salaryNet = data.salary_advance?.net || '0.00';
    
    const voucherNo = data.no || '';
    const displayDate = data.date || '';
    const projectName = data.project_name || '';
    const footerRemarks = data.remarks || '';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    {/* Row 1: Title */}
                    <View style={styles.row}>
                        <View style={{ width: '100%' }}>
                            <Text style={[styles.cell, styles.textBold, styles.textCenter, { fontSize: 16, color: '#174ea6' }]}>PAYMENT VOUCHER</Text>
                        </View>
                    </View>

                    {/* Row 2: Logo Only */}
                    <View style={styles.row}>
                        <View style={{ width: '60%', padding: 8, justifyContent: 'center' }}>
                            {/* Address removed as requested */}
                        </View>
                        <View style={{ width: '40%', padding: 8, justifyContent: 'center', alignItems: 'flex-end' }}>
                            <View style={{ backgroundColor: '#22C1C3', padding: 6, borderRadius: 4 }}>
                                <Image style={{ width: 160 }} src={logoBase64} />
                            </View>
                        </View>
                    </View>

                    {/* Row 3: Voucher No and Date */}
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '50%' }]}>
                            <Text style={styles.cell}>Voucher No : <Text style={styles.textBold}>{voucherNo}</Text></Text>
                        </View>
                        <View style={{ width: '50%' }}>
                            <Text style={styles.cell}>Date : <Text style={styles.textBold}>{displayDate}</Text></Text>
                        </View>
                    </View>

                    {/* Row 4: Pay To */}
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '70%' }]}>
                            <View style={styles.cell}>
                                <Text>Pay To:</Text>
                                <Text style={[styles.textBold, { marginTop: 4 }]}>{payTo}</Text>
                            </View>
                        </View>
                        <View style={{ width: '30%' }}>
                            <View style={styles.cell}>
                                <Text>Work Details/Others:</Text>
                                <Text style={[styles.textBold, { marginTop: 4 }]}>{remark}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Row 5: Amount Details */}
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '70%' }]}>
                            <View style={styles.cell}>
                                <Text>By {paymentModeName} as Rs. <Text style={styles.textBold}>{amount}</Text></Text>
                            </View>
                        </View>
                        <View style={{ width: '30%' }}>
                            <View style={styles.cell}>
                                <Text style={[styles.textBold, styles.textCenter]}>Details</Text>
                            </View>
                        </View>
                    </View>

                    {/* Row 6: Grid Headers */}
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '35%' }]}>
                            <Text style={styles.cell}>SUSPENCE</Text>
                        </View>
                        <View style={[styles.col, { width: '35%' }]}>
                            <Text style={styles.cell}>SALARY ADVANCE</Text>
                        </View>
                        <View style={{ width: '30%' }}>
                            <Text style={styles.cell}>PROJECT</Text>
                        </View>
                    </View>

                    {/* Row 7: Old */}
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>Old</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>{suspenceOld}</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>Old</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>{salaryOld}</Text></View>
                        <View style={{ width: '30%' }}><Text style={[styles.cell, { fontSize: 9 }]}>{projectName}</Text></View>
                    </View>

                    {/* Row 8: Current */}
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>Current</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>{suspenceCurrent}</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>Current</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>{salaryCurrent}</Text></View>
                        <View style={{ width: '30%' }}><Text style={styles.cell}> </Text></View>
                    </View>

                    {/* Row 7: Net */}
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>Net</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>{suspenceNet}</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>Net</Text></View>
                        <View style={[styles.col, { width: '17.5%' }]}><Text style={styles.cell}>{salaryNet}</Text></View>
                        <View style={{ width: '30%' }}><Text style={styles.cell}> </Text></View>
                    </View>

                    {/* Row 8: Remarks */}
                    <View style={styles.row}>
                        <View style={[styles.col, { width: '17.5%' }]}>
                            <Text style={styles.cell}>Remarks</Text>
                        </View>
                        <View style={{ width: '82.5%' }}>
                            <Text style={styles.cell}>{footerRemarks}</Text>
                        </View>
                    </View>

                    {/* Row 9: Signatures */}
                    <View style={styles.signatureRow}>
                        <View style={[styles.signatureCell, { width: '35%' }]}>
                            <Text>Authorised Sign</Text>
                        </View>
                        <View style={[styles.signatureCell, { width: '35%' }]}>
                            <Text>Approved by</Text>
                        </View>
                        <View style={[styles.signatureCell, { width: '15%' }]}>
                            <Text>Paid by</Text>
                        </View>
                        <View style={[styles.signatureCellLast, { width: '15%' }]}>
                            <Text>Receiver by</Text>
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
};

const PaymentVoucherPrint = () => {
    const { id } = useParams();
    const { setLoading } = useLoader();
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchVoucher = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const printRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/payment-voucher/${id}/print`, { headers });
                
                const printJson = await printRes.json();
                
                if (printJson.status === 'success' && printJson.data) {
                    const finalData = { ...printJson.data };
                    setData(finalData);
                } else {
                    console.error('Failed to load voucher for printing', printJson);
                }
            } catch (err) {
                console.error('Error loading voucher', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVoucher();
    }, [id, setLoading]);

    if (!data) return null;

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <PDFViewer style={{ width: '100%', height: '100%' }}>
                <PaymentVoucherDoc data={data} />
            </PDFViewer>
        </div>
    );
};

export default PaymentVoucherPrint;
