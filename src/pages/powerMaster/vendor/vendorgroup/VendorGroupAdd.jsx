import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const VendorGroupAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [vendorGroupName, setVendorGroupName] = useState('');
    const [status, setStatus] = useState('Active');
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!vendorGroupName.trim()) newErrors.vendorGroupName = 'The vendor group name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const res = await apiFetch('/master/vendorGroup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: vendorGroupName,
                    status: status
                })
            });
const data = res?.json || {};
            if (data.status) {
                navigate('/power-master/vendor/vendor-group');
            } else {
                console.error('Error creating vendor group:', data.message);
                setShowSubmitPopup(false);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setShowSubmitPopup(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Vendor Group</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/vendor/vendor-group')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Vendor Group Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Vendor Group Name"
                                        value={vendorGroupName}
                                        onChange={(e) => { setVendorGroupName(e.target.value); if (errors.vendorGroupName) setErrors(p => ({ ...p, vendorGroupName: '' })); }}
                                        style={errors.vendorGroupName ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.vendorGroupName && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The vendor group name field is required.</span>}
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select 
                                        options={statusOptions}
                                        value={statusOptions.find(o => o.value === status) || null}
                                        onChange={(selected) => setStatus(selected ? selected.value : 'Active')}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/vendor/vendor-group')}>Cancel</button>
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

export default VendorGroupAdd;
