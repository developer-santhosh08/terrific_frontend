import { useLoader } from '../../../../context/LoaderContext';
import React from 'react';

const VendorSubCategoryAdd = () => {
    const { setLoading } = useLoader();

    return (
        <section className="content">
            <div className="container-fluid">
                <h3>Vendor Sub Category Add works!</h3>
            </div>
        </section>
    );
};
export default VendorSubCategoryAdd;
