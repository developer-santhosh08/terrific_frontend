import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const TaxMasterAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        company: '',
        taxName: '',
        taxPercentage: '',
        status: 'Active'
    });

    const [companyOptions, setCompanyOptions] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const response = await fetch(`${baseUrl}/api/master/company`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                
                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem('erp_auth');
                    sessionStorage.removeItem('erp_token');
                    sessionStorage.removeItem('erp_user');
                    window.location.href = '/login';
                    return;
                }

                const compResult = await response.json();
                if (response.ok && compResult.status && compResult.data) {
                    setCompanyOptions(compResult.data.map(c => ({ value: c.id, label: c.name })));
                }
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        fetchDropdowns();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const payload = {
                tax_category_id: formData.company,
                name: formData.taxName,
                percentage: Number(formData.taxPercentage),
                status: formData.status === 'Active' ? 1 : 0,
                log_status: formData.status === 'Active' ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/master/tax`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('erp_auth');
                sessionStorage.removeItem('erp_token');
                sessionStorage.removeItem('erp_user');
                window.location.href = '/login';
                return;
            }

            const json = await response.json();
            
            if (response.ok && json.status) {
                setShowSubmitPopup(false);
                navigate('/power-master/tax-master');
            } else {
                console.error("API Error:", json ? json.message : "Unknown Error");
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error("Error creating tax master", error);
            setShowSubmitPopup(false);
        }
    };

    const handleCancel = () => {
        navigate('/power-master/tax-master');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Tax Master</h3>
                        <button className="btn-header-back" type="button" onClick={() => navigate('/power-master/tax-master')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Company <span className="text-danger">*</span></label>
                                        <Select
                                            options={companyOptions}
                                            value={companyOptions.find(opt => opt.value === formData.company) || null}
                                            onChange={(selectedOption) => handleChange({ target: { name: 'company', value: selectedOption ? selectedOption.value : '' } })}
                                            placeholder="Choose a company.."
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Tax Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter tax name"
                                            name="taxName"
                                            value={formData.taxName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Tax Percentage <span className="text-danger">*</span></label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter tax percentage"
                                            step="0.01"
                                            name="taxPercentage"
                                            value={formData.taxPercentage}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Status <span className="text-danger">*</span></label>
                                        <Select
                                            options={[
                                                { value: 'Active', label: 'Active' },
                                                { value: 'Inactive', label: 'Inactive' },
                                            ]}
                                            value={formData.status ? { value: formData.status, label: formData.status } : null}
                                            onChange={(selectedOption) => handleChange({ target: { name: 'status', value: selectedOption ? selectedOption.value : '' } })}
                                            placeholder="Status"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
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

export default TaxMasterAdd;
