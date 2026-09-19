import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const UnitAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [unitName, setUnitName] = useState('');
    const [unitType, setUnitType] = useState('0');
    const [status, setStatus] = useState('Active');
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!unitName.trim()) newErrors.unitName = 'The unit name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            setSubmitting(true);
            const result = await apiFetch('/master/unit', {
                method: 'POST',
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
            console.error("Error creating unit:", error);
        } finally {
            setSubmitting(false);
            setShowSubmitPopup(false);
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
                        <h3 className="card-title">Add Unit</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/unit')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Unit Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Unit Name"
                                        value={unitName}
                                        onChange={(e) => { setUnitName(e.target.value); if (errors.unitName) setErrors(p => ({ ...p, unitName: '' })); }}
                                        style={errors.unitName ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.unitName && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The unit name field is required.</span>}
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
                                <button type="submit" className="btn-save" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
    );
};

export default UnitAdd;
