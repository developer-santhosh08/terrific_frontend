import { useNavigate } from 'react-router-dom';
import { useTableControls } from '../../../../hooks/useTableControls';
import { useLoader } from '../../../../context/LoaderContext';
import Pagination from '../../../../components/Pagination';
import { usePermissions } from '../../../../context/PermissionContext';

const UserRightList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('User Rights.User Right.Edit') || hasPermission('User Rights.User Right.Delete');
    const navigate = useNavigate();
    const { setLoading } = useLoader();

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">User Right Details</h3>
                    </div>
                    <div className="card-body">
                        <p>This module is currently under construction.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/power-master/user/user-right/add')}>
                            Go to Add
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UserRightList;
