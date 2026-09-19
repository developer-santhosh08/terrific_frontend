import { useLoader } from '../../../../context/LoaderContext';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const AreaMarketingEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = () => {
        navigate('/power-master/hr/area-marketing-person');
    };

    const staffOptions = [
        { value: 'c_raju', label: 'C.RAJU' },
        { value: 'm_kumar', label: 'M.KUMAR' },
        { value: 'r_priya', label: 'R.PRIYA' },
        { value: 's_raj', label: 'S.RAJ' },
    ];

    const areaOptions = [
        { value: 'chennai_north', label: 'Chennai North' },
        { value: 'chennai_south', label: 'Chennai South' },
        { value: 'coimbatore', label: 'Coimbatore' },
        { value: 'madurai', label: 'Madurai' },
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'under_process', label: 'Under Process' },
        { value: 'followup', label: 'Followup' },
        { value: 'converted', label: 'Converted' },
        { value: 'completed', label: 'Completed' },
        { value: 'invoiced', label: 'Invoiced' },
        { value: 'closed', label: 'Closed' },
        { value: 'inspection', label: 'Inspection' },
        { value: 'receive', label: 'Receive' },
        { value: 'site_visit', label: 'Site Visit' },
        { value: 'job_card', label: 'Job Card' },
        { value: 'invoice', label: 'Invoice' },
        { value: 'receipt', label: 'Receipt' },
        { value: 'dispatch', label: 'Dispatch' },
        { value: 'hold', label: 'Hold' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Area Marketing Person</h3>
                        <button
                            className="btn-header-back"
                            onClick={() => navigate('/power-master/hr/area-marketing-person')}
                        >
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Staff Name <span className="text-danger">*</span></label>
                                    <Select
                                        options={staffOptions}
                                        defaultValue={staffOptions[0]}
                                        placeholder="Choose Staff Name"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Area Name <span className="text-danger">*</span></label>
                                    <Select
                                        options={areaOptions}
                                        defaultValue={areaOptions[0]}
                                        placeholder="Choose Area"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        menuPosition="fixed"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>From</label>
                                    <input type="date" className="form-control" defaultValue="2026-01-01" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>To</label>
                                    <input type="date" className="form-control" defaultValue="2026-06-30" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        defaultValue={statusOptions[0]}
                                        placeholder="Select Status"
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
                                    onClick={() => navigate('/power-master/hr/area-marketing-person')}
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

export default AreaMarketingEdit;
