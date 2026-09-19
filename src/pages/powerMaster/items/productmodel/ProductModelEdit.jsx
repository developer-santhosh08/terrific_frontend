import { useLoader } from '../../../../context/LoaderContext';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const ProductModelEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    
    const [productSubCategory, setProductSubCategory] = useState(null);
    const [productModelName, setProductModelName] = useState('');
    const [status, setStatus] = useState(null);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
                
                
                // Fetch sub categories for options
                const __apiRes = await apiFetch(`/master/productSubCategory`);
                if (!__apiRes) return;
                const subCatResult = __apiRes.json;
                let subCats = [];
                if (subCatResult.status && subCatResult.data) {
                    subCats = subCatResult.data.map(item => ({
                        value: item.id,
                        label: item.name
                    }));
                    setSubCategoryOptions(subCats);
                }
                
                // Fetch product model by id
                const __apiRes2 = await apiFetch(`/master/productModel/${id}`);
                if (!__apiRes2) return;
                const result = __apiRes2.json;
                if (result.status && result.data) {
                    const d = result.data;
                    setProductModelName(d.name);
                    setStatus({
                        value: d.status === 1 ? 'Active' : 'Inactive',
                        label: d.status === 1 ? 'Active' : 'Inactive'
                    });
                    
                    const subCat = subCats.find(s => s.value === d.product_sub_category_id);
                    if (subCat) {
                        setProductSubCategory(subCat);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!productSubCategory || !productModelName.trim()) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            
            const res = await apiFetch(`/master/productModel/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_sub_category_id: productSubCategory.value,
                    name: productModelName,
                    status: status?.value
                })
            });
            
            const result = res.json;
            if (result.status) {
                setShowUpdatePopup(true);
            } else {
                alert(result.message || "Failed to update product model");
            }
        } catch (error) {
            console.error("Error updating product model:", error);
            alert("Error updating product model");
        } finally {
            setLoading(false);
        }};

    const handleConfirmUpdate = () => {
        navigate('/power-master/items/product-model');
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Product Model</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/product-model')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Product Sub Category <span className="text-danger">*</span></label>
                                        <Select
                                            options={subCategoryOptions}
                                            value={productSubCategory}
                                            onChange={setProductSubCategory}
                                            placeholder="Product Sub Category"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            menuPosition="fixed"
                                        />
                                    </div>
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Product Model Name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={productModelName} onChange={(e) => setProductModelName(e.target.value)} />
                                    </div>
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Status</label>
                                        <Select
                                            options={statusOptions}
                                            value={status}
                                            onChange={setStatus}
                                            placeholder="Status"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            menuPosition="fixed"
                                        />
                                    </div>
                                </div>
                                <hr />
                                <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/items/product-model')}>Cancel</button>
                                    <button type="submit" className="btn-save">Update</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default ProductModelEdit;
