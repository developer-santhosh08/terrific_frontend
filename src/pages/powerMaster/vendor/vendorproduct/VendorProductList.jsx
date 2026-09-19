import { useLoader } from '../../../../context/LoaderContext';
import { usePermissions } from '../../../../context/PermissionContext';

const VendorProductMappingList = () => {
    const { hasPermission } = usePermissions();
    const hasActionPermission = hasPermission('Power Master.Vendor.Edit') || hasPermission('Power Master.Vendor.Delete');
    const { setLoading } = useLoader();

    return (
        <section className="content">
            <div className="container-fluid">
                <h3>Vendor Product Mapping List works!</h3>
            </div>
        </section>
    );
};
export default VendorProductMappingList;
