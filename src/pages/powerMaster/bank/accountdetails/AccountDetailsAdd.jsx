import { useLoader } from '../../../../context/LoaderContext';
﻿import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';

const AccountDetailsAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

    const [bank, setBank] = useState(null);
    const [bankOptions, setBankOptions] = useState([]);
    const [accountType, setAccountType] = useState({ value: 'current', label: 'Current' });
    const [holderName, setHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [openingBalance, setOpeningBalance] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [micrCode, setMicrCode] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [address, setAddress] = useState('');
    const [branch, setBranch] = useState('');
    const [city, setCity] = useState(null);
    const [status, setStatus] = useState({ value: 'Active', label: 'Active' });

    const [cityOptions, setCityOptions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                };
                const [banksRes, citiesRes] = await Promise.all([
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/dropdown/bank', { headers }),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/master/geolocation?type=city&state_id=30', { headers })
                ]);
                
                const banksJson = await banksRes.json();
                const citiesJson = await citiesRes.json();

                if (banksJson.status && banksJson.data) {
                    setBankOptions(banksJson.data.map(b => ({ value: b.id, label: b.name })));
                }
                if (citiesJson.status && citiesJson.data) {
                    setCityOptions(citiesJson.data.map(c => ({ value: c.id, label: c.name })));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        try {
            const payload = {
                bank_id: bank ? bank.value : 1,
                account_type: accountType ? accountType.value : '',
                account_number: accountNumber,
                holder_name: holderName,
                opening_balance: parseFloat(openingBalance) || 0,
                ifsc_code: ifscCode,
                micr_code: micrCode,
                address: address,
                branch: branch,
                branch_city: city ? city.value : 1,
                swift_code: swiftCode,
                status: status && status.value === 'Inactive' ? 2 : 1
            };
            const token = sessionStorage.getItem('erp_token');
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/account-detail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            navigate('/power-master/bank/account-details');
        } catch (err) {
            console.error("Error creating account details:", err);
        } finally {
            setShowSubmitPopup(false);
        }
    };

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
    ];

    const accountTypeOptions = [
        { value: 'current', label: 'Current' },
        { value: 'savings', label: 'Savings' }
    ];
    

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Create Account Details</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/bank/account-details')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Bank <span className="text-danger">*</span></label>
                                    <Select 
                                        options={bankOptions}
                                        value={bank}
                                        onChange={setBank}
                                        placeholder="Choose Bank Name"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                                
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Account Type</label>
                                    <Select 
                                        options={accountTypeOptions}
                                        value={accountType}
                                        onChange={setAccountType}
                                        placeholder="Account Type"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Account Holder Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Account Holder Name" value={holderName} onChange={e => setHolderName(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Account Number <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Opening Balance</label>
                                    <input type="text" className="form-control" placeholder="Opening Balance" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>IFSC Code</label>
                                    <input type="text" className="form-control" placeholder="IFSC Code" value={ifscCode} onChange={e => setIfscCode(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>MICR Code</label>
                                    <input type="text" className="form-control" placeholder="MICR Code" value={micrCode} onChange={e => setMicrCode(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>SWIFT Code</label>
                                    <input type="text" className="form-control" placeholder="SWIFT Code" value={swiftCode} onChange={e => setSwiftCode(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address</label>
                                    <input type="text" className="form-control" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Branch</label>
                                    <input type="text" className="form-control" placeholder="Branch" value={branch} onChange={e => setBranch(e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select 
                                        options={cityOptions}
                                        value={city}
                                        onChange={setCity}
                                        placeholder="Choose a City"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select 
                                        options={statusOptions}
                                        value={status}
                                        onChange={setStatus}
                                        placeholder="Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                    />
                                </div>
                            </div>

                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/bank/account-details')}>Cancel</button>
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

export default AccountDetailsAdd;
