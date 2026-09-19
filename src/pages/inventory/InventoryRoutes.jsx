import { Routes, Route } from 'react-router-dom';
import StockDetails from './StockDetails';
import DirectPurchaseOrderList from './DirectGrn/DirectPurchaseOrderList';
import DirectPurchaseOrderAdd from './DirectGrn/DirectPurchaseOrderAdd';
import DirectPurchaseOrderEdit from './DirectGrn/DirectPurchaseOrderEdit';
import DirectPurchaseOrderPrint from './DirectGrn/DirectPurchaseOrderPrint';
import GrnList from './GrnInspection/GrnList';
import GrnAdd  from './GrnInspection/GrnAdd';
import GrnEdit from './GrnInspection/GrnEdit';
import PurchaseOrderList from './PurchaseOrder/PurchaseOrderList';
import PurchaseOrderAdd from './PurchaseOrder/PurchaseOrderAdd';
import PurchaseOrderEdit from './PurchaseOrder/PurchaseOrderEdit';
import PurchaseOrderPrint from './PurchaseOrder/PurchaseOrderPrint';
import SuggesdOrderList from './SuggestPurchaseOrder/SuggesdOrderList';
import FutureList from './FutureGrn/FutureList';
import FutureAdd from './FutureGrn/FutureAdd';
import AdvancedPaymentList from './AdvancedPayments/AdvancedPaymentList';
import AdvancePaymentEdit from './AdvancedPayments/AdvancePaymentEdit';
import AdvancedPaymentPrint from './AdvancedPayments/AdvancedPaymentPrint';
import AdvanceReceiptEdit from './AdvancedPayments/AdvanceReceiptEdit';
import StockTransferList from './StockTransfer/StockTransferList';
import FurtherReciptList from './FurtherRecipt/FurtherReciptList';
import ReciptEdit from './FurtherRecipt/ReciptEdit';
import ReciptUpdate from './FurtherRecipt/ReciptUpdate';
import RequirePermission from '../../components/RequirePermission';

export default function InventoryRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission="Inventory.Stock Details.View">
                    <StockDetails />
                </RequirePermission>
            } />
            <Route path="stock-details" element={
                <RequirePermission permission="Inventory.Stock Details.View">
                    <StockDetails />
                </RequirePermission>
            } />
            <Route path="direct-grn" element={
                <RequirePermission permission="Inventory.Direct GRN.View">
                    <DirectPurchaseOrderList />
                </RequirePermission>
            } />
            <Route path="direct-grn/add" element={
                <RequirePermission permission="Inventory.Direct GRN.Add">
                    <DirectPurchaseOrderAdd />
                </RequirePermission>
            } />
            <Route path="direct-grn/edit/:id" element={
                <RequirePermission permission="Inventory.Direct GRN.Edit">
                    <DirectPurchaseOrderEdit />
                </RequirePermission>
            } />
            <Route path="direct-grn/print/:id" element={
                <RequirePermission permission="Inventory.Direct GRN.Print">
                    <DirectPurchaseOrderPrint />
                </RequirePermission>
            } />
            <Route path="grn-inspection" element={
                <RequirePermission permission="Inventory.GRN Inspection List.View">
                    <GrnList />
                </RequirePermission>
            } />
            <Route path="grn-inspection/add" element={
                <RequirePermission permission="Inventory.GRN Inspection List.Add">
                    <GrnAdd />
                </RequirePermission>
            } />
            <Route path="grn-inspection/edit/:id" element={
                <RequirePermission permission="Inventory.GRN Inspection List.Edit">
                    <GrnEdit />
                </RequirePermission>
            } />
            <Route path="grn/add" element={
                <RequirePermission permission="Inventory.Direct GRN.Add">
                    <DirectPurchaseOrderAdd />
                </RequirePermission>
            } />
            <Route path="grn/edit/:id" element={
                <RequirePermission permission="Inventory.Direct GRN.Edit">
                    <DirectPurchaseOrderEdit />
                </RequirePermission>
            } />
            <Route path="purchase-order" element={
                <RequirePermission permission="Inventory.Purchase Order List.View">
                    <PurchaseOrderList />
                </RequirePermission>
            } />
            <Route path="purchase-order/add" element={
                <RequirePermission permission="Inventory.Purchase Order List.Add">
                    <PurchaseOrderAdd />
                </RequirePermission>
            } />
            <Route path="purchase-order/edit/:id" element={
                <RequirePermission permission="Inventory.Purchase Order List.Edit">
                    <PurchaseOrderEdit />
                </RequirePermission>
            } />
            <Route path="purchase-order/print/:id" element={
                <RequirePermission permission="Inventory.Purchase Order List.Print">
                    <PurchaseOrderPrint />
                </RequirePermission>
            } />
            <Route path="suggested-order" element={
                <RequirePermission permission="Inventory.Purchase Order List.View">
                    <SuggesdOrderList />
                </RequirePermission>
            } />
            <Route path="future-inspection" element={
                <RequirePermission permission="Inventory.GRN Inspection List.View">
                    <FutureList />
                </RequirePermission>
            } />
            <Route path="future-inspection/add" element={
                <RequirePermission permission="Inventory.GRN Inspection List.Add">
                    <FutureAdd />
                </RequirePermission>
            } />
            <Route path="future-inspection/edit/:id" element={
                <RequirePermission permission="Inventory.GRN Inspection List.Edit">
                    <FutureAdd />
                </RequirePermission>
            } />
            <Route path="advanced-payments" element={
                <RequirePermission permission="Inventory.Advanced Payment List.View">
                    <AdvancedPaymentList />
                </RequirePermission>
            } />
            <Route path="advanced-payments/edit/:id" element={
                <RequirePermission permission="Inventory.Advanced Payment List.Edit">
                    <AdvancePaymentEdit />
                </RequirePermission>
            } />
            <Route path="advanced-payments/print/:id" element={
                <RequirePermission permission="Inventory.Advanced Payment List.View">
                    <AdvancedPaymentPrint />
                </RequirePermission>
            } />
            <Route path="advanced-payments/receipt-edit/:id" element={
                <RequirePermission permission="Inventory.Advanced Payment List.Edit">
                    <AdvanceReceiptEdit />
                </RequirePermission>
            } />
            <Route path="stock-transfer" element={
                <RequirePermission permission="Inventory.Stock Details.View">
                    <StockTransferList />
                </RequirePermission>
            } />
            <Route path="further-receipt" element={
                <RequirePermission permission="Inventory.Further Receipt List.View">
                    <FurtherReciptList />
                </RequirePermission>
            } />
            <Route path="further-receipt/edit/:id" element={
                <RequirePermission permission="Inventory.Further Receipt List.Edit">
                    <ReciptEdit />
                </RequirePermission>
            } />
            <Route path="further-receipt/update/:id" element={
                <RequirePermission permission="Inventory.Further Receipt List.Edit">
                    <ReciptUpdate />
                </RequirePermission>
            } />
        </Routes>
    );
}
