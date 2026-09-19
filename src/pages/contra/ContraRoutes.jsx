import { Routes, Route } from 'react-router-dom';
import ContraList from './ContraList';
import ContraAdd from './ContraAdd';
import ContraEdit from './ContraEdit';
import ContraReciptList from './ContraReciptList';
import RequirePermission from '../../components/RequirePermission';

export default function ContraRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission="Contra.Contra list.View">
                    <ContraList />
                </RequirePermission>
            } />
            <Route path="add" element={
                <RequirePermission permission="Contra.Contra list.Add">
                    <ContraAdd />
                </RequirePermission>
            } />
            <Route path="edit/:id" element={
                <RequirePermission permission="Contra.Contra list.Edit">
                    <ContraEdit />
                </RequirePermission>
            } />
            <Route path="receipt" element={
                <RequirePermission permission={["Contra.Contra Receipt.Export", "Contra.Contra Receipt.Edit", "Contra.Contra Receipt.Delete"]}>
                    <ContraReciptList />
                </RequirePermission>
            } />
        </Routes>
    );
}
