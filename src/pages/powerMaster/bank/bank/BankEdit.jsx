import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const BankEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [bankName, setBankName] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    useEffect(() => {
        const fetchBank = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/bank/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
                if (json.status && json.data) {
                    setBankName(json.data.name);
                    const statusStr = json.data.status === 1 ? 'Active' : 'Inactive';
                    setSelectedStatus({ value: statusStr, label: statusStr });
                }
            } catch (err) {
                console.error("Error fetching bank data:", err);
            }
        };
        if (id) {
            fetchBank();
        }
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!bankName.trim()) newErrors.bankName = 'The bank name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const body = {
                name: bankName,
                status: selectedStatus ? (selectedStatus.value === 'Active' ? 1 : 2) : 1
            };

            const token = sessionStorage.getItem('erp_token');
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/bank/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            navigate('/power-master/bank/bank');
        } catch (err) {
            console.error("Error updating bank:", err);
        } finally {
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
                        <h3 className="card-title">Edit Bank</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/bank/bank')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Bank Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.bankName ? 'is-invalid' : ''}`}
                                        value={bankName}
                                        onChange={(e) => {
                                            setBankName(e.target.value);
                                            if (errors.bankName) setErrors({ ...errors, bankName: '' });
                                        }}
                                        placeholder="Bank Name"
                                    />
                                    {errors.bankName && <div className="invalid-feedback">{errors.bankName}</div>}
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/bank/bank')}>Cancel</button>
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

export default BankEdit;
