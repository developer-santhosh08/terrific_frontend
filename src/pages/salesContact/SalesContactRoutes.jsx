import { Routes, Route } from 'react-router-dom';
import SalesContactList from './SalesContact/SalesContactList';
import SalesContactAdd from './SalesContact/SalesContactAdd';
import SalesContactEdit from './SalesContact/SalesContactEdit';
import ClosedContactList from './closedContact/ClosedContactList';
import ConvertedContactList from './convertedContact/ConvertedContactList';
import HoldContactList from './holdContact/HoldContactList';
import RequirePermission from '../../components/RequirePermission';

export default function SalesContactRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission="Sales Contact.Sales Contact.View">
                    <SalesContactList />
                </RequirePermission>
            } />
            <Route path="add" element={
                <RequirePermission permission="Sales Contact.Sales Contact.Add">
                    <SalesContactAdd />
                </RequirePermission>
            } />
            <Route path="edit/:id" element={
                <RequirePermission permission="Sales Contact.Sales Contact.Edit">
                    <SalesContactEdit />
                </RequirePermission>
            } />
            <Route path="closed" element={
                <RequirePermission permission="Sales Contact.Closed Contacts.View">
                    <ClosedContactList />
                </RequirePermission>
            } />
            <Route path="converted" element={
                <RequirePermission permission="Sales Contact.Converted Contact.View">
                    <ConvertedContactList />
                </RequirePermission>
            } />
            <Route path="hold" element={
                <RequirePermission permission="Sales Contact.Hold Contacts.View">
                    <HoldContactList />
                </RequirePermission>
            } />
        </Routes>
    );
}
