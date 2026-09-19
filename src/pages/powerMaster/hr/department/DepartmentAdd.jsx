import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const cumTargetOptions = [
    { value: 1, label: 'Individual' },
    { value: 0, label: 'Common' },
];

const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
];

const DepartmentAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [cumTarget, setCumTarget] = useState(cumTargetOptions[0]);
    const [status, setStatus] = useState(statusOptions[0]);
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [existingDepartments, setExistingDepartments] = useState([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const result = await apiFetch(`/master/department`, { cache: 'no-store' });
                if (!result) return;
                const { res, json } = result;
                if (json.status && Array.isArray(json.data)) {
                    setExistingDepartments(json.data);
                }
            } catch {
                // silently ignore — duplicate check is non-critical
            }
        };
        fetchDepartments();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'The name field is required.';
        const duplicate = existingDepartments.find(
            (d) => d.name?.toLowerCase() === name.trim().toLowerCase()
        );
        if (duplicate) newErrors.name = 'A department with this name already exists.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setApiError('');
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setSubmitting(true);
        try {
            const result = await apiFetch(`/master/department`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    cum_target: cumTarget.value,
                    status: status.value,
                }),
            });
                if (!result) return;
                const { res, json } = result;
            if (json.status) {
                navigate('/power-master/hr/department');
            } else {
                const detail = json.errors
                    ? Object.values(json.errors).flat().join(' ')
                    : json.message;
                setApiError(detail || 'Failed to create department.');
            }
        } catch {
            setApiError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
            setShowSubmitPopup(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Department</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/hr/department')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Department Name"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
                                        style={errors.name ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.name && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The name field is required.</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group">
                                    <label>Cumulative Target</label>
                                    <Select
                                        options={cumTargetOptions}
                                        value={cumTarget}
                                        onChange={setCumTarget}
                                        placeholder="Select"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group">
                                    <label>Status </label>
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/hr/department')}>Cancel</button>
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

export default DepartmentAdd;
