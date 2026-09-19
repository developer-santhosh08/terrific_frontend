import { useLoader } from '../../../../context/LoaderContext';
﻿import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const ChequeBookEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [formData, setFormData] = useState({
        bank_id: null,
        bank_account_details_id: null,
        number_of_leaf: '',
        starting_number: '',
        status: { value: 1, label: 'Active' }
    });

    useEffect(() => {
        const fetchChequeBook = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/cheque-book/${id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await res.json();
                if (result.status && result.data) {
                    const data = result.data;
                    setFormData({
                        bank_id: data.bank_id ? { value: data.bank_id, label: data.bank_name || data.bank || 'AXIS BANK' } : null,
                        bank_account_details_id: data.bank_account_details_id ? { value: data.bank_account_details_id, label: data.account_name || data.account || 'TERRIFIC TECHNOLOGIES' } : null,
                        number_of_leaf: data.number_of_leaf || data.no_of_leaf || data.noOfLeaf || '',
                        starting_number: data.starting_number || data.leaf_start_number || data.leafStartNumber || '',
                        status: data.status === 1 || data.status === 'Active' ? { value: 1, label: 'Active' } : { value: 0, label: 'Inactive' }
                    });
                }
            } catch (error) {
                console.error("Error fetching cheque book details", error);
            }
        };
        if (id) {
            fetchChequeBook();
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const payload = {
                bank_id: formData.bank_id?.value || '',
                bank_account_details_id: formData.bank_account_details_id?.value || '',
                number_of_leaf: formData.number_of_leaf,
                starting_number: formData.starting_number,
                status: formData.status?.value === 'Active' || formData.status?.value === 1 ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/cheque-book/${id}`, {
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
                navigate('/power-master/bank/cheque-book');
            } else {
                console.error("API Error:", result.message);
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error("Error updating form", error);
            setShowUpdatePopup(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    const bankOptions = [
        { value: 1, label: 'AXIS BANK' },
        { value: 2, label: 'HDFC' },
        { value: 3, label: 'HDFC savings' }
    ];

    const accountOptions = [
        { value: 1, label: 'TERRIFIC TECHNOLOGIES' }
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Cheque Book</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/bank/cheque-book')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Bank <span className="text-danger">*</span></label>
                                    <Select
                                        options={bankOptions}
                                        value={formData.bank_id}
                                        onChange={(option) => handleSelectChange('bank_id', option)}
                                        placeholder="Select Bank"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Account <span className="text-danger">*</span></label>
                                    <Select
                                        options={accountOptions}
                                        value={formData.bank_account_details_id}
                                        onChange={(option) => handleSelectChange('bank_account_details_id', option)}
                                        placeholder="Select Account"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>No.of Leaf <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="number_of_leaf"
                                        value={formData.number_of_leaf}
                                        onChange={handleInputChange}
                                        placeholder="No.of Leaf"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Leaf Start Number <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="starting_number"
                                        value={formData.starting_number}
                                        onChange={handleInputChange}
                                        placeholder="Leaf Start Number"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        value={formData.status}
                                        onChange={(option) => handleSelectChange('status', option)}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/bank/cheque-book')}>Cancel</button>
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

export default ChequeBookEdit;
