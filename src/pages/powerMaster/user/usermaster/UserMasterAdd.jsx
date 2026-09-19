import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const UserMasterAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/user/user-master');
    };

    const userGroupOptions = [
        { value: 'ACCOUNTS 2', label: 'ACCOUNTS 2' },
        { value: 'ACCOUNTS MANAGER', label: 'ACCOUNTS MANAGER' },
        { value: 'ADMIN', label: 'ADMIN' },
        { value: 'CASHIER', label: 'CASHIER' },
        { value: 'MARKETTING', label: 'MARKETTING' },
        { value: 'PROJECT INCHARGE', label: 'PROJECT INCHARGE' },
        { value: 'PROJECT MANAGER', label: 'PROJECT MANAGER' },
        { value: 'SALES ENGINEER', label: 'SALES ENGINEER' },
        { value: 'SERVICE ENGINEER', label: 'SERVICE ENGINEER' },
        { value: 'SERVICE MANAGER', label: 'SERVICE MANAGER' },
        { value: 'SHOWROOM MANAGER', label: 'SHOWROOM MANAGER' },
        { value: 'STORE INCHARGE', label: 'STORE INCHARGE' },
        { value: 'SUPER ADMIN', label: 'SUPER ADMIN' }
    ];

    const branchOptions = [
        { value: 'MAIN BRANCH', label: 'MAIN BRANCH' }
    ];

    const employeeOptions = [
        { value: 'C.RAJU', label: 'C.RAJU' },
        { value: 'CHANDRU', label: 'CHANDRU' },
        { value: 'Gokul Shree', label: 'Gokul Shree' },
        { value: 'RAMESH P', label: 'RAMESH P' }
    ];

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add User Master</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/user/user-master')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>User Group</label>
                                    <Select
                                        options={userGroupOptions}
                                        placeholder="Select User Group"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Branch</label>
                                    <Select
                                        options={branchOptions}
                                        placeholder="Select Branch"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Employee</label>
                                    <Select
                                        options={employeeOptions}
                                        placeholder="Select Employee"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>User Name</label>
                                    <input type="text" className="form-control" placeholder="Enter User Name" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Password</label>
                                    <input type="password" className="form-control" placeholder="Enter Password" />
                                </div>

                                <div className="col-12 col-md-3  form-group mb-3">
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/user/user-master')}>Cancel</button>
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

export default UserMasterAdd;
