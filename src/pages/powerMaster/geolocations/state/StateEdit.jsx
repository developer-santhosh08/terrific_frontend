import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';


const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
];

const StateEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [country, setCountry] = useState(null);
    const [countryOptions, setCountryOptions] = useState([]);
    const [name, setName] = useState('');
    const [status, setStatus] = useState(statusOptions[0]);
    const [errors, setErrors] = useState({});
    const { loading, setLoading } = useLoader();
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const [stateRes, countryRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/state/${id}`, {
                        headers: {
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/country`, {
                        headers: {
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    }),
                ]);

                const stateJson = await stateRes.json();
                const countryJson = await countryRes.json();

                let options = [];
                if (countryJson.status && Array.isArray(countryJson.data)) {
                    options = countryJson.data.map(c => ({ value: c.id, label: c.name }));
                    setCountryOptions(options);
                }

                if (stateJson.status && stateJson.data) {
                    const item = Array.isArray(stateJson.data) ? stateJson.data[0] : stateJson.data;
                    if (item) {
                        setName(item.name || '');
                        setStatus(statusOptions.find(o => o.value === item.status) ?? statusOptions[0]);
                        setCountry(options.find(o => o.value === item.country_id) ?? null);
                    }
                }
            } catch {
                setApiError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!country) newErrors.country = 'Country is required.';
        if (!name.trim()) newErrors.name = 'State name is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setApiError('');
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/state/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    country_id: country.value,
                    name: name.trim(),
                    status: status.value,
                }),
            });
            const json = await response.json();
            if (json?.status) {
                navigate('/power-master/geolocations/state');
            } else {
                const detail = json.errors
                    ? Object.values(json.errors).flat().join(' ')
                    : json.message;
                setApiError(detail || 'Failed to update state.');
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
                        <h3 className="card-title">Edit State</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/geolocations/state')}>
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
                                        <label>Country <span className="text-danger">*</span></label>
                                        <Select
                                            options={countryOptions}
                                            value={country}
                                            onChange={(opt) => { setCountry(opt); if (errors.country) setErrors(p => ({ ...p, country: '' })); }}
                                            placeholder="Select Country"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            styles={errors.country ? { control: (b) => ({ ...b, borderColor: '#dc3545' }) } : {}}
                                        />
                                        {errors.country && <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.country}</span>}
                                    </div>
                                    <div className="col-12 col-md-3 form-group">
                                        <label>State Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter State Name"
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
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/geolocations/state')}>Cancel</button>
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

export default StateEdit;
