import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { CaretLeft } from '@phosphor-icons/react';
import UpdatePopup from '../../components/Popup/UpdatePopup.jsx';
import WarningPopup from '../../components/Popup/WarningPopup.jsx';
import React from 'react';
import { useLoader } from '../../context/LoaderContext';

const ContraEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setLoading } = useLoader();

    const contraTypeOptions = [
        { value: 'Received', label: 'Received' },
        { value: 'Given', label: 'Given' },
    ];

    const [stateOptions, setStateOptions] = useState([]);

    const [cityOptions, setCityOptions] = useState([]);

    const rsStyles = {
        control: (provided) => ({ ...provided, background: '#fff', minHeight: '36px' }),
        menu: (provided) => ({ ...provided, zIndex: 9999 })
    };

    const [paymentModeOptions, setPaymentModeOptions] = useState([{ value: '', label: 'Select Mode' }]);

    const [amount, setAmount] = useState('');
    const [totalAmount, setTotalAmount] = useState('');


    // fetchDropdowns moved to combined initialization useEffect below


    const ordinalLabel = (n) => {
        const map = ['Zero', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
        if (n >= 1 && n < map.length) return `${map[n]} Payment`;
        const suffix = (k) => {
            const j = k % 10, k100 = k % 100;
            if (k100 >= 11 && k100 <= 13) return 'th';
            if (j === 1) return 'st';
            if (j === 2) return 'nd';
            if (j === 3) return 'rd';
            return 'th';
        };
        return `${n}${suffix(n)} Payment`;
    };

    const [payments, setPayments] = useState([
        { paymentType: ordinalLabel(1), date: new Date().toISOString().split('T')[0], mode: '', amount: '', remarks: '' }
    ]);

    const [name, setName] = useState(null);
    const [nameOptions, setNameOptions] = useState([]);
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [address3, setAddress3] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [interest, setInterest] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [contraType, setContraType] = useState(null);
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);

    React.useEffect(() => {
        const amt = parseFloat(amount) || 0;
        const int = parseFloat(interest) || 0;
        if (amount || interest) {
            setTotalAmount(amt + int);
        } else {
            setTotalAmount('');
        }
    }, [amount, interest]);


    React.useEffect(() => {
        if (state && stateOptions.length > 0 && String(state.value) === String(state.label)) {
            const matched = stateOptions.find(o => String(o.value) === String(state.value) || String(o.label) === String(state.label));
            if (matched) setState(matched);
        }
    }, [state, stateOptions]);

    React.useEffect(() => {
        if (city && cityOptions.length > 0 && String(city.value) === String(city.label)) {
            const matched = cityOptions.find(o => String(o.value) === String(city.value) || String(o.label) === String(city.label));
            if (matched) setCity(matched);
        }
    }, [city, cityOptions]);

    React.useEffect(() => {
        const fetchCities = async () => {
            if (!state || !state.value) {
                setCityOptions([]);
                return;
            }
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/city?state_id=${state.value}`, { headers });
                const json = await res.json();
                const extractData = (data) => Array.isArray(data) ? data : (data?.data || []);
                const opts = extractData(json).map(item => ({ value: item.id || item.name, label: item.name }));
                setCityOptions(opts);
            } catch (err) {
                console.error('Error fetching cities:', err);
            }
        };
        fetchCities();
    }, [state]);

    React.useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const resPayment = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/payment_mode`, { headers });
                const jsonPayment = await resPayment.json();
                const extractData = (data) => Array.isArray(data) ? data : (data?.data || []);
                const paymentOpts = extractData(jsonPayment).map(item => ({ value: item.id, label: item.name }));
                setPaymentModeOptions([{ value: '', label: 'Select Mode' }, ...paymentOpts]);

                const resState = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/geolocation?type=state&country_id=1`, { headers });
                const jsonState = await resState.json();
                const stateOpts = extractData(jsonState).map(item => ({ value: item.id || item.name, label: item.name }));
                setStateOptions(stateOpts);

                const resPersons = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contra/contra-persons`, { headers });
                const jsonPersons = await resPersons.json();
                const personsOpts = extractData(jsonPersons).map(item => ({ value: item.id, label: item.name, data: item }));
                setNameOptions(personsOpts);

                if (id) {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/contra/contra/${id}`, { headers });
                    const result = await response.json();
                    if (result.status === 'success' && result.data) {
                        const data = result.data;
                        const matchedPerson = personsOpts.find(p => p.label === data.name);
                        setName(matchedPerson || (data.name ? { value: data.contra_person_id, label: data.name } : null));
                        setMobile(data.mobile_number || '');
                        setEmail(data.email || '');
                        setAddress1(data.address_line1 || '');
                        setAddress2(data.address_line2 || '');
                        setAddress3(data.address_line3 || '');
                        setPinCode(data.pin_code || '');
                        setInterest(data.contra_intrest || '');
                        setDate(data.contra_date || '');
                        setAmount(data.contra_amount || '');
                        if (data.contra_type) setContraType(contraTypeOptions.find(o => String(o.value) === String(data.contra_type)) || null);
                        if (data.state) setState({ value: data.state, label: data.state });
                        if (data.city) setCity({ value: data.city, label: data.city });

                        if (data.payments && data.payments.length > 0) {
                            setPayments(data.payments.map((p, idx) => ({
                                paymentType: p.paymentType || ordinalLabel(idx + 1),
                                date: p.receipt_date || p.date || '',
                                mode: p.payment_mode || p.receipt_mode || p.mode || '',
                                amount: p.amount_paid || p.receipt_amount || p.amount || '',
                                remarks: p.document_number || p.remarks || ''
                            })));
                        }
                    }
                }
            } catch (err) {
                console.error("Initialization error:", err);
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [id]);

    const updatePayment = (index, field, value) => {
        const next = [...payments];
        next[index][field] = value;
        setPayments(next);
    };

    const addPaymentRow = () => {
        const nextIndex = payments.length + 1;
        setPayments([...payments, { paymentType: ordinalLabel(nextIndex), date: new Date().toISOString().split('T')[0], mode: '', amount: '', remarks: '' }]);
    };

    const deletePaymentRow = (index) => {
        if (payments.length <= 1) return;
        setPayments(payments.filter((_, i) => i !== index));
    };

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [showWarningPopup, setShowWarningPopup] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const requiredFields = [];
        if (!contraType) requiredFields.push("Contra Type");
        if (!name) requiredFields.push("Name");
        if (!mobile) requiredFields.push("Mobile Number");
        if (!date) requiredFields.push("Date");
        if (!address1) requiredFields.push("Address Line 1");
        if (!state) requiredFields.push("State");
        if (!city) requiredFields.push("City");
        if (!amount) requiredFields.push("Amount");

        if (requiredFields.length > 0) {
            setWarningMessage(`Please fill the following required fields:\n${requiredFields.join(', ')}`);
            setShowWarningPopup(true);
            return;
        }

        const totalPayment = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const currentTotalAmount = parseFloat(totalAmount) || 0;
        
        if (totalPayment > currentTotalAmount) {
            setWarningMessage(`The total payment amount (${totalPayment}) cannot exceed the Total Amount (${currentTotalAmount}).`);
            setShowWarningPopup(true);
            return;
        }

        setShowUpdatePopup(true);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmUpdate = async () => {
        setIsSubmitting(true);
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            if (name && name.value) {
                try {
                    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contra/sync-person-master/${name.value}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({
                            email,
                            mobile_number: mobile,
                            address_line1: address1,
                            address_line2: address2,
                            address_line3: address3,
                            state: state ? state.label : '',
                            city: city ? city.label : '',
                            pin_code: pinCode
                        })
                    });
                } catch (err) {
                    console.error('Failed to sync master', err);
                }
            }

            const payload = {
                contra_type: contraType ? contraType.value : '',
                contra_person_id: name ? name.value : '',
                name: name ? name.label : '',
                mobile_number: mobile,
                contra_date: date,
                email,
                address_line1: address1,
                address_line2: address2,
                address_line3: address3,
                state: state ? state.value : '',
                city: city ? city.value : '',
                pin_code: pinCode,
                contra_intrest: interest,
                contra_amount: amount,
                payments: payments.map(p => ({
                    receipt_date: p.date,
                    amount_paid: p.amount,
                    payment_mode: p.mode,
                    document_number: p.remarks,
                    paymentType: p.paymentType
                }))
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contra/contra/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                navigate('/contra');
            } else {
                console.error('Failed to update contra', data);
                setShowUpdatePopup(false);
            }
        } catch (err) {
            console.error('Error updating contra', err);
            setShowUpdatePopup(false);
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };


    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Contra</h3>
                        <button className="btn-header-back" onClick={() => navigate('/contra')}>Back</button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Contra Type <span className="text-danger">*</span></label>
                                    <Select options={contraTypeOptions} styles={rsStyles} placeholder="Select Contra Type" value={contraType} onChange={setContraType} />
                                </div>

                                <div className="col-md-3 form-group">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <Select options={nameOptions} styles={rsStyles} placeholder="Select Name" value={name} onChange={(selectedOption) => {
                                        setName(selectedOption);
                                        if (selectedOption && selectedOption.data) {
                                            const person = selectedOption.data;
                                            setMobile(person.mobile_number || '');
                                            setEmail(person.email || '');
                                            setAddress1(person.address_line1 || '');
                                            setAddress2(person.address_line2 || '');
                                            setAddress3(person.address_line3 || '');
                                            setPinCode(person.pin_code || '');
                                            
                                            if (person.state) {
                                                const matchedState = stateOptions.find(s => String(s.value) === String(person.state) || String(s.label).toLowerCase() === String(person.state).toLowerCase());
                                                if (matchedState) setState(matchedState);
                                                else setState({ label: person.state, value: person.state });
                                            } else {
                                                setState(null);
                                            }
                                            if (person.city) {
                                                setCity({ label: person.city, value: person.city });
                                            } else {
                                                setCity(null);
                                            }
                                        } else if (!selectedOption) {
                                            setMobile('');
                                            setEmail('');
                                            setAddress1('');
                                            setAddress2('');
                                            setAddress3('');
                                            setPinCode('');
                                            setState(null);
                                            setCity(null);
                                        }
                                    }} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Mobile Number<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="row">

                                <div className="col-md-3 form-group">
                                    <label>Email</label>
                                    <input type="email" className="form-control" placeholder="Contra Person Email" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>

                                <div className="col-md-3 form-group">
                                    <label>Address Line 1<span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Address Line 1" value={address1} onChange={e => setAddress1(e.target.value)} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Address Line 2</label>
                                    <input type="text" className="form-control" placeholder="Address Line 2" value={address2} onChange={e => setAddress2(e.target.value)} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Address Line 3</label>
                                    <input type="text" className="form-control" placeholder="Address Line 3" value={address3} onChange={e => setAddress3(e.target.value)} />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>State <span className="text-danger">*</span></label>
                                    <Select options={stateOptions} styles={rsStyles} placeholder="Select State" value={state} onChange={setState} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select options={cityOptions} styles={rsStyles} placeholder="Select City" value={city} onChange={setCity} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Pin Code</label>
                                    <input type="text" className="form-control" placeholder="Pin Code" value={pinCode} onChange={e => setPinCode(e.target.value)} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Interest (Amount)</label>
                                    <input type="number" className="form-control" placeholder="Amount" value={interest} onChange={e => setInterest(e.target.value)} />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Amount<span className="text-danger">*</span></label>
                                    <input type="number" className="form-control" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Total Amount</label>
                                    <input type="number" className="form-control" readOnly placeholder="Total Amount" value={totalAmount || ''} />
                                </div>
                            </div>
                            <div className="tw-mt-4">
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table table-bordered tw-w-full">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Payment Type</th>
                                                <th>Date</th>
                                                <th>Payment Mode</th>
                                                <th>Amount</th>
                                                <th>Remarks</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td style={{ minWidth: 200 }}>
                                                        <input value={row.paymentType} onChange={(e) => updatePayment(idx, 'paymentType', e.target.value)} readOnly className="form-control" />
                                                    </td>
                                                    <td style={{ width: 160 }}>
                                                        <input type="date" value={row.date} onChange={(e) => updatePayment(idx, 'date', e.target.value)} className="form-control" />
                                                    </td>
                                                    <td style={{ width: 160 }}>
                                                        <div style={{ minWidth: 160 }}>
                                                            <Select
                                                                options={paymentModeOptions}
                                                                styles={{ ...rsStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                                value={paymentModeOptions.find(o => o.value === row.mode) || paymentModeOptions[0]}
                                                                onChange={(opt) => updatePayment(idx, 'mode', opt ? opt.value : '')}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td style={{ width: 140 }}>
                                                        <input type="number" value={row.amount} onChange={(e) => updatePayment(idx, 'amount', e.target.value)} className="form-control" />
                                                    </td>
                                                    <td style={{ width: 220 }}>
                                                        <input value={row.remarks} onChange={(e) => updatePayment(idx, 'remarks', e.target.value)} className="form-control" />
                                                    </td>
                                                    <td style={{ width: 120 }}>
                                                        <div className="tw-flex tw-gap-2">
                                                            <button type="button" className="table-add" onClick={addPaymentRow}><i className="bi bi-plus-lg" /></button>
                                                            <button type="button" className="table-delete" onClick={() => deletePaymentRow(idx)}><i className="bi bi-trash" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {(() => {
                                const totalPayment = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
                                const currentTotalAmount = parseFloat(totalAmount) || 0;
                                const isExceeded = totalPayment > currentTotalAmount;
                                return (
                                    <div className="tw-mt-2 tw-flex tw-justify-end tw-items-center">
                                        <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                                            Total Payments: <span style={{ color: isExceeded ? '#ef4444' : '#22c55e' }}>{totalPayment}</span> / {currentTotalAmount}
                                        </div>
                                        {isExceeded && (
                                            <div className="tw-ml-4 tw-text-red-500 tw-text-sm tw-font-semibold">
                                                Payments exceed the Total Amount!
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="form-actions mt-3 d-flex justify-content-between">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/contra')}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) > (parseFloat(totalAmount) || 0)}>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />
            <WarningPopup isOpen={showWarningPopup} onClose={() => setShowWarningPopup(false)} message={warningMessage} />
        </section>
    );
};

export default ContraEdit;
