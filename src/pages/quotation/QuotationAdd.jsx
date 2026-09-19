import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';

const QuotationAdd = () => {
    const navigate = useNavigate();

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Quotation Add</h3>
                        <button className="btn-back" onClick={() => navigate('/quotation')}>
                            <CaretLeft weight="duotone" className="tw-w-4" /> Back
                        </button>
                    </div>
                    <div className="card-body">
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
                                    <input type="text" className="form-control" placeholder="Door No / Apartment" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Billing Address2</label>
                                    <input type="text" className="form-control" placeholder="Street / Area" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Pincode <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Pincode" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>City <span className="text-danger">*</span></label>
                                    <select className="form-control">
                                        <option>Choose a City..</option>
                                    </select>
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Employee Name</label>
                                    <select className="form-control">
                                        <option>Select Employee</option>
                                    </select>
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>GST Number <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="GST Number" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Mobile Number1 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Mobile Number 1" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Mobile Number2</label>
                                    <input type="text" className="form-control" placeholder="Mobile Number 2" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Site Location <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <input type="text" className="form-control" placeholder="Site Location" />
                                        <div className="input-group-append">
                                            <button className="btn-create" type="button">Get Location</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" defaultValue="2026-02-21" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Committed Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" defaultValue="2026-02-28" />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Terms and Conditions <span className="text-danger">*</span></label>
                                    <select className="form-control">
                                        <option>Select Terms and Conditions</option>
                                    </select>
                                </div>
                            </div>

                            <hr />
                            <h5>Product Details</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Width (mm)</th>
                                            <th>Height (mm)</th>
                                            <th>Width (feet)</th>
                                            <th>Height (feet)</th>
                                            <th>Sq. Ft</th>
                                            <th>Rate</th>
                                            <th>Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Dynamic rows would go here */}
                                    </tbody>
                                </table>
                            </div>

                            <div className="form-actions mt-3">
                                <button type="submit" className="btn-save">Save Quotation</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QuotationAdd;
