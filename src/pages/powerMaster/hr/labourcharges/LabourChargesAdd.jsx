import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
];

const LabourChargesAdd = () => {
    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const { loading, setLoading } = useLoader();
    const [apiError, setApiError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        our_charge: '',
        customer_charge: '',
        effect_from: '',
        effect_till: '',
        status: statusOptions[0]
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setApiError('');
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                our_charge: Number(formData.our_charge),
                customer_charge: Number(formData.customer_charge),
                effect_from: formData.effect_from,
                effect_till: formData.effect_till,
                status: formData.status.value
            };

            const response = await apiFetch('/master/labour-charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = response.json;
            if (result.status) {
                navigate('/power-master/hr/labour-charges');
            } else {
                const detail = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result.message;
                setApiError(detail || 'Failed to create labour charge.');
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setApiError('Network error. Please try again.');
            setShowSubmitPopup(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Labour Charges</h3>
                        <button
                            className="btn-header-back"
                            onClick={() => navigate('/power-master/hr/labour-charges')}
                        >
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Enter Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Our Charge <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        name="our_charge"
                                        className="form-control"
                                        placeholder="Enter Our Charge"
                                        min="0"
                                        step="0.01"
                                        value={formData.our_charge}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Customer Charge <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        name="customer_charge"
                                        className="form-control"
                                        placeholder="Enter Customer Charge"
                                        min="0"
                                        step="0.01"
                                        value={formData.customer_charge}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Effect From <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        name="effect_from"
                                        className="form-control"
                                        value={formData.effect_from}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Effect Till <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        name="effect_till"
                                        className="form-control"
                                        value={formData.effect_till}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        value={formData.status}
                                        onChange={(opt) => setFormData(prev => ({ ...prev, status: opt }))}
                                        placeholder="Select Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => navigate('/power-master/hr/labour-charges')}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup
                isOpen={showSubmitPopup}
                onClose={() => setShowSubmitPopup(false)}
                onConfirm={handleConfirmSubmit}
            />
        </section>
    );
};

export default LabourChargesAdd;
