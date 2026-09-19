import { useLoader } from '../../../../context/LoaderContext';
﻿import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const ProjectAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        value: '',
        int_per: '',
        budget_value: '',
        status: 'Active'
    });

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const payload = {
                name: formData.name,
                value: Number(formData.value),
                int_per: Number(formData.int_per),
                budget_value: Number(formData.budget_value),
                project_status: formData.status === 'Active' ? 1 : 0,
                status: formData.status === 'Active' ? 1 : 0,
                log_status: formData.status === 'Active' ? 1 : 0
            };

            const token = sessionStorage.getItem('erp_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${baseUrl}/api/master/project`, {
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
                navigate('/power-master/project');
            } else {
                console.error("API Error:", json ? json.message : "Unknown Error");
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error("Error creating project", error);
            setShowSubmitPopup(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Project</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/project')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Project Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter project name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Project Value <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter project value"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Intimation % <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter intimation %"
                                        name="int_per"
                                        value={formData.int_per}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Project Budget Value <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter budget value"
                                        name="budget_value"
                                        value={formData.budget_value}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Status</label>
                                    <Select
                                        options={[
                                            { value: 'Active', label: 'Active' },
                                            { value: 'Inactive', label: 'Inactive' }
                                        ]}
                                        value={formData.status ? { value: formData.status, label: formData.status } : null}
                                        onChange={(opt) => handleChange({ target: { name: 'status', value: opt ? opt.value : '' } })}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/project')}>Cancel</button>
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

export default ProjectAdd;
