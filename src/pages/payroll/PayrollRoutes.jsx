import { Routes, Route } from 'react-router-dom';
import PayrollEntry  from './PayrollEntry';
import PayrollList   from './PayrollList';
import PayrollReport from './PayrollReport';
import SalaryStructureList from './SalaryStructureList';
import RequirePermission from '../../components/RequirePermission';

export default function PayrollRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission={["Payroll.Payroll Entry.View", "Payroll.Payroll List.View", "Payroll.Payroll Report.View"]}>
                    <PayrollEntry />
                </RequirePermission>
            } />
            <Route path="salary" element={
                <RequirePermission permission="Payroll.Payroll Entry.View">
                    <PayrollEntry />
                </RequirePermission>
            } />
            <Route path="list" element={
                <RequirePermission permission="Payroll.Payroll List.View">
                    <PayrollList />
                </RequirePermission>
            } />
            <Route path="report" element={
                <RequirePermission permission="Payroll.Payroll Report.View">
                    <PayrollReport />
                </RequirePermission>
            } />
            <Route path="structures" element={
                <RequirePermission permission={["Payroll.Payroll Entry.View"]}>
                    <SalaryStructureList />
                </RequirePermission>
            } />
        </Routes>
    );
}
