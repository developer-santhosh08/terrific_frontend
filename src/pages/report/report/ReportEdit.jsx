import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';

const ReportEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Report (ID: {id})</h3>
                        <button className="btn-back" onClick={() => navigate('/report')}>
                            <CaretLeft weight="duotone" className="tw-w-4" /> Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="row">
                                <div className="col-md-6 form-group">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Enter name" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Status</label>
                                    <select className="form-control">
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions mt-3 tw-flex tw-gap-2">
                                <button type="submit" className="btn-save">Update Report</button>
                                <button type="button" className="btn-back" onClick={() => navigate('/report')}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReportEdit;
