import { useLoader } from '../../../../context/LoaderContext';
﻿import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const TaxMasterEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        company: '',
        taxName: '',
        taxPercentage: '',
        status: 'Active'
    });

    const [companyOptions, setCompanyOptions] = useState([]);

    useEffect(() => {
        const fetchTaxData = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const [taxRes, compRes] = await Promise.all([
                    fetch(`${baseUrl}/api/master/tax/${id}`, { headers }),
                    fetch(`${baseUrl}/api/master/company`, { headers })
                ]);
                
                if (taxRes.status === 401 || taxRes.status === 403 || compRes.status === 401 || compRes.status === 403) {
                    sessionStorage.removeItem('erp_auth');
                    sessionStorage.removeItem('erp_token');
                    sessionStorage.removeItem('erp_user');
                    window.location.href = '/login';
                    return;
                }
                
                const taxResult = await taxRes.json();
                const compResult = await compRes.json();

                if (compResult.status && compResult.data) {
                    setCompanyOptions(compResult.data.map(c => ({ value: c.id, label: c.name })));
                }

                if (taxResult.status && taxResult.data) {
                    const d = Array.isArray(taxResult.data) ? taxResult.data[0] : taxResult.data;
                    setFormData({
                        company: d.tax_category_id || '',
                        taxName: d.name || '',
                        taxPercentage: d.percentage || '',
                        status: d.status === 1 || d.status === '1' || d.status_label === 'Active' ? 'Active' : 'Inactive'
                    });
                }
            } catch (error) {
                console.error("Error fetching tax master details:", error);
            }
        };
        if (id) {
            fetchTaxData();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const payload = {
                tax_category_id: formData.company,
                name: formData.taxName,
                percentage: Number(formData.taxPercentage),
                status: formData.status === 'Active' || formData.status === 1 ? 1 : 0,
                log_status: formData.status === 'Active' || formData.status === 1 ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/master/tax/${id}`, {
                method: 'PUT',
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
                setShowUpdatePopup(false);
                navigate('/power-master/tax-master');
            } else {
                console.error("API Error:", json ? json.message : "Unknown Error");
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error("Error updating tax master", error);
            setShowUpdatePopup(false);
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
                        <h3 className="card-title">Edit Tax Master</h3>
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
                                <button type="submit" className="btn-save">Update Tax Master</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default TaxMasterEdit;
