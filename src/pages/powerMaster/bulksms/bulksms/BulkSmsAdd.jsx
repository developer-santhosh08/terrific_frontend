import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const BulkSmsAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/bulksms/bulksms');
    };

    const groupOptions = [
        { value: 'customer_group', label: 'Customer Group' },
        { value: 'vendor_group', label: 'Vendor Group' },
        { value: 'employee_group', label: 'Employee Group' },
    ];

    const categoryOptions = [
        { value: 'all', label: 'All' },
        { value: 'category_a', label: 'Category A' },
        { value: 'category_b', label: 'Category B' },
    ];

    const subCategoryOptions = [
        { value: 'all', label: 'All' },
        { value: 'sub_a', label: 'Sub Category A' },
        { value: 'sub_b', label: 'Sub Category B' },
    ];

    const customerOptions = [
        { value: 'all', label: 'All' },
        { value: 'terrific_tech', label: 'TERRIFIC TECHNOLOGIES' },
        { value: 'omega_ind', label: 'OMEGA INDUSTRIES' },
    ];

    const templateOptions = [
        { value: 'welcome', label: 'Welcome Message' },
        { value: 'sale', label: 'Summer Sale Offer' },
        { value: 'reminder', label: 'Payment Reminder' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Bulk SMS</h3>
                        <button
                            className="btn-header-back"
                            onClick={() => navigate('/power-master/bulksms/bulksms')}
                        >
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Group <span className="text-danger">*</span></label>
                                    <Select
                                        options={groupOptions}
                                        defaultValue={groupOptions[0]}
                                        placeholder="Customer Group"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Category <span className="text-danger">*</span></label>
                                    <Select
                                        options={categoryOptions}
                                        defaultValue={categoryOptions[0]}
                                        placeholder="All"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Sub Category <span className="text-danger">*</span></label>
                                    <Select
                                        options={subCategoryOptions}
                                        defaultValue={subCategoryOptions[0]}
                                        placeholder="All"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Customer <span className="text-danger">*</span></label>
                                    <Select
                                        options={customerOptions}
                                        defaultValue={customerOptions[0]}
                                        placeholder="All"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Template <span className="text-danger">*</span></label>
                                    <Select
                                        options={templateOptions}
                                        placeholder="Choose Template"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => navigate('/power-master/bulksms/bulksms')}
                                >
                                    Cancel
                                </button>
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

export default BulkSmsAdd;
