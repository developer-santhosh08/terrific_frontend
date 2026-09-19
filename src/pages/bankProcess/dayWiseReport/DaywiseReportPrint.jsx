import { logoBase64 } from '../../../assets/logoBase64';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    fontSize: 9,
    lineHeight: 1.3,
  },
  pageBorder: {
    borderWidth: 1,
    borderColor: '#000',
    flex: 1,
  },
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
  logoTextContainer: {
    padding: 6,
    alignSelf: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: '#22C1C3'
  },
  metaHeader: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontFamily: 'Helvetica-Bold',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f1f5f9',
    fontFamily: 'Helvetica-Bold',
    alignItems: 'stretch',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    alignItems: 'stretch',
  },
  cellSn: { width: '8%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  cellDate: { width: '15%', paddingTop: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  cellVoucher: { width: '15%', paddingTop: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  cellAccount: { width: '32%', paddingTop: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4, borderRightWidth: 1, borderRightColor: '#000' },
  cellType: { width: '15%', paddingTop: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#000' },
  cellAmount: { width: '15%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 4, textAlign: 'right' },
  totalsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    alignItems: 'stretch',
  },
  totalsLabel: {
    width: '85%',
    padding: 4,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  totalsValue: {
    width: '15%',
    padding: 4,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
});

const formatNumber = (num) => {
  return Number(num || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const safeText = (val) => {
  return val === null || val === undefined || val === '' ? ' ' : String(val);
};

const DaywiseReportDocument = ({ data, fromDate, toDate }) => {
  const records = Array.isArray(data) ? data : (data?.data || []);
  
  const totalAmount = records.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <Document title="Daywise Expense Report">
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder}>

          <Text style={styles.mainTitle}>DAYWISE EXPENSE REPORT</Text>

          <View style={styles.companyHeader}>
            <View style={styles.companyDetailsText}>
              <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#000', marginBottom: 12 }}>Terrific Technologies</Text>
              <Text>62/1, Chitralaya Nagar, Nallur, Tamil Nadu, Tiruppur-641606</Text>
              <Text>Mobile : 9944680677</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>GSTIN NO: 33AAYFT1975H1ZK</Text>
            </View>
            <View style={styles.logoTextContainer}>
              <Image style={{ width: 120, objectFit: 'contain' }} src={logoBase64} />
            </View>
          </View>

          <View style={styles.metaHeader}>
             <Text><Text style={styles.metaText}>From Date:</Text> {safeText(fromDate)}</Text>
             <Text><Text style={styles.metaText}>To Date:</Text> {safeText(toDate)}</Text>
          </View>

          <View style={styles.tableHeaderRow}>
            <View style={styles.cellSn}><Text>S.No</Text></View>
            <View style={styles.cellDate}><Text>Date</Text></View>
            <View style={styles.cellVoucher}><Text>Voucher No</Text></View>
            <View style={styles.cellAccount}><Text>Account / Pay To</Text></View>
            <View style={styles.cellType}><Text>Mode</Text></View>
            <View style={styles.cellAmount}><Text>Amount</Text></View>
          </View>

          {records.map((r, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.cellSn}><Text>{i + 1}</Text></View>
              <View style={styles.cellDate}><Text>{safeText(r.date || r.voucher_date)}</Text></View>
              <View style={styles.cellVoucher}><Text>{safeText(r.voucher_no || r.reference_no)}</Text></View>
              <View style={styles.cellAccount}><Text>{safeText(r.account_name || r.pay_to || r.name)}</Text></View>
              <View style={styles.cellType}><Text>{safeText(r.payment_mode || r.type)}</Text></View>
              <View style={styles.cellAmount}><Text>{formatNumber(r.amount)}</Text></View>
            </View>
          ))}

          {records.length > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Amount</Text>
              <Text style={styles.totalsValue}>{formatNumber(totalAmount)}</Text>
            </View>
          )}

          {records.length === 0 && (
            <View style={{ padding: 20, textAlign: 'center' }}>
              <Text>No records found for the selected date range.</Text>
            </View>
          )}

        </View>
      </Page>
    </Document>
  );
};

const DaywiseReportPrint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportData, fromDate, toDate } = location.state || {};

  if (!reportData) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h3>No report data found. Please generate the report first.</h3>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', marginTop: 10 }}>Go Back</button>
      </div>
    );
  }

  const fileName = `Daywise_Report_${fromDate}_to_${toDate}.pdf`;

  const handleDownload = async () => {
    try {
      const blob = await pdf(<DaywiseReportDocument data={reportData} fromDate={fromDate} toDate={toDate} />).toBlob();
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
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert('Sharing is not supported on this browser.');
      return;
    }
    try {
      const blob = await pdf(<DaywiseReportDocument data={reportData} fromDate={fromDate} toDate={toDate} />).toBlob();
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
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <div style={{ height: '45px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate(-1)} style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
            ← Back
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{fileName.replace('.pdf', '')}</span>
        </div>
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
          <DaywiseReportDocument data={reportData} fromDate={fromDate} toDate={toDate} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default DaywiseReportPrint;
