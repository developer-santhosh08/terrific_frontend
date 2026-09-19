import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const StockLocationEdit = () => {
    const { loading, setLoading } = useLoader();
    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = () => {
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
                        <h3 className="card-title">Edit Stock Location</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/items/stock-location')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Stock Location Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" defaultValue={id === '1' ? 'Terrific' : 'Terrific 2'} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>damage</label>
                                    <Select 
                                        options={[
                                            { value: 'Yes', label: 'Yes' },
                                            { value: 'No', label: 'No' }
                                        ]}
                                        defaultValue={{ value: id === '2' ? 'Yes' : 'No', label: id === '2' ? 'Yes' : 'No' }}
                                        placeholder="Select"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address</label>
                                    <input type="text" className="form-control" defaultValue={id === '1' ? 'sample' : 'sample 2'} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>City</label>
                                    <Select
                                        options={cityOptions}
                                        defaultValue={{ value: id === '1' ? 'ERODE' : 'BANGALORE', label: id === '1' ? 'ERODE' : 'BANGALORE' }}
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

export default StockLocationEdit;
