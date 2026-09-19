import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';




const StateAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [country, setCountry] = useState(null);
    const [countryOptions, setCountryOptions] = useState([]);
    const [name, setName] = useState('');

    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/country`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const json = await response.json();
                if (json.status && Array.isArray(json.data)) {
                    setCountryOptions(json.data.map(c => ({ value: c.id, label: c.name })));
                }
            } catch (err) {
                console.error('Error fetching countries:', err);
            }
        };
        fetchCountries();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!country) newErrors.country = 'Country is required.';
        if (!name.trim()) newErrors.name = 'State name is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setApiError('');
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/state`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    country_id: country.value,
                    name: name.trim()
                }),
            });
            const json = await response.json();
            if (json?.status) {
                navigate('/power-master/geolocations/state');
            } else {
                const detail = json.errors
                    ? Object.values(json.errors).flat().join(' ')
                    : json.message;
                setApiError(detail || 'Failed to create state.');
                setShowSubmitPopup(false);
            }
        } catch {
            setApiError('Network error. Please try again.');
            setShowSubmitPopup(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add State</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/geolocations/state')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
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
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/geolocations/state')}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit'}
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

export default StateAdd;
