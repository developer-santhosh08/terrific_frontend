import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const VendorSubAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);

    const [formData, setFormData] = useState({
        vendor_category_id: null,
        name: '',
        status: 'Active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const res = await apiFetch('/master/vendorSubCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
const data = res?.json || {};
            if (data.status) {
                navigate('/power-master/vendor/vendor-sub-category');
            } else {
                console.error('Error:', data.message);
                setShowSubmitPopup(false);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setShowSubmitPopup(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    useEffect(() => {
        apiFetch('/master/vendorCategory')
            .then(r => r?.json || {})
            .then(d => {
                if (d.status && d.data) {
                    setCategoryOptions(d.data.map(c => ({ value: c.id, label: c.name })));
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Vendor Sub Category</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/vendor/vendor-sub-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Vendor Category <span className="text-danger">*</span></label>
                                    <Select
                                        options={categoryOptions}
                                        value={categoryOptions.find(o => o.value === formData.vendor_category_id) || null}
                                        onChange={(selected) => setFormData({ ...formData, vendor_category_id: selected ? selected.value : null })}
                                        placeholder="Vendor Category"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Vendor Sub Category <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Vendor Sub Category"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        value={statusOptions.find(o => o.value === formData.status) || null}
                                        onChange={(selected) => setFormData({ ...formData, status: selected ? selected.value : 'Active' })}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/vendor/vendor-sub-category')}>Cancel</button>
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

export default VendorSubAdd;
