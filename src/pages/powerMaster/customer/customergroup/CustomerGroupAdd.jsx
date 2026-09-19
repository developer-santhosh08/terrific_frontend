import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const CustomerGroupAdd = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader();

    const [customerGroup, setCustomerGroup] = useState('');
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!customerGroup.trim()) newErrors.customerGroup = 'The customer group field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        
        setIsSubmitting(true);
        setLoading(true);
        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/customer-group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: customerGroup,
                    status: status.value === 'Inactive' ? 2 : 1,
                    log_status: 1
                })
            });
            
            const json = await res.json();
            if (json.status) {
                setShowSubmitPopup(true);
            } else {
                alert(json.message || 'Failed to create customer group');
            }
        } catch (err) {
            console.error('Error creating customer group:', err);
            alert('An error occurred while creating the customer group');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/customer/customer-group');
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
                        <h3 className="card-title">Add Customer Group</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/customer/customer-group')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Customer Group <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Customer Group"
                                        value={customerGroup}
                                        onChange={(e) => { setCustomerGroup(e.target.value); if (errors.customerGroup) setErrors(p => ({ ...p, customerGroup: '' })); }}
                                        style={errors.customerGroup ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.customerGroup && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The customer group field is required.</span>}
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/customer/customer-group')}>Cancel</button>
                                <button type="submit" className="btn-save">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
        );
};

export default CustomerGroupAdd;
