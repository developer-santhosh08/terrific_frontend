import { useLoader } from '../../../../context/LoaderContext';
import React from 'react';

const VendorProductMappingEdit = () => {
    const { setLoading } = useLoader();

    return (
        <section className="content">
            <div className="container-fluid">
                <h3>Vendor Product Mapping Edit works!</h3>
            </div>
        </section>
    );
};
export default VendorProductMappingEdit;
