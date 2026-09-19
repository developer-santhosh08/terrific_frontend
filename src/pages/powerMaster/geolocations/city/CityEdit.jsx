import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
];

const CityEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { loading, setLoading } = useLoader();

    const [district, setDistrict] = useState(null);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [name, setName] = useState('');
    const [status, setStatus] = useState(statusOptions[0]);
    const [errors, setErrors] = useState({});
    
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const [cityRes, districtRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/city/${id}`, {
                        headers: {
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/district`, {
                        headers: {
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    }),
                ]);

                const cityJson = await cityRes.json();
                const districtJson = await districtRes.json();

                let options = [];
                if (districtJson.status && Array.isArray(districtJson.data)) {
                    options = districtJson.data.map(d => ({ value: d.id, label: d.name }));
                    setDistrictOptions(options);
                }

                if (cityJson.status && cityJson.data) {
                    const item = Array.isArray(cityJson.data) ? cityJson.data[0] : cityJson.data;
                    if (item) {
                        setName(item.name || '');
                        setStatus(statusOptions.find(o => o.value === item.status) ?? statusOptions[0]);
                        setDistrict(options.find(o => o.value === item.district_id) ?? null);
                    }
                }
            } catch {
                setApiError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id, setLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!district) newErrors.district = 'District is required.';
        if (!name.trim()) newErrors.name = 'City name is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setApiError('');
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/city/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    district_id: district.value,
                    name: name.trim(),
                    status: status.value,
                }),
            });
            const json = await response.json();
            if (json?.status) {
                navigate('/power-master/geolocations/city');
            } else {
                const detail = json.errors
                    ? Object.values(json.errors).flat().join(' ')
                    : json.message;
                setApiError(detail || 'Failed to update city.');
                setShowUpdatePopup(false);
            }
        } catch {
            setApiError('Network error. Please try again.');
            setShowUpdatePopup(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit City</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/geolocations/city')}>
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
                                        <label>District <span className="text-danger">*</span></label>
                                        <Select 
                                            options={districtOptions}
                                            value={district}
                                            onChange={(opt) => { setDistrict(opt); if (errors.district) setErrors(p => ({ ...p, district: '' })); }}
                                            placeholder="Select District"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            styles={errors.district ? { control: (b) => ({ ...b, borderColor: '#dc3545' }) } : {}}
                                        />
                                        {errors.district && <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.district}</span>}
                                    </div>
                                    <div className="col-12 col-md-3 form-group">
                                        <label>City Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter City Name"
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
                                            placeholder="Status"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <hr />
                                <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/geolocations/city')}>Cancel</button>
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
export default CityEdit;
