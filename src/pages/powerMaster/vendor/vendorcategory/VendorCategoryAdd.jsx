import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const VendorCategoryAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [vendorCategoryName, setVendorCategoryName] = useState('');
    const [status, setStatus] = useState('Active');
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!vendorCategoryName.trim()) newErrors.vendorCategoryName = 'The vendor category name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            setSubmitting(true);
            const result = await apiFetch('/master/vendorCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: vendorCategoryName,
                    status: status
                })
            });
                if (!result) return;
                const { res, json } = result;
            if (json.status) {
                navigate('/power-master/vendor/vendor-category');
            } else {
                console.error("API returned error:", json.message);
            }
        } catch (error) {
            console.error("Error creating vendor category:", error);
        } finally {
setSubmitting(false);
            setShowSubmitPopup(false);
        
setLoading(false);
}
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
                        <h3 className="card-title">Add Vendor Category</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/vendor/vendor-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Vendor Category Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Vendor Category Name"
                                        value={vendorCategoryName}
                                        onChange={(e) => { setVendorCategoryName(e.target.value); if (errors.vendorCategoryName) setErrors(p => ({ ...p, vendorCategoryName: '' })); }}
                                        style={errors.vendorCategoryName ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.vendorCategoryName && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The vendor category name field is required.</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select 
                                        options={statusOptions}
                                        value={statusOptions.find(opt => opt.value === status)}
                                        onChange={(selected) => setStatus(selected.value)}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/vendor/vendor-category')} disabled={submitting}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
        );
};

export default VendorCategoryAdd;
