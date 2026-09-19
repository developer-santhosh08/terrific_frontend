import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const ProductGroupAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [productGroup, setProductGroup] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!productGroup.trim()) newErrors.productGroup = 'The product group field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        
        setLoading(true);
        try {
            const response = await apiFetch(`/master/productGroup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: productGroup,
                    status: status.value
                })
            });
            const result = response.json;
            if (result.status) {
                setShowSubmitPopup(true);
            } else {
                alert(result.message || "Failed to create product group");
            }
        } catch (error) {
            console.error("Error creating product group:", error);
            alert("Error creating product group");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/items/product-group');
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Product Group</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/product-group')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Product Group <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Product Group"
                                        value={productGroup}
                                        onChange={(e) => { setProductGroup(e.target.value); if (errors.productGroup) setErrors(p => ({ ...p, productGroup: '' })); }}
                                        style={errors.productGroup ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                        disabled={loading}
                                    />
                                    {errors.productGroup && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The product group field is required.</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select 
                                        options={statusOptions}
                                        value={status}
                                        onChange={selected => setStatus(selected)}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                        isDisabled={loading}
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/items/product-group')}>Cancel</button>
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

export default ProductGroupAdd;
