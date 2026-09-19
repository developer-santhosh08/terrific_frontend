import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica', paddingTop: 40 },
    header: { fontSize: 24, marginBottom: 30, textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' },
    table: { display: 'flex', flexDirection: 'column', width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#000000' },
    tableRow: { display: 'flex', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000' },
    tableColHeader: { backgroundColor: '#f3f4f6', padding: 8, fontWeight: 'bold', borderRightWidth: 1, borderRightColor: '#000000', display: 'flex', justifyContent: 'center' },
    tableColValue: { padding: 8, borderRightWidth: 1, borderRightColor: '#000000', display: 'flex', justifyContent: 'center' },
    cellText: { fontSize: 10, textAlign: 'left' },
    
    // Column Widths
    col1: { width: '5%' },
    col2: { width: '15%' },
    col3: { width: '20%' },
    col4: { width: '20%' },
    col5: { width: '25%' },
    col6: { width: '15%', borderRightWidth: 0 }, // Last column has no right border
});

const ContraReceiptPDF = ({ data }) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <Text style={styles.header}>Contra Receipt</Text>
            <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                    <View style={{ ...styles.tableColHeader, ...styles.col1 }}><Text style={styles.cellText}>#</Text></View>
                    <View style={{ ...styles.tableColHeader, ...styles.col2 }}><Text style={styles.cellText}>Contra Date</Text></View>
                    <View style={{ ...styles.tableColHeader, ...styles.col3 }}><Text style={styles.cellText}>Contra Receipt Date</Text></View>
                    <View style={{ ...styles.tableColHeader, ...styles.col4 }}><Text style={styles.cellText}>Payment Type</Text></View>
                    <View style={{ ...styles.tableColHeader, ...styles.col5 }}><Text style={styles.cellText}>Name</Text></View>
                    <View style={{ ...styles.tableColHeader, ...styles.col6 }}><Text style={styles.cellText}>Amount</Text></View>
                </View>
                {/* Table Row */}
                <View style={{ ...styles.tableRow, borderBottomWidth: 0 }}>
                    <View style={{ ...styles.tableColValue, ...styles.col1 }}><Text style={styles.cellText}>1</Text></View>
                    <View style={{ ...styles.tableColValue, ...styles.col2 }}><Text style={styles.cellText}>{data.contraDate || '-'}</Text></View>
                    <View style={{ ...styles.tableColValue, ...styles.col3 }}><Text style={styles.cellText}>{data.receiptDate || '-'}</Text></View>
                    <View style={{ ...styles.tableColValue, ...styles.col4 }}><Text style={styles.cellText}>{data.paymentType || '-'}</Text></View>
                    <View style={{ ...styles.tableColValue, ...styles.col5 }}><Text style={styles.cellText}>{data.name || '-'}</Text></View>
                    <View style={{ ...styles.tableColValue, ...styles.col6 }}><Text style={styles.cellText}>{Number(data.amount).toFixed(3)}</Text></View>
                </View>
            </View>
        </Page>
    </Document>
);

export default ContraReceiptPDF;
