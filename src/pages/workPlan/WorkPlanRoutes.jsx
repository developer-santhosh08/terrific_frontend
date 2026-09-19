import { Routes, Route } from 'react-router-dom';
import WorkPlanList from './WorkPlan/WorkPlanList';
import WorkPlanAdd from './WorkPlan/WorkPlanAdd';
import WorkPlanEdit from './WorkPlan/WorkPlanEdit';
import CompletedPlanList from './completedPlan/CompletedPlanList';
import RequirePermission from '../../components/RequirePermission';

export default function WorkPlanRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission="Work Plan.Work Plan.View">
                    <WorkPlanList />
                </RequirePermission>
            } />
            <Route path="add" element={
                <RequirePermission permission="Work Plan.Work Plan.Add">
                    <WorkPlanAdd />
                </RequirePermission>
            } />
            <Route path="edit/:id" element={
                <RequirePermission permission="Work Plan.Work Plan.Edit">
                    <WorkPlanEdit />
                </RequirePermission>
            } />
            <Route path="completed" element={
                <RequirePermission permission="Work Plan.Completed Plan.View">
                    <CompletedPlanList />
                </RequirePermission>
            } />
        </Routes>
    );
}
