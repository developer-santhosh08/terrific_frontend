import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const VendorGroupEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [vendorGroupName, setVendorGroupName] = useState('');
    const [status, setStatus] = useState('Active');
    const [errors, setErrors] = useState({});
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    useEffect(() => {
        if (id) {
            apiFetch(`/master/vendorGroup/${id}`)
                .then(r => r?.json || {})
                .then(d => {
                    if (d.status && d.data) {
                        setVendorGroupName(d.data.name || '');
                        setStatus(d.data.status === 1 ? 'Active' : 'Inactive');
                    }
                })
                .catch(err => console.error('Error fetching vendor group:', err));
        }
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!vendorGroupName.trim()) newErrors.vendorGroupName = 'The vendor group name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const res = await apiFetch(`/master/vendorGroup/${id}`, {
                method: 'PUT',
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
                console.error('Error updating vendor group:', data.message);
                setShowUpdatePopup(false);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setShowUpdatePopup(false);
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
                        <h3 className="card-title">Edit Vendor Group</h3>
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
                                        value={vendorGroupName}
                                        onChange={(e) => setVendorGroupName(e.target.value)}
                                        placeholder="Vendor Group Name"
                                    />
                                    {errors.vendorGroupName && <span className="text-danger tw-text-xs">{errors.vendorGroupName}</span>}
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

export default VendorGroupEdit;
