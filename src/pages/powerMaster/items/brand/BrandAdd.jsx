import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const BrandAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [brandName, setBrandName] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!brandName.trim()) newErrors.brandName = 'The brand name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setLoading(true);
        try {
            const response = await apiFetch(`/master/brand`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: brandName,
                    status: status.value
                })
            });
            const result = response.json;
            if (result.status) {
                setShowSubmitPopup(true);
            } else {
                alert(result.message || "Failed to create brand");
            }
        } catch (error) {
            console.error("Error creating brand:", error);
            alert("Error creating brand");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/items/brand');
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
                        <h3 className="card-title">Add Brand</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/brand')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Brand Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Brand Name"
                                        value={brandName}
                                        onChange={(e) => { setBrandName(e.target.value); if (errors.brandName) setErrors(p => ({ ...p, brandName: '' })); }}
                                        style={errors.brandName ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                        disabled={loading}
                                    />
                                    {errors.brandName && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The brand name field is required.</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        value={status}
                                        onChange={(selected) => setStatus(selected)}
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/items/brand')}>Cancel</button>
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

export default BrandAdd;
