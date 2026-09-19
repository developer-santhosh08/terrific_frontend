import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const UserGroupAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [userGroupName, setUserGroupName] = useState('');
    const [errors, setErrors] = useState({});
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!userGroupName.trim()) newErrors.userGroupName = 'The user group name field is required.';
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/user/user-group');
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
                        <h3 className="card-title">Add User Group</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/user/user-group')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group">
                                    <label>User Group Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter User Group Name"
                                        value={userGroupName}
                                        onChange={(e) => { setUserGroupName(e.target.value); if (errors.userGroupName) setErrors(p => ({ ...p, userGroupName: '' })); }}
                                        style={errors.userGroupName ? { borderColor: '#dc3545', boxShadow: '0 0 0 0.2rem rgba(220,53,69,.25)' } : {}}
                                    />
                                    {errors.userGroupName && <span className="text-danger" style={{ fontSize: '0.8rem' }}>The user group name field is required.</span>}
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/user/user-group')}>Cancel</button>
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
export default UserGroupAdd;
