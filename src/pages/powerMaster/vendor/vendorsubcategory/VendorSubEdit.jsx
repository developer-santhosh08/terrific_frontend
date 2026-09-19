import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { apiFetch } from '../../../../lib/api';
import { useLoader } from '../../../../context/LoaderContext';

const VendorSubEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [formData, setFormData] = useState({
        vendor_category_id: null,
        name: '',
        status: 'Active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const res = await apiFetch(`/master/vendorSubCategory/${id}`, {
                method: 'PUT',
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
                setShowUpdatePopup(false);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setShowUpdatePopup(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    useEffect(() => {
        // Fetch categories dropdown
        apiFetch('/master/vendorCategory')
            .then(r => r?.json || {})
            .then(d => {
                if (d.status && d.data) {
                    setCategoryOptions(d.data.map(c => ({ value: c.id, label: c.name })));
                }
            })
            .catch(err => console.error(err));

        // Fetch existing record data
        if (id) {
            apiFetch(`/master/vendorSubCategory/${id}`)
                .then(r => r?.json || {})
                .then(d => {
                    if (d.status && d.data) {
                        setFormData({
                            vendor_category_id: d.data.vendor_category_id,
                            name: d.data.name,
                            status: d.data.status === 1 ? 'Active' : 'Inactive'
                        });
                    }
                })
                .catch(err => console.error(err));
        }
    }, [id]);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Vendor Sub Category</h3>
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

export default VendorSubEdit;
