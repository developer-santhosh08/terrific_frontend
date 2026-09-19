import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Login from '../components/Login/Login';
import Dashboard from '../components/Dashboard/Dashboard';
import NotFound from '../components/NotFound';
import Loader from '../components/Loader';
import RequirePermission from '../components/RequirePermission';

// Lazy loaded Module Routes for performance
const Profile = React.lazy(() => import('../pages/profile/Profile'));
const CompanyProfile = React.lazy(() => import('../pages/company/CompanyProfile'));
const QuotationRoutes = React.lazy(() => import('../pages/quotation/QuotationRoutes'));
const SalesContactRoutes = React.lazy(() => import('../pages/salesContact/SalesContactRoutes'));
const WorkPlanRoutes = React.lazy(() => import('../pages/workPlan/WorkPlanRoutes'));
const EnquiryRoutes = React.lazy(() => import('../pages/enquiry/EnquiryRoutes'));
const SalesRoutes = React.lazy(() => import('../pages/sales/SalesRoutes'));
const ContraRoutes = React.lazy(() => import('../pages/contra/ContraRoutes'));
const InventoryRoutes = React.lazy(() => import('../pages/inventory/InventoryRoutes'));
const BankProcessRoutes = React.lazy(() => import('../pages/bankProcess/BankProcessRoutes'));
const PowerMasterRoutes = React.lazy(() => import('../pages/powerMaster/PowerMasterRoutes'));
const UserRightsRoutes = React.lazy(() => import('../pages/userRights/UserRightsRoutes'));
const ReportingRoutes = React.lazy(() => import('../pages/reporting/ReportingRoutes'));
const ReportRoutes = React.lazy(() => import('../pages/report/report/ReportRoutes'));
const PayrollRoutes = React.lazy(() => import('../pages/payroll/PayrollRoutes'));
const PurchaseOrderPrint = React.lazy(() => import('../pages/inventory/PurchaseOrder/PurchaseOrderPrint'));
const AdvancedPaymentPrint = React.lazy(() => import('../pages/inventory/AdvancedPayments/AdvancedPaymentPrint'));
const FurtherReceiptPrint = React.lazy(() => import('../pages/inventory/FurtherRecipt/FurtherReceiptPrint'));
const ReceiptVoucherPrint = React.lazy(() => import('../pages/inventory/FurtherRecipt/ReceiptVoucherPrint'));
const DirectPurchaseOrderPrint = React.lazy(() => import('../pages/inventory/DirectGrn/DirectPurchaseOrderPrint'));
const ProformaPdfPrint = React.lazy(() => import('../pages/enquiry/ProformaPdfPrint'));
const QuotationPdfPrint = React.lazy(() => import('../pages/enquiry/QuotationPdfPrint'));
const DaywiseReportPrint = React.lazy(() => import('../pages/bankProcess/dayWiseReport/DaywiseReportPrint'));
const CashDiscountPrint = React.lazy(() => import('../pages/enquiry/CashDiscountPrint'));
const SalesAdvanceReceiptPrint = React.lazy(() => import('../pages/sales/advanceRecipt/SalesAdvanceReceiptPrint'));
const SalesFurtherReceiptPrint = React.lazy(() => import('../pages/sales/furtherReceipt/SalesFurtherReceiptPrint'));
const SalesFurtherReceiptVoucherPrint = React.lazy(() => import('../pages/sales/furtherReceipt/SalesFurtherReceiptVoucherPrint'));
const AdvanceReceiptVoucherPrint = React.lazy(() => import('../pages/inventory/FurtherRecipt/ReceiptVoucherPrint'));
const SalesInvoicePrint = React.lazy(() => import('../pages/sales/Invoice/SalesInvoicePrint'));
const PaymentVoucherPrint = React.lazy(() => import('../pages/bankProcess/paymentVoucher/PaymentVoucherPrint'));
const ReturnReceiptPrint = React.lazy(() => import('../pages/sales/completsSales/ReturnReceiptPrint'));

// Auth guards
const checkAuth = () => {
    return sessionStorage.getItem('erp_auth') === 'true' || localStorage.getItem('erp_auth') === 'true';
};

const GuestRoute = ({ children }) => {
    const isAuthenticated = checkAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = checkAuth();
    const location = useLocation();
    return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

const FallbackLoader = () => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <Loader />
    </div>
);

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

            <Route path="/print/purchase-order/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Inventory.Purchase Order List.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <PurchaseOrderPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/advanced-payments/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Inventory.Advanced Payment List.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <AdvancedPaymentPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/further-receipt/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Inventory.Further Receipt List.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <FurtherReceiptPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/further-receipt-voucher/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Inventory.Further Receipt List.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <ReceiptVoucherPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/sales-further-receipt/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Sales.Further Receipt.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <SalesFurtherReceiptPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/sales-further-receipt-voucher/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Sales.Further Receipt.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <SalesFurtherReceiptVoucherPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/advance-receipt-voucher/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Inventory.Advanced Payment List.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <AdvanceReceiptVoucherPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/sales-advance-receipt/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Sales.Advanced Receipt.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <SalesAdvanceReceiptPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/cash-discount/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Enquiry.Cash Discount - Receipt List.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <CashDiscountPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/direct-grn/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Inventory.Direct GRN.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <DirectPurchaseOrderPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/enquiry/quotationPdf/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Enquiry.Enquiry.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <QuotationPdfPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/enquiry/proformaQuotation/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Enquiry.Enquiry.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <ProformaPdfPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/sales-invoice/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Sales.Invoice.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <SalesInvoicePrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/return-receipt/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Sales.Invoice.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <ReturnReceiptPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/payment-voucher/:id" element={
                <ProtectedRoute>
                    <RequirePermission permission="Bank Process.Payment Voucher.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <PaymentVoucherPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />
            <Route path="/print/daywise-report" element={
                <ProtectedRoute>
                    <RequirePermission permission="Bank Process.Daywise Report.Print">
                        <Suspense fallback={<FallbackLoader />}>
                            <DaywiseReportPrint />
                        </Suspense>
                    </RequirePermission>
                </ProtectedRoute>
            } />

            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={
                    <RequirePermission permission={['Dashboard.Overview.View', 'Dashboard.Analytics.View']}>
                        <Dashboard />
                    </RequirePermission>
                } />
                <Route path="profile" element={
                    <Suspense fallback={<FallbackLoader />}>
                        <Profile />
                    </Suspense>
                } />
                <Route path="global-settings" element={
                    <Suspense fallback={<FallbackLoader />}>
                        <CompanyProfile />
                    </Suspense>
                } />

                {/* Module Routes wrapped in Suspense for lazy loading */}
                <Route path="*" element={
                    <Suspense fallback={<FallbackLoader />}>
                        <Routes>
                            <Route path="quotation/*" element={<QuotationRoutes />} />
                            <Route path="/sales-contact/*" element={<SalesContactRoutes />} />
                            <Route path="/work-plan/*" element={<WorkPlanRoutes />} />
                            <Route path="enquiry/*" element={<EnquiryRoutes />} />
                            <Route path="sales/*" element={<SalesRoutes />} />
                            <Route path="contra/*" element={<ContraRoutes />} />
                            <Route path="inventory/*" element={<InventoryRoutes />} />
                            <Route path="bank-process/*" element={<BankProcessRoutes />} />
                            <Route path="power-master/*" element={<PowerMasterRoutes />} />
                            <Route path="user-rights/*" element={<UserRightsRoutes />} />
                            <Route path="reporting/*" element={<ReportingRoutes />} />
                            <Route path="report/*" element={<ReportRoutes />} />
                            <Route path="payroll/*" element={<PayrollRoutes />} />
                            <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>
                    </Suspense>
                } />
            </Route>

            {/* Global 404 Page (Outside MainLayout so it is Full Screen) */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
};

export default AppRouter;
