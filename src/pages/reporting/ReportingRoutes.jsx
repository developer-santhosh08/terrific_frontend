import { Routes, Route } from 'react-router-dom';
import ReportingList from './ReportingList';
import ReportingAdd from './ReportingAdd';
import ReportingEdit from './ReportingEdit';
import RequirePermission from '../../components/RequirePermission';

export default function ReportingRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission="Reporting.Reporting Details.View">
                    <ReportingList />
                </RequirePermission>
            } />
            <Route path="add" element={
                <RequirePermission permission="Reporting.Reporting Details.Create">
                    <ReportingAdd />
                </RequirePermission>
            } />
            <Route path="edit/:id" element={
                <RequirePermission permission="Reporting.Reporting Details.Edit">
                    <ReportingEdit />
                </RequirePermission>
            } />
        </Routes>
    );
}
