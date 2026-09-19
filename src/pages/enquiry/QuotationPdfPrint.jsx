import { logoBase64 } from '../../assets/logoBase64';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    color: '#1d4ed8', // Blue color for title
    textAlign: 'center',
    padding: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    alignItems: 'stretch',
  },
  col: {
    padding: 6,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  // Company info section (Full width)
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
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0891b2', // Teal/blue brand color
    marginBottom: 2,
  },
  companySubName: {
    fontSize: 9,
    color: '#0e7490',
    marginBottom: 4,
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
  // Split columns
  colTo: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 8,
  },
  colMetaBank: {
    width: '50%',
    padding: 8,
  },
  metaTextRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  metaLabel: {
    width: '35%',
    fontFamily: 'Helvetica-Bold',
  },
  metaValue: {
    width: '65%',
  },
  bankTitle: {
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginTop: 6,
    marginBottom: 4,
  },
  // Table styling
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
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  cellSn: { width: '4%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellModel: { width: '11%', paddingTop: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4, flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellCapacity: { width: '9%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellProduct: { width: '19%', paddingTop: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4, flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellHsn: { width: '7%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellPerUnit: { width: '12%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 4, textAlign: 'right', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellQty: { width: '4%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellDis: { width: '10%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 4, textAlign: 'right', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellBuyback: { width: '11%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 4, textAlign: 'right', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 7.5 },
  cellAmount: { width: '13%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 4, textAlign: 'right', flexGrow: 0, flexShrink: 0, fontSize: 7.5 },

  // Totals styling
  totalsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    alignItems: 'stretch',
  },
  totalsLabel: {
    width: '86%',
    padding: 4,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderRightColor: '#000',
    flexGrow: 0,
    flexShrink: 0,
  },
  totalsValue: {
    width: '14%',
    padding: 4,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    flexGrow: 0,
    flexShrink: 0,
  },

  // Terms and conditions
  termsSection: {
    padding: 10,
    flex: 1,
  },
  termsTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 6,
  },
  termItem: {
    marginBottom: 3,
  },
  redText: {
    color: '#dc2626',
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
  }
});

const QuotationDocument = ({ data }) => {
  const company = data.company_details || {};
  const customer = data.customer_details || {};
  const meta = data.quotation_meta || {};
  const bank = data.bank_details || {};
  const products = data.products || [];
  const totals = data.totals || {};
  const terms = data.terms_and_conditions || {};

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const safeText = (val) => {
    return val === null || val === undefined || val === '' ? ' ' : String(val);
  };

  return (
    <Document title={`Quotation - ${meta.reference_no || ''}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder}>

          <Text style={styles.mainTitle}>Quotation</Text>

          {/* Company Details */}
          <View style={styles.companyHeader}>
            <View style={styles.companyDetailsText}>
              <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#000', marginBottom: 12 }}>Terrific Technologies</Text>
              <Text>{safeText(company.address)}</Text>
              <Text>Mobile : {safeText(company.mobile)}</Text>
              <Text style={styles.bold}>GSTIN NO: {safeText(company.gstin)}</Text>
            </View>
            <View style={styles.logoTextContainer}>
              <Image style={{ width: 120, objectFit: 'contain' }} src={logoBase64} />
            </View>
          </View>

          {/* Split Row for Customer & Bank Details */}
          <View style={styles.row}>
            {/* Customer Details */}
            <View style={styles.colTo}>
              <Text style={styles.bold}>To</Text>
              <Text style={styles.bold}>{safeText(customer.name)}</Text>
              {customer.address1 ? <Text>{safeText(customer.address1)}</Text> : null}
              {customer.address2 ? <Text>{safeText(customer.address2)}</Text> : null}
              {customer.address3 ? <Text>{safeText(customer.address3)}</Text> : null}
              {customer.pincode ? <Text>Pincode - {safeText(customer.pincode)}</Text> : null}
              {customer.phone ? <Text>Phone : {safeText(customer.phone)}</Text> : null}
              {customer.gstin ? <Text style={styles.bold}>GSTIN NO: {safeText(customer.gstin)}</Text> : null}
            </View>

            {/* Meta & Bank Details */}
            <View style={styles.colMetaBank}>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>Date:</Text>
                <Text style={styles.metaValue}>{safeText(meta.date)}</Text>
              </View>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>ReferenceNo:</Text>
                <Text style={styles.metaValue}>{safeText(meta.reference_no)}</Text>
              </View>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>Engineer:</Text>
                <Text style={styles.metaValue}>{safeText(meta.engineer)}</Text>
              </View>

              <Text style={styles.bankTitle}>Bank Details</Text>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>Name:</Text>
                <Text style={styles.metaValue}>{safeText(bank.name)}</Text>
              </View>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>A.c No:</Text>
                <Text style={styles.metaValue}>{safeText(bank.ac_no)}</Text>
              </View>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>Branch:</Text>
                <Text style={styles.metaValue}>{safeText(bank.branch)}</Text>
              </View>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>IFSC Code:</Text>
                <Text style={styles.metaValue}>{safeText(bank.ifsc)}</Text>
              </View>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>Bank:</Text>
                <Text style={styles.metaValue}>{safeText(bank.bank)}</Text>
              </View>
              <View style={styles.metaTextRow}>
                <Text style={styles.metaLabel}>Account Type:</Text>
                <Text style={styles.metaValue}>{safeText(bank.account_type)}</Text>
              </View>
            </View>
          </View>

          {/* Products Table Header */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.cellSn}><Text>S.No</Text></View>
            <View style={styles.cellModel}><Text>Model</Text></View>
            <View style={styles.cellCapacity}><Text>Capacity (kw)</Text></View>
            <View style={styles.cellProduct}><Text>Product</Text></View>
            <View style={styles.cellHsn}><Text>HSN Code</Text></View>
            <View style={styles.cellPerUnit}><Text>Per Unit</Text></View>
            <View style={styles.cellQty}><Text>Qty</Text></View>
            <View style={styles.cellDis}><Text>Dis.</Text></View>
            <View style={styles.cellBuyback}><Text>Buyback</Text></View>
            <View style={styles.cellAmount}><Text>Amount</Text></View>
          </View>

          {/* Products Table Rows */}
          {products.map((p, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.cellSn}><Text>{safeText(p.s_no || (i + 1))}</Text></View>
              <View style={styles.cellModel}><Text>{safeText(p.model_name || p.model || p.modal)}</Text></View>
              <View style={styles.cellCapacity}><Text>{safeText(p.capacity_kw)}</Text></View>
              <View style={styles.cellProduct}><Text>{safeText(p.product_name)}</Text></View>
              <View style={styles.cellHsn}><Text>{safeText(p.hsn_code)}</Text></View>
              <View style={styles.cellPerUnit}><Text>{formatNumber(p.per_unit)}</Text></View>
              <View style={styles.cellQty}><Text>{safeText(p.qty)}</Text></View>
              <View style={styles.cellDis}><Text>{formatNumber(p.discount)}</Text></View>
              <View style={styles.cellBuyback}><Text>{formatNumber(p.buyback)}</Text></View>
              <View style={styles.cellAmount}><Text>{formatNumber(p.amount)}</Text></View>
            </View>
          ))}

          {/* Freight Value Row */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Freight Value</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.freight_value)}</Text>
          </View>

          {/* Net Total Row */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Net Total</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.net_total)}</Text>
          </View>

          {/* Terms and Conditions & Footer */}
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            {terms.pf ? <Text style={styles.termItem}><Text style={styles.bold}>PF :</Text> {terms.pf}</Text> : null}
            {terms.sales_tax ? <Text style={styles.termItem}><Text style={styles.bold}>Sales Tax :</Text> {terms.sales_tax}</Text> : null}
            {terms.payment ? <Text style={styles.termItem}><Text style={styles.bold}>PAYMENT :</Text> {terms.payment}</Text> : null}
            {terms.delivery ? <Text style={styles.termItem}><Text style={styles.bold}>Delivery :</Text> {terms.delivery}</Text> : null}
            {terms.warranty ? <Text style={styles.termItem}><Text style={styles.bold}>Warranty :</Text> {terms.warranty}</Text> : null}
            {terms.fright ? <Text style={styles.termItem}><Text style={styles.bold}>Freight :</Text> {terms.fright}</Text> : null}

            {/* <Text style={styles.redText}>For</Text> */}
          </View>

        </View>
      </Page>
    </Document>
  );
};

const QuotationPdfPrint = () => {
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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/quotation/print/${id}`, { headers });
        const result = await response.json();

        if (result.status && result.data) {
          setPrintData(result.data);
        } else {
          console.error("Failed to fetch quotation print data");
        }
      } catch (error) {
        console.error("Error fetching quotation print data:", error);
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

  const customerName = printData.customer?.name || '';
  const fileName = customerName ? `Quotation-${printData.quotation_meta?.reference_no || id}-${customerName}.pdf` : `Quotation_${printData.quotation_meta?.reference_no || id}.pdf`;
  document.title = fileName;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(<QuotationDocument data={printData} />).toBlob();
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
      const blob = await pdf(<QuotationDocument data={printData} />).toBlob();
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
          <QuotationDocument data={printData} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default QuotationPdfPrint;
