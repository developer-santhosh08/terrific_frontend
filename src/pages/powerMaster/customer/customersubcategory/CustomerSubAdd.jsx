import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const CustomerSubAdd = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const [formData, setFormData] = useState({
        customer_category_id: null,
        name: '',
        status: { value: 'Active', label: 'Active' }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.customer_category_id || !formData.name.trim()) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsSubmitting(true);
        setLoading(true);
        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/customer-sub-category', {
                method: 'POST',
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
                setShowSubmitPopup(true);
            } else {
                alert(json.message || 'Failed to create sub category');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('An error occurred while creating the sub category');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/customer/customer-sub-category');
    };

    const [categoryOptions, setCategoryOptions] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/customer-category');
                const json = await res.json();
                if (json.status && json.data) {
                    setCategoryOptions(json.data.map(item => ({
                        value: item.id,
                        label: item.name
                    })));
                }
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };
        fetchCategories();
    }, []);

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Customer Sub Category</h3>
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
                                        placeholder="Customer Sub Category" 
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
                                <button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
        );
};

export default CustomerSubAdd;
