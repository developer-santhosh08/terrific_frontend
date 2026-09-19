import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const DistrictAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`District created successfully!`);
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/geolocations/district');
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    const stateOptions = [
        { value: 'TAMIL NADU', label: 'TAMIL NADU' },
        { value: 'KERALA', label: 'KERALA' },
        { value: 'GUJARAT', label: 'GUJARAT' },
        { value: 'PONDICHERRY', label: 'PONDICHERRY' },
        { value: 'KARNATAKA', label: 'KARNATAKA' }
    ];

    const districtOptions = [
        { value: 'THIRUVANNAMALAI', label: 'THIRUVANNAMALAI' },
        { value: 'THENI', label: 'THENI' },
        { value: 'KANNUR', label: 'KANNUR' },
        { value: 'ALUVA', label: 'ALUVA' },
        { value: 'AHMEDABAD', label: 'AHMEDABAD' },
        { value: 'PONDICHERRY', label: 'PONDICHERRY' },
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
                        <h3 className="card-title">Add District</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/geolocations/district')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group">
                                    <label>State Name <span className="text-danger">*</span></label>
                                    <Select 
                                        options={stateOptions}
                                        placeholder="Select State"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group">
                                    <label>District Name <span className="text-danger">*</span></label>
                                    <Select 
                                        options={districtOptions}
                                        placeholder="Select District"
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/geolocations/district')}>Cancel</button>
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
export default DistrictAdd;
