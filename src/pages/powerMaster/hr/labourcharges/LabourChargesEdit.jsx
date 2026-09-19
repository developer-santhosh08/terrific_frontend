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

const LabourChargesEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        our_charge: '',
        customer_charge: '',
        effect_from: '',
        effect_till: '',
        status: statusOptions[0]
    });
    const { loading, setLoading } = useLoader();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        const fetchLabourCharge = async () => {
            try {
                const __apiRes = await apiFetch('/master/labour-charge');
                if (!__apiRes) return;
                const result = __apiRes.json;
                if (result.status && Array.isArray(result.data)) {
                    const item = result.data.find(d => String(d.id) === String(id));
                    if (item) {
                        setFormData({
                            name: item.name || '',
                            our_charge: item.our_charge ?? '',
                            customer_charge: item.customer_charge ?? '',
                            effect_from: item.effect_from || '',
                            effect_till: item.effect_till || '',
                            status: statusOptions.find(opt => opt.value === item.status) || statusOptions[0]
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching labour charge:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLabourCharge();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setApiError('');
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                our_charge: Number(formData.our_charge),
                customer_charge: Number(formData.customer_charge),
                effect_from: formData.effect_from,
                effect_till: formData.effect_till,
                status: formData.status.value
            };

            const response = await apiFetch(`/master/labour-charge/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = __apiRes.json;
            if (result.status) {
                navigate('/power-master/hr/labour-charges');
            } else {
                const detail = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result.message;
                setApiError(detail || 'Failed to update labour charge.');
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error('Error updating labour charge:', error);
            setApiError('Network error. Please try again.');
            setShowUpdatePopup(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Labour Charges</h3>
                        <button
                            className="btn-header-back"
                            onClick={() => navigate('/power-master/hr/labour-charges')}
                        >
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
                                        <label>Our Charge</label>
                                        <input
                                            type="number"
                                            name="our_charge"
                                            className="form-control"
                                            placeholder="Enter Our Charge"
                                            value={formData.our_charge}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Customer Charge</label>
                                        <input
                                            type="number"
                                            name="customer_charge"
                                            className="form-control"
                                            placeholder="Enter Customer Charge"
                                            value={formData.customer_charge}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Effect From</label>
                                        <input
                                            type="date"
                                            name="effect_from"
                                            className="form-control"
                                            value={formData.effect_from}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-12 col-md-3 form-group mb-3">
                                        <label>Effect Till</label>
                                        <input
                                            type="date"
                                            name="effect_till"
                                            className="form-control"
                                            value={formData.effect_till}
                                            onChange={handleInputChange}
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
                                    <button type="submit" className="btn-save" disabled={isSubmitting}>
                                        {isSubmitting ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <UpdatePopup
                isOpen={showUpdatePopup}
                onClose={() => setShowUpdatePopup(false)}
                onConfirm={handleConfirmUpdate}
            />
        </section>
    );
};

export default LabourChargesEdit;
