import { useLoader } from '../../context/LoaderContext';
import { Routes, Route } from 'react-router-dom';
import FollowupsList from './followups/FollowupsList';
import SiteVisitList from './siteVisit/SiteVisitList';
import SiteVisitEdit from './siteVisit/SiteVisitEdit';
import JobCardList from './jobCard/JobCardList';
import JobCardAdd from './jobCard/JobCardAdd';
import ErectionEdit from './jobCard/ErectionEdit';
import InvoiceList from './Invoice/InvoiceList';
import InvoiceEdit from './Invoice/InvoiceEdit';
import CompleteInvoiceEdit from './Invoice/CompleteInvoiceEdit';
import AdvancedReciptList from './advanceRecipt/AdvancedReciptList';
import AdvancedReciptCreate from './advanceRecipt/AdvancedReciptCreate';
import AdvancedReciptEdit from './advanceRecipt/AdvancedReciptEdit';

import CompleteSalesList from './completsSales/CompleteSalesList';
import CompleteSalesView from './completsSales/CompleteSalesView';
import ReturnReceiptPrint from './completsSales/ReturnReceiptPrint';
import UnallottedEnquiryList from './UnallottedEnquiry/UnallottedEnquiryList';
import ClosedEnquiryList from './ClosedEnquiry/ClosedEnquiryList';
import SalesReturnEnquiryList from './SalesReturn/EnqiuryList';
import FurtherReceiptList from './furtherReceipt/FurtherReceiptList';
import FurtherReceiptEdit from './furtherReceipt/FurtherReceiptEdit';
import FurtherReceiptUpdate from './furtherReceipt/FurtherReceiptUpdate';
import RequirePermission from '../../components/RequirePermission';

export default function SalesRoutes() {
    const { setLoading } = useLoader();
    return (
        <Routes>
            <Route path="followups" element={
                <RequirePermission permission="Sales.Followup.View">
                    <FollowupsList />
                </RequirePermission>
            } />
            <Route path="site-visit" element={
                <RequirePermission permission={["Sales.Followup.History", "Sales.Followup.Quotation", "Sales.Followup.Proforma"]}>
                    <SiteVisitList />
                </RequirePermission>
            } />
            <Route path="site-visit/edit/:id" element={
                <RequirePermission permission={["Sales.Followup.Convert"]}>
                    <SiteVisitEdit />
                </RequirePermission>
            } />
            <Route path="job-card" element={
                <RequirePermission permission={["Sales.Job Card.Print", "Sales.Job Card.Edit", "Sales.Job Card.Add"]}>
                    <JobCardList />
                </RequirePermission>
            } />
            <Route path="job-card/add" element={
                <RequirePermission permission="Sales.Job Card.Add">
                    <JobCardAdd />
                </RequirePermission>
            } />
            <Route path="erection/edit/:id" element={
                <RequirePermission permission="Sales.Job Card.Edit">
                    <ErectionEdit />
                </RequirePermission>
            } />
            <Route path="invoice" element={
                <RequirePermission permission={["Sales.Invoice.Print", "Sales.Invoice.Edit", "Sales.Invoice.Add"]}>
                    <InvoiceList />
                </RequirePermission>
            } />
            <Route path="invoice/edit/:id" element={
                <RequirePermission permission="Sales.Invoice.Edit">
                    <InvoiceEdit />
                </RequirePermission>
            } />
            <Route path="complete-invoice/edit/:id" element={
                <RequirePermission permission="Sales.Invoice.Edit">
                    <CompleteInvoiceEdit />
                </RequirePermission>
            } />
            <Route path="advanced-receipt" element={
                <RequirePermission permission="Sales.Advanced Receipt.View">
                    <AdvancedReciptList />
                </RequirePermission>
            } />
            <Route path="advanced-receipt/add/:id" element={
                <RequirePermission permission="Sales.Advanced Receipt.Edit">
                    <AdvancedReciptCreate />
                </RequirePermission>
            } />
            <Route path="advanced-receipt/edit/:id" element={
                <RequirePermission permission="Sales.Advanced Receipt.Edit">
                    <AdvancedReciptEdit />
                </RequirePermission>
            } />
            <Route path="complete-sales" element={
                <RequirePermission permission={["Sales.Invoice.Print", "Sales.Invoice.Edit"]}>
                    <CompleteSalesList />
                </RequirePermission>
            } />
            <Route path="complete-sales/view/:id" element={
                <RequirePermission permission={["Sales.Invoice.Print", "Sales.Invoice.Edit"]}>
                    <CompleteSalesView />
                </RequirePermission>
            } />
            <Route path="unallotted-enquiry" element={
                <RequirePermission permission={["Enquiry.Enquiry.View"]}>
                    <UnallottedEnquiryList />
                </RequirePermission>
            } />
            <Route path="closed-enquiry" element={
                <RequirePermission permission={["Enquiry.Enquiry.View"]}>
                    <ClosedEnquiryList />
                </RequirePermission>
            } />
            <Route path="sales-return" element={
                <RequirePermission permission={["Enquiry.Enquiry.View"]}>
                    <SalesReturnEnquiryList />
                </RequirePermission>
            } />
            <Route path="further-receipt" element={
                <RequirePermission permission="Sales.Further Receipt.View">
                    <FurtherReceiptList />
                </RequirePermission>
            } />
            <Route path="further-receipt/edit/:id" element={
                <RequirePermission permission="Sales.Further Receipt.Edit">
                    <FurtherReceiptEdit />
                </RequirePermission>
            } />
            <Route path="further-receipt/update/:id" element={
                <RequirePermission permission="Sales.Further Receipt.Edit">
                    <FurtherReceiptUpdate />
                </RequirePermission>
            } />
        </Routes>
    );
}
