import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Trash, Plus } from '@phosphor-icons/react';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import ErrorPopup from '../../../../components/Popup/ErrorPopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const VendorMappingEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [searchProduct, setSearchProduct] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const [products, setProducts] = useState([
        { id: 1, brand_id: null, product_id: null, purchasePrice: '', lpMrp: '', dealerLpMrp: '', discount: '' }
    ]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState({ value: 'Active', label: 'Active' });
    const [vendorOptions, setVendorOptions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    useEffect(() => {
        const loadData = async () => {
setLoading(true);
try {
                // Fetch Vendor Name and all vendors
                const allVendorRes = await apiFetch(`/master/vendor`);
const allVendorJson = allVendorRes?.json || {};
                if (allVendorJson.status && allVendorJson.data) {
                    const vOptions = allVendorJson.data.map(v => ({ value: v.id, label: v.name }));
                    setVendorOptions(vOptions);
                    
                    const currentVendor = allVendorJson.data.find(v => String(v.id) === String(id));
                    if (currentVendor) {
                        setSelectedVendor({ value: currentVendor.id, label: currentVendor.name });
                    }
                }

                // Fetch Brands
                const brandRes = await apiFetch('/master/brand');
const brandJson = brandRes?.json || {};
                let brands = [];
                let brandMap = {};
                if (brandJson.status && brandJson.data) {
                    brands = brandJson.data.map(b => ({ value: b.id, label: b.name }));
                    brandJson.data.forEach(b => brandMap[b.id] = b.name);
                    setBrandOptions(brands);
                }
                
                // Fetch Products for mapping product_id to name
                const productRes = await apiFetch('/master/product');
const productJson = productRes?.json || {};
                let productMap = {};
                if (productJson.status && productJson.data) {
                    const productsList = productJson.data.map(p => ({ value: p.id, label: p.name }));
                    setProductOptions(productsList);
                    productJson.data.forEach(p => productMap[p.id] = p.name);
                }

                // Fetch Mappings
                const mapRes = await apiFetch('/master/vendorProductMapping');
const mapJson = mapRes?.json || {};
                if (mapJson.status && mapJson.data) {
                    const vendorMappings = mapJson.data.filter(m => String(m.vendor_id) === String(id));
                    
                    if (vendorMappings.length > 0) {
                        const formattedProducts = vendorMappings.map(m => ({
                            id: m.id,
                            brand_id: m.brand_id ? { value: m.brand_id, label: brandMap[m.brand_id] || 'Unknown Brand' } : null,
                            product_id: m.product_id ? { value: m.product_id, label: productMap[m.product_id] || 'Unknown Product' } : null,
                            purchasePrice: m.purchase_price,
                            lpMrp: m.price,
                            dealerLpMrp: m.dealer_price,
                            discount: m.discount
                        }));
                        setProducts(formattedProducts);
                    }
                }
                
            } catch (err) {
                console.error("Error loading vendor mapping data:", err);
            } finally { setLoading(false); }
        };
        
        if (id) {
            loadData();
        }
    }, [id]);

    const handleAddProduct = () => {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        setProducts([...products, { id: newId, brand_id: null, product_id: null, purchasePrice: '', lpMrp: '', dealerLpMrp: '', discount: '', isNew: true }]);
    };

    const handleRemoveProduct = (productId) => {
        if (products.length > 1) {
            setProducts(products.filter(p => p.id !== productId));
        }
    };

    const handleChange = (productId, field, value) => {
        setProducts(products.map(p => p.id === productId ? { ...p, [field]: value } : p));
    };

    const [duplicateError, setDuplicateError] = useState('');
    const [duplicateRowIds, setDuplicateRowIds] = useState([]);
    const [highlightedRowId, setHighlightedRowId] = useState(null);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSearchMapping = async () => {
        const checkVendorId = selectedVendor ? selectedVendor.value : id;
        if (!checkVendorId || !searchProduct) {
            setSearchResult({ type: 'error', message: 'Please select Vendor and Product to check.' });
            return;
        }
        setIsSearching(true);
        setSearchResult(null);
        setHighlightedRowId(null);
        try {
            const res = await apiFetch('/master/vendorProductMapping/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor_id: checkVendorId, product_id: searchProduct.value })
            });
            const json = res?.json || {};
            if (json.status) {
                setSearchResult({ 
                    type: json.is_mapped ? 'error' : 'success', 
                    message: json.message 
                });
                if (json.is_mapped) {
                    const matchedRow = products.find(p => p.product_id && String(p.product_id.value) === String(searchProduct.value));
                    if (matchedRow) {
                        setHighlightedRowId(matchedRow.id);
                    }
                }
            } else {
                setSearchResult({ type: 'error', message: json.message || 'Error checking mapping.' });
            }
        } catch (err) {
            console.error(err);
            setSearchResult({ type: 'error', message: 'Something went wrong.' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const seen = new Map();
        let duplicateMessage = '';
        let duplicateIds = [];
        
        for (const p of products) {
            if (p.brand_id && p.product_id) {
                const key = `${p.brand_id.value}-${p.product_id.value}`;
                if (seen.has(key)) {
                    duplicateMessage = `Duplicate mapping found for Product: "${p.product_id.label}" under Brand: "${p.brand_id.label}".\nPlease ensure each row has a unique Brand and Product combination.`;
                    duplicateIds = [seen.get(key), p.id];
                    break;
                }
                seen.set(key, p.id);
            }
        }
        
        if (duplicateMessage) {
            setDuplicateError(duplicateMessage);
            setDuplicateRowIds(duplicateIds);
            return;
        }
        
        setDuplicateError('');
        setDuplicateRowIds([]);
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const promises = products.map(async (p) => {
                const body = {
                    vendor_id: selectedVendor ? selectedVendor.value : id,
                    product_id: p.product_id ? p.product_id.value : null,
                    brand_id: p.brand_id ? p.brand_id.value : null,
                    price: parseFloat(p.lpMrp) || 0,
                    purchase_price: parseFloat(p.purchasePrice) || 0,
                    dealer_price: parseFloat(p.dealerLpMrp) || 0,
                    discount: parseFloat(p.discount) || 0,
                    status: selectedStatus ? selectedStatus.value : "Active"
                };

                if (p.isNew) {
                    return apiFetch('/master/vendorProductMapping', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                } else {
                    return apiFetch(`/master/vendorProductMapping/${p.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                }
            });

            await Promise.all(promises);
            navigate('/power-master/vendor/vendor-product-mapping');
        } catch (err) {
            console.error('Error updating mappings:', err);
        } finally {
setShowUpdatePopup(false);
        
setLoading(false);
}
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Vendor Product Mapping</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/vendor/vendor-product-mapping')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-4">
                                <div className="col-12 col-md-3 form-group">
                                    <label>Vendor Name <span className="text-danger">*</span></label>
                                    <Select
                                        options={vendorOptions}
                                        value={selectedVendor}
                                        onChange={setSelectedVendor}
                                        placeholder="Choose a Vendor Name"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group">
                                    <label>Status <span className="text-danger">*</span></label>
                                    <Select
                                        options={[
                                            { value: 'Active', label: 'Active' },
                                            { value: 'Inactive', label: 'Inactive' }
                                        ]}
                                        value={selectedStatus}
                                        onChange={setSelectedStatus}
                                        placeholder="Choose Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>

                            {/* Check Mapping Section */}
                            <div className="card mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                                <div className="card-body">
                                    <h5 className="mb-3">Check Existing Mapping</h5>
                                    <div className="row align-items-end">
                                        <div className="col-12 col-md-4 form-group mb-md-0">
                                            <label>Product Name</label>
                                            <Select
                                                options={productOptions}
                                                value={searchProduct}
                                                onChange={(val) => { setSearchProduct(val); setSearchResult(null); }}
                                                placeholder="Choose a Product"
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            />
                                        </div>
                                        <div className="col-12 col-md-2 form-group mb-md-0">
                                            <button type="button" className="btn-save w-100" onClick={handleSearchMapping} disabled={isSearching}>
                                                {isSearching ? 'Checking...' : 'Check'}
                                            </button>
                                        </div>
                                        <div className="col-12 col-md-6 form-group mb-md-0 d-flex align-items-center">
                                            {searchResult && (
                                                <span className={`fw-bold ${searchResult.type === 'error' ? 'text-danger' : 'text-success'}`}>
                                                    {searchResult.message}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-2">
                                <div className="col-12">
                                    <div className="table-responsive" style={{ overflowX: 'visible' }}>
                                        <table className="table table-bordered no-margin">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '200px' }}>Brand Name</th>
                                                    <th style={{ width: '200px' }}>Product Name</th>
                                                    <th>Purchase Price</th>
                                                    <th>LP/MRP</th>
                                                    <th>Dealer LP/MRP</th>
                                                    <th>Discount%</th>
                                                    <th className="tw-w-24">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map((p, index) => (
                                                    <tr key={p.id} style={{ backgroundColor: duplicateRowIds.includes(p.id) || highlightedRowId === p.id ? '#fee2e2' : '' }}>
                                                        <td className="align-middle">
                                                            <Select
                                                                options={brandOptions}
                                                                placeholder="Choose Brand Name"
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                value={p.brand_id}
                                                                onChange={(option) => handleChange(p.id, 'brand_id', option)}
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <Select
                                                                options={productOptions}
                                                                placeholder="Choose Product Name"
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                value={p.product_id}
                                                                onChange={(option) => handleChange(p.id, 'product_id', option)}
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Purchase Price"
                                                                value={p.purchasePrice}
                                                                onChange={(e) => handleChange(p.id, 'purchasePrice', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Price"
                                                                value={p.lpMrp}
                                                                onChange={(e) => handleChange(p.id, 'lpMrp', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Dealer Price"
                                                                value={p.dealerLpMrp}
                                                                onChange={(e) => handleChange(p.id, 'dealerLpMrp', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Discount"
                                                                value={p.discount}
                                                                onChange={(e) => handleChange(p.id, 'discount', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="align-middle">
                                                            <div className="tw-flex tw-justify-start tw-gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-delete"
                                                                    onClick={() => handleRemoveProduct(p.id)}
                                                                    disabled={products.length === 1}
                                                                >
                                                                    <Trash weight="bold" className="tw-w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="list-action-btn btn-add"
                                                                    onClick={handleAddProduct}
                                                                >
                                                                    <Plus weight="bold" className="tw-w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <hr className="mt-4" />

                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/vendor/vendor-product-mapping')}>Cancel</button>
                                <button type="submit" className="btn-save">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />
            <ErrorPopup isOpen={!!duplicateError} onClose={() => setDuplicateError('')} message={duplicateError} />

        </section>
    );
};

export default VendorMappingEdit;
