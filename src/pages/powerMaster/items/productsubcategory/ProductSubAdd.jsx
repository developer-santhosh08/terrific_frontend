import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const ProductSubAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [categoryOptions, setCategoryOptions] = useState([]);
    
    // Form State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subCategoryName, setSubCategoryName] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await apiFetch('/master/dropdown/product_category');
                if (!result) return;
                const { res, json } = result;
                if (json.status && json.data) {
                    setCategoryOptions(json.data.map(item => ({
                        value: item.id,
                        label: item.name
                    })));
                }
            } catch (err) {
                console.error('Error fetching product categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedCategory || !subCategoryName.trim()) {
            setError("Category and Sub Category Name are required.");
            return;
        }
        setError(null);
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                product_category_id: selectedCategory.value,
                name: subCategoryName,
                status: status.value === 'Active' ? 1 : 0
            };
            const response = await apiFetch('/master/productSubCategory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = response.json;
            if (result.status || result.res.ok) {
                navigate('/power-master/items/product-sub-category');
            } else {
                setError(result.message || 'Failed to create product sub category');
                setShowSubmitPopup(false);
            }
        } catch (err) {
            console.error('Error creating product sub category:', err);
            setError('An error occurred while saving.');
            setShowSubmitPopup(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Product Sub Category</h3>
                        <button type="button" className="btn-header-back" onClick={() => navigate('/power-master/items/product-sub-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
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
                                        placeholder="Product Sub Category" 
                                        value={subCategoryName}
                                        onChange={e => setSubCategoryName(e.target.value)}
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
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
    );
};

export default ProductSubAdd;
