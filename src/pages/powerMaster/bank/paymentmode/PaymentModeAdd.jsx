import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const PaymentModeAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [paymentMode, setPaymentMode] = useState('');
    const [selectedStatus, setSelectedStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!paymentMode.trim()) newErrors.paymentMode = 'The payment mode field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const body = {
                name: paymentMode,
                status: selectedStatus && selectedStatus.value === 'Inactive' ? "0" : "1"
            };

            const token = sessionStorage.getItem('erp_token');
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/payment-mode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            navigate('/power-master/bank/payment-mode');
        } catch (err) {
            console.error("Error creating payment mode:", err);
            setShowSubmitPopup(false);
        }
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
                        <h3 className="card-title">Add Payment Mode</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/bank/payment-mode')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Payment Mode <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Payment Mode"
                                        value={paymentMode}
                                        onChange={(e) => { setPaymentMode(e.target.value); if (errors.paymentMode) setErrors(p => ({ ...p, paymentMode: '' })); }}
                                        style={errors.paymentMode ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.paymentMode && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The payment mode field is required.</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        value={selectedStatus}
                                        onChange={setSelectedStatus}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/bank/payment-mode')}>Cancel</button>
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

export default PaymentModeAdd;
