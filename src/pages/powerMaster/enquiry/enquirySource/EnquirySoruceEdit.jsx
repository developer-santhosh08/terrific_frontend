import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const EnquirySoruceEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [enquirySource, setEnquirySource] = useState('');
    const [status, setStatus] = useState('Active');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/enquiry-source/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const data = await response.json();
                if (data?.status && data?.data) {
                    setEnquirySource(data.data.name || '');
                    setStatus(data.data.status === 1 ? 'Active' : 'Inactive');
                }
            } catch (error) {
                console.error("Error fetching details:", error);
            }
        };
        if (id) fetchDetails();
    }, [id]);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!enquirySource.trim()) newErrors.enquirySource = 'The enquiry source field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const payload = {
                name: enquirySource,
                status: status === 'Active' ? 1 : 0
            };
            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/enquiry-source/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data?.status) {
                navigate('/power-master/enquiry-source');
            } else {
                console.error("Failed to update:", data?.message);
                navigate('/power-master/enquiry-source');
            }
        } catch (error) {
            console.error("Error updating:", error);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Enquiry Source</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/enquiry-source')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Enquiry Source <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={enquirySource}
                                        onChange={(e) => { setEnquirySource(e.target.value); if (errors.enquirySource) setErrors(p => ({ ...p, enquirySource: '' })); }}
                                        style={errors.enquirySource ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.enquirySource && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The enquiry source field is required.</span>}
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Status</label>
                                    <Select
                                        options={[
                                            { value: 'Active', label: 'Active' },
                                            { value: 'Inactive', label: 'Inactive' },
                                        ]}
                                        value={status ? { value: status, label: status } : null}
                                        onChange={(selectedOption) => setStatus(selectedOption ? selectedOption.value : '')}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/enquiry-source')}>Cancel</button>
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

export default EnquirySoruceEdit;
