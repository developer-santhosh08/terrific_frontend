import { Routes, Route } from 'react-router-dom';
import EnquiryList from './EnquiryList';
import EnquiryAdd from './EnquiryAdd';
import EnquiryEdit from './EnquiryEdit';
import EnquiryPrint from './EnquiryPrint';
import QuotationPdfPrint from './QuotationPdfPrint';
import ProformaPdfPrint from './ProformaPdfPrint';
import RequirePermission from '../../components/RequirePermission';
import CashDiscountList from './CashDiscountList';


export default function EnquiryRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission="Enquiry.Enquiry.View">
                    <EnquiryList />
                </RequirePermission>
            } />
            <Route path="add" element={
                <RequirePermission permission="Enquiry.Enquiry.Add">
                    <EnquiryAdd />
                </RequirePermission>
            } />
            <Route path="edit/:id" element={
                <RequirePermission permission="Enquiry.Enquiry.Edit">
                    <EnquiryEdit />
                </RequirePermission>
            } />
            <Route path="print/:id" element={
                <RequirePermission permission="Enquiry.Enquiry.Print">
                    <EnquiryPrint />
                </RequirePermission>
            } />
            <Route path="quotationPdf/:id" element={
                <RequirePermission permission="Enquiry.Enquiry.Print">
                    <QuotationPdfPrint />
                </RequirePermission>
            } />
            <Route path="proformaQuotation/:id" element={
                <RequirePermission permission="Enquiry.Enquiry.Print">
                    <ProformaPdfPrint />
                </RequirePermission>
            } />
            <Route path="cash-discount" element={
                <RequirePermission permission="Enquiry.Cash Discount - Pending List.View">
                    <CashDiscountList />
                </RequirePermission>
            } />
            {/* Print Route has been moved to AppRouter.jsx to render full screen without the application layout */}
        </Routes>
    );
}
