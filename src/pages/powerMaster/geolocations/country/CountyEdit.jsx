import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
];

const CountyEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState('');
    const [status, setStatus] = useState(statusOptions[0]);
    const [errors, setErrors] = useState({});
    const { loading, setLoading } = useLoader();
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await apiFetch('/master/country');
                if (!result) return;
                const { res, json } = result;
                if (json.status && Array.isArray(json.data)) {
                    const item = json.data.find(c => String(c.id) === String(id));
                    if (item) {
                        setName(item.name || '');
                        setStatus(statusOptions.find(o => o.value === item.status) ?? statusOptions[0]);
                    }
                }
            } catch {
                setApiError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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
            const result = await apiFetch(`/master/country/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), status: status.value }),
            });
                if (!result) return;
                const { res, json } = result;
            if (json.status) {
                navigate('/power-master/geolocations/country');
            } else {
                const detail = json.errors
                    ? Object.values(json.errors).flat().join(' ')
                    : json.message;
                setApiError(detail || 'Failed to update country.');
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
                        <h3 className="card-title">Edit Country</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/geolocations/country')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        {loading ? (
                            <div className="text-center tw-py-4 tw-text-slate-500">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-12 col-md-3 form-group">
                                        <label>Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter Country Name"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                                            style={errors.name ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                        />
                                        {errors.name && <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.name}</span>}
                                    </div>
                                    <div className="col-12 col-md-3 form-group">
                                        <label>Status</label>
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
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/geolocations/country')}>Cancel</button>
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

export default CountyEdit;
