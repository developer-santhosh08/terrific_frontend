import { useLoader } from '../../../../context/LoaderContext';
﻿import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const AccountsHeadEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [accountsCategoryName, setAccountsCategoryName] = useState(null);
    const [accountsHeadName, setAccountsHeadName] = useState('');
    const [needJobCardNo, setNeedJobCardNo] = useState({ value: 'Yes', label: 'Yes' });
    const [status, setStatus] = useState({ value: 1, label: 'Active' });
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                };
                
                const [catRes, headRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/accounts-category`, { headers }),
                    id ? fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/accounts-head/${id}`, { headers }) : Promise.resolve(null)
                ]);

                let categories = [];
                const catJson = await catRes.json();
                if (catJson.status && catJson.data) {
                    categories = catJson.data.map(c => ({ value: c.id, label: c.name }));
                    setCategoryOptions(categories);
                }

                if (headRes) {
                    const headJson = await headRes.json();
                    if (headJson.status && headJson.data) {
                        const data = headJson.data;
                        const matchedCat = categories.find(c => String(c.value) === String(data.account_category_id));
                        
                        setAccountsCategoryName(data.account_category_id ? { value: data.account_category_id, label: matchedCat ? matchedCat.label : data.account_category_id } : null);
                        setAccountsHeadName(data.name || '');
                        setNeedJobCardNo({ value: data.job_card_status || 'Yes', label: data.job_card_status || 'Yes' });
                        setStatus(data.status === 1 || data.status === 'Active' || data.status === '1' ? { value: 'Active', label: 'Active' } : { value: 'Inactive', label: 'Inactive' });
                    }
                }
            } catch (error) {
                console.error("Error fetching accounts head details", error);
            }
        };
        fetchDetails();
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const payload = {
                account_category_id: accountsCategoryName?.value,
                name: accountsHeadName,
                job_card_status: needJobCardNo?.value,
                status: status?.value === 'Active' || status?.value === 1 ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/accounts-head/${id}`, {
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
                navigate('/power-master/bank/accounts-head');
            } else {
                console.error("API Error:", result.message);
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error("Error updating accounts head", error);
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
                        <h3 className="card-title">Edit Accounts Head</h3>
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
                                        value={accountsHeadName}
                                        onChange={(e) => setAccountsHeadName(e.target.value)}
                                        placeholder="Accounts Head Name"
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

export default AccountsHeadEdit;
