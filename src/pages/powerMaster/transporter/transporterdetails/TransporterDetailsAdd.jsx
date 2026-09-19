import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const TransporterDetailsAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
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
                        <h3 className="card-title">Add Transporter Details</h3>
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

export default TransporterDetailsAdd;
