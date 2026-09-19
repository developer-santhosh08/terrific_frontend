import { useLoader } from '../../../../context/LoaderContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const MenuListAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = () => {
        navigate('/power-master/user/menu-list');
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
                        <h3 className="card-title">Add Menu List</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/user/menu-list')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Menu Name</label>
                                    <input type="text" className="form-control" placeholder="Enter Menu Name" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Session Number</label>
                                    <input type="text" className="form-control" placeholder="Enter Session Number" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
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
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/user/menu-list')}>Cancel</button>
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

export default MenuListAdd;
