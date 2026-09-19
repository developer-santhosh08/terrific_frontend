import { useLoader } from '../../../../context/LoaderContext';
import React from 'react';

const VendorSubCategoryEdit = () => {
    const { setLoading } = useLoader();

    return (
        <section className="content">
            <div className="container-fluid">
                <h3>Vendor Sub Category Edit works!</h3>
            </div>
        </section>
    );
};
export default VendorSubCategoryEdit;
