import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const StockLocationAdd = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/items/stock-location');
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    const cityOptions = [
        { value: 'BANGALORE', label: 'BANGALORE' },
        { value: 'ERODE', label: 'ERODE' }
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Stock Location</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/stock-location')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Stock Location Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Stock Location Name" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>damage</label>
                                    <Select 
                                        options={[
                                            { value: 'Yes', label: 'Yes' },
                                            { value: 'No', label: 'No' }
                                        ]}
                                        placeholder="Select"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address</label>
                                    <input type="text" className="form-control" placeholder="Address" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>City</label>
                                    <Select
                                        options={cityOptions}
                                        defaultValue={{ value: 'BANGALORE', label: 'BANGALORE' }}
                                        placeholder="City"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        defaultValue={{ value: 'Active', label: 'Active' }}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/items/stock-location')}>Cancel</button>
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

export default StockLocationAdd;
