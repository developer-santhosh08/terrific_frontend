import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const BrandEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [brandName, setBrandName] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const __apiRes = await apiFetch(`/master/brand`);
                if (!__apiRes) return;
                const result = __apiRes.json;
                if (result.status && result.data) {
                    const item = result.data.find(b => String(b.id) === String(id));
                    if (item) {
                        setBrandName(item.name || '');
                        setStatus({
                            value: item.status_label || (item.status === 1 ? 'Active' : 'Inactive'),
                            label: item.status_label || (item.status === 1 ? 'Active' : 'Inactive')
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching brand:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrand();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!brandName.trim()) newErrors.brandName = 'The brand name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setSubmitLoading(true);
        try {
            const response = await apiFetch(`/master/brand/${id}`, {
                method: 'PUT',
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
                setShowUpdatePopup(true);
            } else {
                alert(result.message || "Failed to update brand");
            }
        } catch (error) {
            console.error("Error updating brand:", error);
            alert("Error updating brand");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleConfirmUpdate = () => {
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
                        <h3 className="card-title">Edit Brand</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/brand')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Brand Name <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${errors.brandName ? 'is-invalid' : ''}`} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Brand Name" disabled={loading} />
                                    {errors.brandName && <div className="invalid-feedback">{errors.brandName}</div>}
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
                                <button type="submit" className="btn-save" disabled={submitLoading || loading}>
                                    {submitLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default BrandEdit;
