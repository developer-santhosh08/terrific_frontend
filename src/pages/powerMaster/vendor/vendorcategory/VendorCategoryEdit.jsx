import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const VendorCategoryEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [vendorCategoryName, setVendorCategoryName] = useState('');
    const [status, setStatus] = useState('Active');
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const { loading, setLoading } = useLoader();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const result = await apiFetch(`/master/vendorCategory/${id}`);
                if (!result) return;
                const { res, json } = result;
                if (json.status && json.data) {
                    setVendorCategoryName(json.data.name || '');
                    setStatus(json.data.status === 1 ? 'Active' : 'Inactive');
                }
            } catch (err) {
                console.error('Error fetching vendor category:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCategory();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!vendorCategoryName.trim()) newErrors.vendorCategoryName = 'The vendor category name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            setSubmitting(true);
            const result = await apiFetch(`/master/vendorCategory/${id}`, {
                method: 'PUT',
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
            console.error("Error updating vendor category:", error);
        } finally {
setSubmitting(false);
            setShowUpdatePopup(false);
        
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
                        <h3 className="card-title">Edit Vendor Category</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/vendor/vendor-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center tw-py-4 tw-text-slate-500">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Vendor Category Name <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.vendorCategoryName ? 'is-invalid' : ''}`} 
                                            value={vendorCategoryName}
                                            onChange={(e) => setVendorCategoryName(e.target.value)}
                                        />
                                        {errors.vendorCategoryName && <div className="invalid-feedback">{errors.vendorCategoryName}</div>}
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
                                    <button type="submit" className="btn-save" disabled={submitting}>{submitting ? 'Updating...' : 'Update'}</button>
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

export default VendorCategoryEdit;
