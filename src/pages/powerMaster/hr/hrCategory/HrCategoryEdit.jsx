import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const statusOptions = [
    { value: 'Active',   label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const HrCategoryEdit = () => {
    const navigate = useNavigate();
    const { id: itemId } = useParams();

    const [name, setName] = useState('');
    const [status, setStatus] = useState(statusOptions[0]);
    const { loading, setLoading } = useLoader();
    const [fetchError, setFetchError] = useState('');
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setFetchError('');
            try {
                const token = sessionStorage.getItem('erp_token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const response = await fetch(`${baseUrl}/api/master/hrCategory/${itemId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('erp_auth');
                    sessionStorage.removeItem('erp_token');
                    sessionStorage.removeItem('erp_user');
                    window.location.href = '/login';
                    return;
                }

                const json = await response.json();
                
                if (response.ok && json.status && json.data) {
                    const d = Array.isArray(json.data) ? json.data[0] : json.data;
                    setName(d.name || '');
                    setStatus(statusOptions.find(o => o.value === d.status_label || (d.status === 1 ? 'Active' : 'Inactive') === o.value) ?? statusOptions[0]);
                } else {
                    setFetchError(json.message || 'Failed to fetch HR category.');
                }
            } catch {
                setFetchError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [itemId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'The name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setApiError('');
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/master/hrCategory/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    name: name.trim(), 
                    status: status.value === 'Active' ? 1 : 0,
                    log_status: status.value === 'Active' ? 1 : 0,
                    rank: 0
                }),
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('erp_auth');
                sessionStorage.removeItem('erp_token');
                sessionStorage.removeItem('erp_user');
                window.location.href = '/login';
                return;
            }

            const json = await response.json();
            
            if (response.ok && json.status) {
                navigate('/power-master/hr/hr-category');
            } else {
                setApiError(json.message || 'Failed to update HR category.');
            }
        } catch {
            setApiError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
            setShowUpdatePopup(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit HR Category</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/hr/hr-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {fetchError && <div className="alert alert-danger py-2 mb-3">{fetchError}</div>}
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        {loading ? (
                            <div className="tw-text-center tw-py-10 tw-text-slate-500">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-12 col-md-3 form-group">
                                        <label>Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                                            style={errors.name ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                        />
                                        {errors.name && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The name field is required.</span>}
                                    </div>
                                    <div className="col-12 col-md-3 form-group">
                                        <label>Status <span className="text-danger">*</span></label>
                                        <Select
                                            options={statusOptions}
                                            value={status}
                                            onChange={setStatus}
                                            placeholder="Select Status"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <hr />
                                <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/hr/hr-category')}>Cancel</button>
                                    <button type="submit" className="btn-save" disabled={submitting}>
                                        {submitting ? 'Updating...' : 'Update'}
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

export default HrCategoryEdit;
