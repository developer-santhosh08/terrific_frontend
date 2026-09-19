import { useLoader } from '../../../../context/LoaderContext';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const TransporterDetailsEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = () => {
        navigate('/power-master/transporter/transporter-details');
    };

    const transportModeOptions = [
        { value: 'road', label: 'Road' },
        { value: 'rail', label: 'Rail' },
        { value: 'air', label: 'Air' },
        { value: 'sea', label: 'Sea' },
    ];

    const cityOptions = [
        { value: 'thirupur', label: 'THIRUPUR' },
        { value: 'coimbatore', label: 'COIMBATORE' },
        { value: 'bangalore', label: 'BANGALORE' },
        { value: 'chennai', label: 'CHENNAI' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Transporter Details</h3>
                        <button
                            className="btn-header-back"
                            onClick={() => navigate('/power-master/transporter/transporter-details')}
                        >
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Transport Mode <span className="text-danger">*</span></label>
                                    <Select
                                        options={transportModeOptions}
                                        defaultValue={transportModeOptions[0]}
                                        placeholder="Choose Transport Mode"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Name"
                                        defaultValue="TERRIFIC LOGISTICS"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address 1</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Address 1"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address 2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Address 2"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address 3</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Address 3"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select
                                        options={cityOptions}
                                        defaultValue={cityOptions[0]}
                                        placeholder="Choose a City"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Phone Number1</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Phone Number1"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Phone Number2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Phone Number2"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Mobile Number1</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Mobile Number1"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Mobile Number2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Mobile Number2"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Contact Person</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Contact Person"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => navigate('/power-master/transporter/transporter-details')}
                                >
                                    Cancel
                                </button>
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

export default TransporterDetailsEdit;
