import { useLoader } from '../../../../context/LoaderContext';
﻿import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';

const ProjectEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        value: '',
        int_per: '',
        budget_value: '',
        status: 'Active'
    });

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const response = await fetch(`${baseUrl}/api/master/project/${id}`, {
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

                const json = await response.json();
                if (response.ok && json.status && json.data) {
                    const d = Array.isArray(json.data) ? json.data[0] : json.data;
                    setFormData({
                        name: d.name || '',
                        value: d.value || '',
                        int_per: d.int_per || '',
                        budget_value: d.budget_value || '',
                        status: d.status === 1 || d.status === '1' || d.status_label === 'Active' ? 'Active' : 'Inactive'
                    });
                }
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        };
        if (id) fetchProject();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
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
            const response = await fetch(`${baseUrl}/api/master/project/${id}`, {
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
                navigate('/power-master/project');
            } else {
                console.error("API Error:", json ? json.message : "Unknown Error");
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error("Error updating project", error);
            setShowUpdatePopup(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Project</h3>
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
                                <button type="submit" className="btn-save">Update Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />
        </section>
    );
};

export default ProjectEdit;
