import { useLoader } from '../../../../context/LoaderContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserRightEdit = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Edit User Right</h3>
                    </div>
                    <div className="card-body">
                        <p>This module is currently under construction.</p>
                        <button className="btn btn-secondary" onClick={() => navigate('/power-master/user/user-right')}>
                            Back to List
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UserRightEdit;
