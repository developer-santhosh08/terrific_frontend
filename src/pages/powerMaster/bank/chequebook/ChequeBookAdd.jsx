import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const ChequeBookAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [formData, setFormData] = useState({
        bank_id: null,
        bank_account_details_id: null,
        number_of_leaf: '',
        starting_number: '',
        status: { value: 'Active', label: 'Active' }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const payload = {
                bank_id: formData.bank_id?.value || '',
                bank_account_details_id: formData.bank_account_details_id?.value || '',
                number_of_leaf: formData.number_of_leaf,
                starting_number: formData.starting_number,
                status: formData.status?.value === 'Active' ? 1 : (formData.status?.value === 'Inactive' ? 0 : 1)
            };

            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/cheque-book`, {
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
                navigate('/power-master/bank/cheque-book');
            } else {
                console.error("API Error:", result.message);
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error("Error submitting form", error);
            setShowSubmitPopup(false);
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
                        <h3 className="card-title">Add Cheque Book</h3>
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

export default ChequeBookAdd;
