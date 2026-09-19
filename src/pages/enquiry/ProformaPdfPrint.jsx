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
    fontSize: 8,
    lineHeight: 1.3,
  },
  pageBorder: {
    borderWidth: 1,
    borderColor: '#000',
    flex: 1,
  },
  mainTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
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
    fontSize: 16,
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

  // 12-column widths layout
  cellSn: { width: '3%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 1, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellModel: { width: '9%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellCapacity: { width: '6%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellProduct: { width: '14%', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellHsn: { width: '6%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 1, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellPerUnit: { width: '11%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 2, textAlign: 'right', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellQty: { width: '3%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 1, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellDis: { width: '5%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 2, textAlign: 'right', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellBuyback: { width: '7%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 2, textAlign: 'right', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellBasic: { width: '11%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 2, textAlign: 'right', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellPf: { width: '6%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 1, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellTax: { width: '7%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 1, textAlign: 'center', flexGrow: 0, flexShrink: 0, borderRightWidth: 1, borderRightColor: '#000', fontSize: 6.5 },
  cellAmount: { width: '12%', paddingTop: 4, paddingBottom: 4, paddingLeft: 1, paddingRight: 2, textAlign: 'right', flexGrow: 0, flexShrink: 0, fontSize: 6.5 },

  // Totals styling
  totalsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    alignItems: 'stretch',
  },
  totalsLabel: {
    width: '90%',
    padding: 4,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderRightColor: '#000',
    flexGrow: 0,
    flexShrink: 0,
  },
  totalsValue: {
    width: '10%',
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

const ProformaDocument = ({ data }) => {
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
    <Document title={`Proforma - ${meta.reference_no || ''}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder}>

          <Text style={styles.mainTitle}>Proforma Invoice</Text>

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

          {/* Table */}
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
            <View style={styles.cellBasic}><Text>Basic</Text></View>
            <View style={styles.cellPf}><Text>PF Value</Text></View>
            <View style={styles.cellTax}><Text>Tax</Text></View>
            <View style={styles.cellAmount}><Text>Amount</Text></View>
          </View>

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
              <View style={styles.cellBasic}><Text>{formatNumber(p.basic)}</Text></View>
              <View style={styles.cellPf}>
                <Text>{formatNumber(p.pf_percentage)}%</Text>
                <Text>{formatNumber(p.pf_amount)}</Text>
              </View>
              <View style={styles.cellTax}>
                <Text>{formatNumber(p.tax_percentage)}%</Text>
                <Text>{formatNumber(p.tax_amount)}</Text>
              </View>
              <View style={styles.cellAmount}><Text>{formatNumber(p.amount)}</Text></View>
            </View>
          ))}

          {/* Totals Breakdown rows */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.total_basic)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Sub Total</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.sub_total)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>SGST Amount</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.sgst_amount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>CGST Amount</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.cgst_amount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>IGST Amount</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.igst_amount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Freight Value</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.freight_value)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Net Total</Text>
            <Text style={styles.totalsValue}>{formatNumber(totals.net_total)}</Text>
          </View>

          {/* Terms and conditions */}
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termItem}><Text style={styles.bold}>PF :</Text> {safeText(terms.pf)}</Text>
            <Text style={styles.termItem}><Text style={styles.bold}>Sales Tax :</Text> {safeText(terms.sales_tax)}</Text>
            <Text style={styles.termItem}><Text style={styles.bold}>PAYMENT :</Text> {safeText(terms.payment)}</Text>
            <Text style={styles.termItem}><Text style={styles.bold}>Delivery :</Text> {safeText(terms.delivery)}</Text>
            <Text style={styles.termItem}><Text style={styles.bold}>Warranty :</Text> {safeText(terms.warranty)}</Text>
            <Text style={styles.termItem}><Text style={styles.bold}>Freight :</Text> {safeText(terms.fright)}</Text>

            {/* <Text style={styles.redText}>For</Text> */}
          </View>

        </View>
      </Page>
    </Document>
  );
};

export default function ProformaPdfPrint() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { setLoading } = useLoader();

  useEffect(() => {
    const fetchPrintData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        const headers = {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/proforma/print/${id}`, { headers });
        const result = await response.json();
        if (result.status) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching proforma print details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPrintData();
    }
  }, [id, setLoading]);

  if (!data) {
    return <div style={{ padding: 20 }}>Loading PDF document...</div>;
  }

  const customerName = data.customer?.name || '';
  const fileName = customerName ? `Proforma-${data.quotation_meta?.reference_no || id}-${customerName}.pdf` : `Proforma_${data.quotation_meta?.reference_no || id}.pdf`;
  document.title = fileName;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(<ProformaDocument data={data} />).toBlob();
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
      const blob = await pdf(<ProformaDocument data={data} />).toBlob();
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
        <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} title={fileName}>
          <ProformaDocument data={data} />
        </PDFViewer>
      </div>
    </div>
  );
}
