import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';

const QuotationEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Quotation Edit (ID: {id})</h3>
                        <button className="btn-back" onClick={() => navigate('/quotation')}>
                            <CaretLeft weight="duotone" className="tw-w-4" /> Back
                        </button>
                    </div>
                    <div className="card-body">
                        {/* Similar form to QuotationAdd, potentially pre-populated */}
                        <form>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Customer Name <span className="text-danger">*</span></label>
                                    <select className="form-control">
                                        <option>Choose a customer..</option>
                                    </select>
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Billing Address1 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" defaultValue="Sample Address" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Billing Address2</label>
                                    <input type="text" className="form-control" defaultValue="Sample Area" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Pincode <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" defaultValue="123456" />
                                </div>
                            </div>
                            {/* ... Rest of the form same as Add ... */}

                            <div className="form-actions mt-3">
                                <button type="submit" className="btn-save">Update Quotation</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QuotationEdit;
