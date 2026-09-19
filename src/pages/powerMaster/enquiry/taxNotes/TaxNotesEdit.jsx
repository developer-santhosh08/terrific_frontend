import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const TaxNotesEdit = () => {

    const navigate = useNavigate();
    const { id: itemId } = useParams();

    const [name, setName] = useState('');
    const [status, setStatus] = useState({ value: 1, label: 'Active' });
    const { loading, setLoading } = useLoader();
    const [fetchError, setFetchError] = useState('');
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    const statusOptions = [
        { value: 1, label: 'Active' },
        { value: 0, label: 'Inactive' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setFetchError('');
            try {
                const token = sessionStorage.getItem('erp_token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/master/tax-note/${itemId}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const data = await response.json();
                
                if (data?.status && data?.data) {
                    const d = data.data;
                    setName(d.name || '');
                    setStatus(statusOptions.find((o) => String(o.value) === String(d.status)) ?? statusOptions[0]);
                } else {
                    setFetchError(data?.message || 'Failed to fetch tax note details.');
                }
            } catch (error) {
                console.error("Error fetching tax note details:", error);
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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/master/tax-note/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ name: name.trim(), status: status.value }),
            });
            const data = await response.json();
            if (data?.status) {
                navigate('/power-master/tax-notes');
            } else {
                setApiError(data?.message || 'Failed to update tax note.');
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
                        <h3 className="card-title">Edit Tax Notes</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/tax-notes')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {fetchError && <div className="alert alert-danger py-2 mb-3">{fetchError}</div>}
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        {loading ? (
                            <div className="tw-text-center py-4">Loading...</div>
                        ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/tax-notes')}>Cancel</button>
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
export default TaxNotesEdit;