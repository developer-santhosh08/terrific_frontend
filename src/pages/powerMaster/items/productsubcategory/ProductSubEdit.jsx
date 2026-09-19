import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const ProductSubEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [categoryOptions, setCategoryOptions] = useState([]);
    
    // Form state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subCategoryName, setSubCategoryName] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
                const [catRes, itemRes] = await Promise.all([
                    apiFetch('/master/dropdown/product_category'),
                    apiFetch(`/master/productSubCategory/${id}`)
                ]);

                const catJson = catRes?.json || {};
                const itemJson = itemRes?.json || {};

                let catOpts = [];
                if (catJson.status && catJson.data) {
                    catOpts = catJson.data.map(item => ({
                        value: item.id,
                        label: item.name
                    }));
                    setCategoryOptions(catOpts);
                }

                if (itemJson.status && itemJson.data) {
                    const data = itemJson.data;
                    setSubCategoryName(data.name || '');
                    setStatus(data.status === 1 ? { value: 'Active', label: 'Active' } : { value: 'Inactive', label: 'Inactive' });
                    
                    if (data.product_category_id) {
                        const foundCat = catOpts.find(c => c.value === data.product_category_id);
                        if (foundCat) {
                            setSelectedCategory(foundCat);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data for editing.');
            } finally {
                setIsLoading(false);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCategory || !subCategoryName.trim()) {
            setError("Category and Sub Category Name are required.");
            return;
        }
        setError(null);
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                product_category_id: selectedCategory.value,
                name: subCategoryName,
                status: status.value === 'Active' ? 1 : 0
            };
            const response = await apiFetch(`/master/productSubCategory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = response.json;
            if (result.status || response.res.ok) {
                navigate('/power-master/items/product-sub-category');
            } else {
                setError(result.message || 'Failed to update product sub category');
                setShowUpdatePopup(false);
            }
        } catch (err) {
            console.error('Error updating product sub category:', err);
            setError('An error occurred while updating.');
            setShowUpdatePopup(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Product Sub Category</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/product-sub-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {isLoading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="row">
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Product Category <span className="text-danger">*</span></label>
                                        <Select 
                                            options={categoryOptions}
                                            value={selectedCategory}
                                            onChange={setSelectedCategory}
                                            placeholder="Product Category"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            menuPosition="fixed"
                                        />
                                    </div>
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Product Sub Category <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={subCategoryName}
                                            onChange={(e) => setSubCategoryName(e.target.value)}
                                            placeholder="Product Sub Category Name"
                                        />
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
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/items/product-sub-category')}>Cancel</button>
                                    <button type="submit" className="btn-save" disabled={isSubmitting}>
                                        {isSubmitting ? 'Updating...' : 'Update'}
                                    </button>
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

export default ProductSubEdit;
