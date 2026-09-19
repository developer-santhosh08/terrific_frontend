import { useLoader } from '../../../../context/LoaderContext';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';

const SmsEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();
    const { id } = useParams();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = () => {
        navigate('/power-master/reminder/sms');
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit SMS</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/reminder/sms')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>SMS Description <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="SMS Description" defaultValue={id === '1' ? 'Welcome SMS' : 'Reminder SMS'} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Template <span className="text-danger">*</span></label>
                                    <textarea className="form-control" rows="1" placeholder="Template" defaultValue={id === '1' ? 'Welcome to our service...' : 'Your appointment is...'}></textarea>
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/reminder/sms')}>Cancel</button>
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

export default SmsEdit;
