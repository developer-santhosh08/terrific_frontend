import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const AccountsHeadAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [accountsCategoryName, setAccountsCategoryName] = useState(null);
    const [accountsHeadName, setAccountsHeadName] = useState('');
    const [needJobCardNo, setNeedJobCardNo] = useState({ value: 'Yes', label: 'Yes' });
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });
    const [categoryOptions, setCategoryOptions] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/accounts-category`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await res.json();
                if (result.status && result.data) {
                    setCategoryOptions(result.data.map(c => ({ value: c.id, label: c.name })));
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const payload = {
                account_category_id: accountsCategoryName?.value,
                name: accountsHeadName,
                job_card_status: needJobCardNo?.value,
                status: status?.value === 'Active' || status?.value === 1 ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/accounts-head`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const result = await res.json();

            if (result.status) {
                setShowSubmitPopup(false);
                navigate('/power-master/bank/accounts-head');
            } else {
                console.error("API Error:", result.message);
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error("Error creating accounts head", error);
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
                        <h3 className="card-title">Add Accounts Head</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/bank/accounts-head')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Accounts Category Name <span className="text-danger">*</span></label>
                                    <Select
                                        options={categoryOptions}
                                        value={accountsCategoryName}
                                        onChange={setAccountsCategoryName}
                                        placeholder="Select Category"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Accounts Head Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Accounts Head Name"
                                        value={accountsHeadName}
                                        onChange={(e) => setAccountsHeadName(e.target.value)}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Need Job Card No</label>
                                    <Select
                                        options={[
                                            { value: 'Yes', label: 'Yes' },
                                            { value: 'No', label: 'No' },
                                            { value: 'off', label: 'off' }
                                        ]}
                                        value={needJobCardNo}
                                        onChange={setNeedJobCardNo}
                                        placeholder="Select"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/bank/accounts-head')}>Cancel</button>
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

export default AccountsHeadAdd;
