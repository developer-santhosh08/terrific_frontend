import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const CustomerSubEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { setLoading } = useLoader();
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const [formData, setFormData] = useState({
        customer_category_id: null,
        name: '',
        status: { value: 'Active', label: 'Active' }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.customer_category_id || !formData.name.trim()) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsSubmitting(true);
        setLoading(true);
        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + `/api/master/customer-sub-category/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_category_id: formData.customer_category_id.value,
                    name: formData.name,
                    status: formData.status?.value === 'Inactive' ? 2 : 1
                })
            });
            const json = await res.json();
            if (json.status) {
                setShowUpdatePopup(true);
            } else {
                alert(json.message || 'Failed to update sub category');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('An error occurred while updating the sub category');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleConfirmUpdate = () => {
        navigate('/power-master/customer/customer-sub-category');
    };

    const [categoryOptions, setCategoryOptions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const catRes = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/customer-category');
                const catJson = await catRes.json();
                let categories = [];
                if (catJson.status && catJson.data) {
                    categories = catJson.data.map(item => ({
                        value: item.id,
                        label: item.name
                    }));
                    setCategoryOptions(categories);
                }

                // Fetch details
                if (id) {
                    const detailRes = await fetch(import.meta.env.VITE_API_BASE_URL + `/api/master/customer-sub-category/${id}`);
                    const detailJson = await detailRes.json();
                    if (detailJson.status && detailJson.data) {
                        const subCat = detailJson.data;
                        const catOption = categories.find(c => c.value === subCat.customer_category_id);
                        
                        setFormData({
                            customer_category_id: catOption || null,
                            name: subCat.name || '',
                            status: { 
                                value: (subCat.status === 2 || subCat.status === "2") ? 'Inactive' : 'Active', 
                                label: (subCat.status === 2 || subCat.status === "2") ? 'Inactive' : 'Active' 
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    if (isInitialLoading) return <div className="text-center py-5">Loading data...</div>;

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Customer Sub Category</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/customer/customer-sub-category')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Customer Category <span className="text-danger">*</span></label>
                                    <Select 
                                        options={categoryOptions}
                                        value={formData.customer_category_id}
                                        onChange={(val) => setFormData(prev => ({...prev, customer_category_id: val}))}
                                        placeholder="Select Category"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Customer Sub Category <span className="text-danger">*</span></label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select 
                                        options={statusOptions}
                                        value={formData.status}
                                        onChange={(val) => setFormData(prev => ({...prev, status: val}))}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/customer/customer-sub-category')} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};

export default CustomerSubEdit;
