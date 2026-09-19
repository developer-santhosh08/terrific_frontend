import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import UpdatePopup from '../../../components/Popup/UpdatePopup.jsx';
import SimpleCustomerPopup from '../../../components/Popup/SimpleCustomerPopup.jsx';
import { useLoader } from '../../../context/LoaderContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
const statusOptions = [
    { value: 1, label: 'Infollowup' },
    { value: 2, label: 'Completed' },
    { value: 5, label: 'Pending' }
];

const WorkPlanEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const returnUrl = location.state?.from || '/work-plans';
    const { setLoading } = useLoader();

    const [engineerOptions, setEngineerOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);

    const [formData, setFormData] = useState({
        work_name: '',
        created_date: '',
        customer_name: '',
        mobile_number1: '',
        mobile_number2: '',
        address: '',
        next_followup: '',
        remarks: '',
        referred_by: ''
    });

    const [selectedEngineer, setSelectedEngineer] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedReferrer, setSelectedReferrer] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const [showCustomerPopup, setShowCustomerPopup] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newReferredName, setNewReferredName] = useState('');
    const [showReferredPopup, setShowReferredPopup] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                // Fetch options
                const [engRes, cityRes, custRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/salescontact/engineers`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/geolocation?type=city`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/customer`, { headers }).catch(() => null)
                ]);

                let fetchedEngineers = [];
                let fetchedCities = [];
                let fetchedCustomers = [];

                if (engRes) {
                    const json = await engRes.json().catch(() => null);
                    const data = Array.isArray(json) ? json : (json?.data || []);
                    fetchedEngineers = data.map(e => ({ value: e.id, label: e.name || e.engineer_name || e.employee_name }));
                    setEngineerOptions(fetchedEngineers);
                }

                if (cityRes) {
                    const json = await cityRes.json().catch(() => null);
                    const data = Array.isArray(json) ? json : (json?.data || []);
                    fetchedCities = data.map(c => ({ value: c.id, label: c.city_name || c.city || c.name }));
                    setCityOptions(fetchedCities);
                }

                if (custRes) {
                    const json = await custRes.json().catch(() => null);
                    const data = Array.isArray(json) ? json : (json?.data || []);
                    const uniqueCustomers = Array.from(new Map(data.map(c => [(c.name || '').trim().toUpperCase(), c])).values());
                    fetchedCustomers = uniqueCustomers.map(item => ({
                        value: item.id || item.customer_id || item.name,
                        label: item.name || item.customer_name || item.id
                    }));
                    setCustomerOptions(fetchedCustomers);
                }

                // Fetch record data
                const recordRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workplan/work-plans/${id}`, { headers });
                const recordJson = await recordRes.json();

                if (recordJson && recordJson.data) {
                    const c = recordJson.data;
                    setFormData({
                        work_name: c.work_name || '',
                        created_date: c.created_date || c.date || c.created_at || '',
                        mobile_number1: c.mobile_number1 || c.mobile || '',
                        mobile_number2: c.mobile_number2 || c.mobile2 || '',
                        address: c.address || c.billing_address1 || c.address_line1 || c.billing_address || '',
                        next_followup: c.next_followup || c.next_follow_date || c.next_followup_date || c.next_date || '',
                        remarks: c.remarks || c.remark || c.description || '',
                    });

                    const allottedToId = c.allotted_to || c.allottedTo || c.engineer_id;
                    const allottedToName = c.employee_name || c.allotted_to_name;
                    
                    let eng = null;
                    if (allottedToId) {
                        eng = fetchedEngineers.find(e => String(e.value) === String(allottedToId));
                    }
                    if (!eng && allottedToName) {
                        eng = fetchedEngineers.find(e => String(e.label).toLowerCase() === String(allottedToName).toLowerCase());
                    }

                    if (eng) {
                        setSelectedEngineer(eng);
                    } else if (allottedToId || allottedToName) {
                        setSelectedEngineer({ 
                            value: allottedToId || allottedToName, 
                            label: allottedToName || allottedToId 
                        });
                    }

                    const cityVal = c.city || c.city_id || c.city_name;
                    if (cityVal) {
                        const cit = fetchedCities.find(e => String(e.value) === String(cityVal) || String(e.label).toLowerCase() === String(cityVal).toLowerCase());
                        if (cit) setSelectedCity(cit);
                    }

                    const custVal = c.customer_name || c.customer || c.customer_id;
                    if (custVal) {
                        const cust = fetchedCustomers.find(e => String(e.label).toLowerCase() === String(custVal).toLowerCase() || String(e.value) === String(custVal));
                        if (cust) setSelectedCustomer(cust);
                        else setSelectedCustomer({ value: custVal, label: custVal });
                    }

                    const refVal = c.referred_by || c.referredBy || c.referrer;
                    if (refVal) {
                        const ref = fetchedCustomers.find(e => String(e.label).toLowerCase() === String(refVal).toLowerCase() || String(e.value) === String(refVal));
                        if (ref) setSelectedReferrer(ref);
                        else setSelectedReferrer({ value: refVal, label: refVal });
                    }

                    const statusVal = c.contact_status || c.status || c.current_stage || c.currentStage;
                    if (statusVal) {
                        const st = statusOptions.find(e => String(e.value).toLowerCase().replace(/\s/g, '') === String(statusVal).toLowerCase().replace(/\s/g, ''));
                        if (st) setSelectedStatus(st);
                        else setSelectedStatus({ value: statusVal, label: statusVal });
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date, fieldName) => {
        if (!date) {
            setFormData(prev => ({ ...prev, [fieldName]: '' }));
            return;
        }
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        setFormData(prev => ({ ...prev, [fieldName]: offsetDate.toISOString().split('T')[0] }));
    };

    const handleCustomerChange = async (selectedOption) => {
        setSelectedCustomer(selectedOption);
        if (!selectedOption) return;

        if (selectedOption.__isNew__) {
            setFormData(prev => ({
                ...prev,
                mobile_number1: '',
                mobile_number2: '',
                address: ''
            }));
            setSelectedCity(null);
            return;
        }


        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/customers/${selectedOption.value}`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            const json = await res.json();
            if (json.status === 'success' && json.data) {
                const c = json.data;
                const matchedCity = cityOptions.find(opt => opt.value === c.city_id || opt.value === c.city);
                setFormData(prev => ({
                    ...prev,
                    mobile_number1: c.mobile_number1 || c.mobile || '',
                    mobile_number2: c.mobile_number2 || '',
                    address: c.billing_address1 || c.address_line1 || c.address || ''
                }));
                if (matchedCity) {
                    setSelectedCity(matchedCity);
                }
            }
        } catch (err) {
            console.error('Error fetching customer details:', err);
        }
    };

    const handleNewCustomerCreated = (newCustomerName) => {
        if (!newCustomerName) return;
        const newOption = { value: newCustomerName, label: newCustomerName, __isNew__: true };
        
        setCustomerOptions(prev => {
            if (!prev.some(opt => opt.label.toLowerCase() === newOption.label.toLowerCase())) {
                return [...prev, newOption];
            }
            return prev;
        });

        setFormData(prev => ({
            ...prev,
            mobile_number1: '',
            mobile_number2: '',
            address: ''
        }));
        setSelectedCity(null);
        setSelectedCustomer(newOption);
    };

    const handleNewReferredCustomerCreated = (newCustomerName) => {
        if (!newCustomerName) return;
        const newOption = { value: newCustomerName, label: newCustomerName, __isNew__: true };
        setCustomerOptions(prev => {
            if (!prev.some(opt => opt.label.toLowerCase() === newOption.label.toLowerCase())) {
                return [...prev, newOption];
            }
            return prev;
        });
        setSelectedReferrer(newOption);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowUpdatePopup(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            
            if (selectedCustomer && selectedCustomer.__isNew__) {
                try {
                    const customerPayload = {
                        name: selectedCustomer.label,
                        mobile_number1: formData.mobile_number1 || '',
                        address1: formData.address || '',
                        city_id: selectedCity ? selectedCity.value : 0,
                        customer_group_id: 1,
                        customer_category_id: 1,
                        customer_sub_category_id: 1
                    };
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/customer-create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(customerPayload)
                    });
                    const data = await res.json();
                    if (data.status === 'success' && data.data) {
                        selectedCustomer.value = data.data.id;
                    }
                } catch (e) {
                    console.error("Failed to auto-create customer", e);
                }
            }

            const payload = {
                work_name: formData.work_name,
                created_date: formData.created_date,
                customer_name: formData.work_name,
                mobile_number1: formData.mobile_number1 || '0000000000',
                mobile_number2: '',
                address: '',
                city: 1,
                next_followup: formData.next_followup,
                allottedTo: selectedEngineer ? selectedEngineer.value : null,
                remarks: formData.remarks,
                referred_by: '',
                contact_status: selectedStatus ? selectedStatus.value : 1
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workplan/work-plans/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                navigate(returnUrl);
            } else {
                console.error('Failed to update sales contact:', data);
                alert(data.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving.');
        } finally {
            setIsSubmitting(false);
            setShowUpdatePopup(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between sm:tw-items-center tw-gap-3">
                        <h3 className="card-title max-[350px]:tw-text-center max-[350px]:tw-whitespace-nowrap max-[350px]:tw-text-lg">Edit WorkPlan</h3>
                        <button className="btn-header-back" onClick={() => navigate('/work-plan')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Work Name <span className="text-danger">*</span></label>
                                    <input type="text" name="work_name" value={formData.work_name} onChange={handleInputChange} className="form-control" placeholder="Work Name" required />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Engineer Name<span className="text-danger">*</span></label>
                                    <Select
                                        options={engineerOptions}
                                        placeholder="Choose a Person"
                                        value={selectedEngineer}
                                        onChange={setSelectedEngineer}
                                        required
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Mobile Number</label>
                                    <input type="text" name="mobile_number1" value={formData.mobile_number1} onChange={handleInputChange} className="form-control" placeholder="Mobile Number" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Next Followup Date <span className="text-danger">*</span></label>
                                    <DatePicker
                                        selected={formData.next_followup ? new Date(formData.next_followup + 'T00:00:00') : null}
                                        onChange={(date) => handleDateChange(date, 'next_followup')}
                                        className="form-control"
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select Date"
                                        popperPlacement="bottom-start"
                                        popperProps={{ strategy: 'fixed' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Date <span className="text-danger">*</span></label>
                                    <DatePicker
                                        selected={formData.created_date ? new Date(formData.created_date + 'T00:00:00') : null}
                                        onChange={(date) => handleDateChange(date, 'created_date')}
                                        className="form-control"
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select Date"
                                        popperPlacement="bottom-start"
                                        popperProps={{ strategy: 'fixed' }}
                                        required
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Remark</label>
                                    <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} className="form-control" placeholder="remark" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Status</label>
                                    <Select
                                        options={statusOptions}
                                        placeholder="Select Status"
                                        value={selectedStatus}
                                        onChange={setSelectedStatus}
                                        isClearable
                                    />
                                </div>
                            </div>
                            <div className="form-actions mt-3 tw-flex max-[350px]:tw-flex-col tw-justify-between gap-3">
                                <button type="button" className="btn-cancel" onClick={() => navigate(returnUrl)} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={isSubmitting}>
                                    {isSubmitting ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SimpleCustomerPopup isOpen={showCustomerPopup} onClose={() => setShowCustomerPopup(false)} onSubmit={handleNewCustomerCreated} initialName={newCustomerName} />
            <SimpleCustomerPopup isOpen={showReferredPopup} onClose={() => setShowReferredPopup(false)} onSubmit={handleNewReferredCustomerCreated} initialName={newReferredName} />
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
    );
};

export default WorkPlanEdit;
