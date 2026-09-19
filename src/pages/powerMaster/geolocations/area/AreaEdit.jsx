import { useLoader } from '../../../../context/LoaderContext';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const AreaEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = () => {
        console.log(`Area ${id} updated successfully!`);
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
                        <h3 className="card-title">Edit Area</h3>
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
                                        defaultValue={{ value: 'THIRUVANNAMALAI', label: 'THIRUVANNAMALAI' }}
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
                                        defaultValue={{ value: 'Main Street', label: 'Main Street' }}
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
                                        defaultValue={{ value: '606601', label: '606601' }}
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
export default AreaEdit;
