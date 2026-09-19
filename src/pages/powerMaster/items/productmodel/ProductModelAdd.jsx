import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const ProductModelAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [productSubCategory, setProductSubCategory] = useState(null);
    const [productModelName, setProductModelName] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [isFetchingSubCats, setIsFetchingSubCats] = useState(true);

    useEffect(() => {
        const fetchSubCategories = async () => {
            setLoading(true);
            try {
                
                const __apiRes = await apiFetch(`/master/productSubCategory`);
                if (!__apiRes) return;
                const result = __apiRes.json;
                if (result.status && result.data) {
                    setSubCategoryOptions(result.data.map(item => ({
                        value: item.id,
                        label: item.name
                    })));
                }
            } catch (error) {
                console.error("Error fetching sub categories:", error);
            } finally {
                setIsFetchingSubCats(false);
                setLoading(false);
            }
        };
        fetchSubCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!productSubCategory) newErrors.productSubCategory = 'The product sub category field is required.';
        if (!productModelName.trim()) newErrors.productModelName = 'The product model name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setLoading(true);
        try {
            
            const response = await apiFetch(`/master/productModel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_sub_category_id: productSubCategory.value,
                    name: productModelName,
                    status: status.value
                })
            });
            const result = response.json;
            if (result.status) {
                setShowSubmitPopup(true);
            } else {
                alert(result.message || "Failed to create product model");
            }
        } catch (error) {
            console.error("Error creating product model:", error);
            alert("Error creating product model");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
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
                        <h3 className="card-title">Add Product Model</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/product-model')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Product Sub Category <span className="text-danger">*</span></label>
                                    <Select
                                        options={subCategoryOptions}
                                        value={productSubCategory}
                                        onChange={(val) => { setProductSubCategory(val); if (errors.productSubCategory) setErrors(p => ({ ...p, productSubCategory: '' })); }}
                                        placeholder={isFetchingSubCats ? "Loading..." : "Product Sub Category"}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                        isLoading={isFetchingSubCats}
                                        styles={errors.productSubCategory ? { control: (base) => ({ ...base, borderColor: '#dc3545' }) } : {}}
                                    />
                                    {errors.productSubCategory && <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.productSubCategory}</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Product Model Name <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Product Model Name" 
                                        value={productModelName}
                                        onChange={(e) => { setProductModelName(e.target.value); if (errors.productModelName) setErrors(p => ({ ...p, productModelName: '' })); }}
                                        style={errors.productModelName ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.productModelName && <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.productModelName}</span>}
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
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit'}
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

export default ProductModelAdd;
