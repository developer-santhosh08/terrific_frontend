import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { usePermissions } from '../context/PermissionContext';
import Loader from '../components/Loader';

const MainLayout = () => {
    const { loading } = usePermissions();

    return (
        <>
            {loading && (
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
            )}
            <Header />
            <div className="content-wrapper">
                <div className="container-full">
                    <Outlet />
                </div>
            </div>
            <Footer />
            {/* Control Sidebar */}
            <aside className="control-sidebar">
                <div className="rpanel-title">
                    <span className="pull-right btn btn-circle btn-danger">
                        <i className="ion ion-close text-white" data-toggle="control-sidebar"></i>
                    </span>
                </div>
                <div className="tab-content">
                    <div className="tab-pane" id="control-sidebar-home-tab">
                    </div>
                </div>
            </aside>
            <div className="control-sidebar-bg"></div>
        </>
    );
};

export default MainLayout;
