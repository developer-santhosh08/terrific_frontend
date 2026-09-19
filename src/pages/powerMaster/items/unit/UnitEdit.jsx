import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const UnitEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [unitName, setUnitName] = useState('');
    const [unitType, setUnitType] = useState('0');
    const [status, setStatus] = useState('Active');
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchUnit = async () => {
            try {
                const result = await apiFetch(`/master/unit/${id}`);
                if (!result) return;
                const { res, json } = result;
                if (json.status && json.data) {
                    setUnitName(json.data.name || '');
                    setUnitType(String(json.data.type ?? '0'));
                    setStatus(json.data.status === 1 ? 'Active' : 'Inactive');
                }
            } catch (err) {
                console.error('Error fetching unit:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchUnit();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!unitName.trim()) newErrors.unitName = 'The unit name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            setSubmitting(true);
            const result = await apiFetch(`/master/unit/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: unitName,
                    type: Number(unitType),
                    status: status
                })
            });
                if (!result) return;
                const { res, json } = result;
            if (json.status) {
                navigate('/power-master/items/unit');
            } else {
                console.error("API returned error:", json.message);
            }
        } catch (error) {
            console.error("Error updating unit:", error);
        } finally {
            setSubmitting(false);
            setShowUpdatePopup(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    const unitTypeOptions = [
        { value: '0', label: '0' },
        { value: '1', label: '1' }
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Unit</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/unit')}>
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
                                        <label>Unit Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.unitName ? 'is-invalid' : ''}`}
                                            value={unitName}
                                            onChange={(e) => setUnitName(e.target.value)}
                                        />
                                        {errors.unitName && <div className="invalid-feedback">{errors.unitName}</div>}
                                    </div>
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Unit Type</label>
                                        <Select
                                            options={unitTypeOptions}
                                            value={unitTypeOptions.find(opt => opt.value === unitType)}
                                            onChange={(selected) => setUnitType(selected.value)}
                                            placeholder="Select Unit Type"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            menuPosition="fixed"
                                        />
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
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/items/unit')} disabled={submitting}>Cancel</button>
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

export default UnitEdit;
