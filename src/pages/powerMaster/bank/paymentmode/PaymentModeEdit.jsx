import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const PaymentModeEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [paymentMode, setPaymentMode] = useState('');
    const [selectedStatus, setSelectedStatus] = useState({ value: 'Active', label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    useEffect(() => {
        const fetchPaymentMode = async () => {
            if (!id) return;
            try {
                const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/payment-mode`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
                if (json.status && json.data) {
                    const d = json.data.find(p => p.id === parseInt(id));
                    if (d) {
                        setPaymentMode(d.name || '');
                        setSelectedStatus((d.status === 0 || d.status === "0") ? { value: 'Inactive', label: 'Inactive' } : { value: 'Active', label: 'Active' });
                    }
                }
            } catch (err) {
                console.error("Error fetching payment mode:", err);
            }
        };
        fetchPaymentMode();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!paymentMode.trim()) newErrors.paymentMode = 'The payment mode field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const body = {
                name: paymentMode,
                status: selectedStatus && selectedStatus.value === 'Inactive' ? "0" : "1"
            };
            await fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/payment-mode/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            navigate('/power-master/bank/payment-mode');
        } catch (err) {
            console.error("Error updating payment mode:", err);
            setShowUpdatePopup(false);
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
                        <h3 className="card-title">Edit Payment Mode</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/bank/payment-mode')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Payment Mode <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} placeholder="Payment Mode" />
                                    {errors.paymentMode && <small className="text-danger">{errors.paymentMode}</small>}
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
                                <button type="submit" className="btn-save">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default PaymentModeEdit;
