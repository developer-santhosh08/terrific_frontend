import { Routes, Route } from 'react-router-dom';
import UserRightsList from './UserRightsList';
import UserRightsAdd from './UserRightsAdd';
import UserRightsEdit from './UserRightsEdit';
import UserRights from './UserRights';
import RequirePermission from '../../components/RequirePermission';

export default function UserRightsRoutes() {
    return (
        <Routes>
            <Route path="" element={
                <RequirePermission permission="User Rights.User Right.View">
                    <UserRightsList />
                </RequirePermission>
            } />
            <Route path="add" element={
                <RequirePermission permission="User Rights.User Right.Add">
                    <UserRightsAdd />
                </RequirePermission>
            } />
            <Route path="edit/:id" element={
                <RequirePermission permission="User Rights.User Right.Edit">
                    <UserRightsEdit />
                </RequirePermission>
            } />
            <Route path="assign" element={
                <RequirePermission permission="User Rights.User Right.Rights">
                    <UserRights />
                </RequirePermission>
            } />
        </Routes>
    );
}
