import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const CustomerGradingAdd = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader();

    const [customerGrade, setCustomerGrade] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!customerGrade.trim()) newErrors.customerGrade = 'The customer grade field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        
        setIsSubmitting(true);
        setLoading(true);
        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/customer-grading', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: customerGrade,
                    status: status.value === 'Inactive' ? 2 : 1,
                    log_status: 1
                })
            });
            const json = await res.json();
            if (json.status) {
                setShowSubmitPopup(true);
            } else {
                alert(json.message || 'Failed to create grading');
            }
        } catch (err) {
            console.error('Error creating grading:', err);
            alert('An error occurred while creating the grading');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/customer/customer-grading');
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Customer Grade</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/customer/customer-grading')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Customer Grade <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Customer Grade"
                                        value={customerGrade}
                                        onChange={(e) => { setCustomerGrade(e.target.value); if (errors.customerGrade) setErrors(p => ({ ...p, customerGrade: '' })); }}
                                        style={errors.customerGrade ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.customerGrade && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The customer grade field is required.</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select 
                                        options={statusOptions}
                                        value={status}
                                        onChange={(val) => setStatus(val)}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/customer/customer-grading')} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
        );
};

export default CustomerGradingAdd;
