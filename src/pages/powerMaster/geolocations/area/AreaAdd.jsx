import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const AreaAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Area created successfully!`);
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/geolocations/area');
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    const cityOptions = [
        { value: 'THIRUVANNAMALAI', label: 'THIRUVANNAMALAI' },
        { value: 'DINDUKKAL', label: 'DINDUKKAL' },
        { value: 'KANNUR', label: 'KANNUR' },
        { value: 'Pondicherry', label: 'Pondicherry' },
        { value: 'HOSUR', label: 'HOSUR' },
        { value: 'BANGALORE', label: 'BANGALORE' },
        { value: 'VELLORE', label: 'VELLORE' },
        { value: 'RAMANATHAPURAM', label: 'RAMANATHAPURAM' }
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Area</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/geolocations/area')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group">
                                    <label>City Name <span className="text-danger">*</span></label>
                                    <Select 
                                        options={cityOptions}
                                        placeholder="Select City"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group">
                                    <label>Area Name <span className="text-danger">*</span></label>
                                    <Select 
                                        options={[
                                            { value: 'Main Street', label: 'Main Street' },
                                            { value: 'Indiranagar', label: 'Indiranagar' }
                                        ]}
                                        placeholder="Select Area"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group">
                                    <label>Pincode <span className="text-danger">*</span></label>
                                    <Select 
                                        options={[
                                            { value: '606601', label: '606601' },
                                            { value: '560038', label: '560038' }
                                        ]}
                                        placeholder="Select Pincode"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group">
                                    <label>Status</label>
                                    <Select 
                                        options={statusOptions}
                                        defaultValue={{ value: 'Active', label: 'Active' }}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/geolocations/area')}>Cancel</button>
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
export default AreaAdd;
