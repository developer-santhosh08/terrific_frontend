import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const AccountsCategoryEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [accountsCategory, setAccountsCategory] = useState('');
    const [status, setStatus] = useState({ value: 1, label: 'Active' });
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    useEffect(() => {
        const fetchAccountsCategory = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/accounts-category/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await res.json();
                if (result.status && result.data) {
                    const data = result.data;
                    setAccountsCategory(data.name || '');
                    setStatus(data.status === 1 || data.status === 'Active' || data.status === '1' ? { value: 1, label: 'Active' } : { value: 0, label: 'Inactive' });
                }
            } catch (error) {
                console.error("Error fetching accounts category details", error);
            }
        };
        if (id) {
            fetchAccountsCategory();
        }
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!accountsCategory.trim()) newErrors.accountsCategory = 'The accounts category field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const payload = {
                name: accountsCategory,
                status: status?.value === 'Active' || status?.value === 1 ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/accounts-category/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (result.status) {
                setShowUpdatePopup(false);
                navigate('/power-master/bank/accounts-category');
            } else {
                console.error("API Error:", result.message);
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error("Error updating accounts category", error);
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
                        <h3 className="card-title">Edit Accounts Category</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/bank/accounts-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Accounts Category <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={accountsCategory}
                                        onChange={(e) => setAccountsCategory(e.target.value)}
                                        placeholder="Accounts Category"
                                    />
                                    {errors.accountsCategory && <div className="text-danger tw-text-xs mt-1">{errors.accountsCategory}</div>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        value={status}
                                        onChange={setStatus}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/bank/accounts-category')}>Cancel</button>
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

export default AccountsCategoryEdit;
