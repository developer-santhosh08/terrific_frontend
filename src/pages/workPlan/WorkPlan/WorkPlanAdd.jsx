import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import SubmitPopup from '../../../components/Popup/SubmitPopup.jsx';
import SimpleCustomerPopup from '../../../components/Popup/SimpleCustomerPopup.jsx';
import ReferredCustomerPopup from '../../../components/Popup/ReferredCustomerPopup.jsx';
import { useLoader } from '../../../context/LoaderContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
const statusOptions = [
    { value: 1, label: 'Infollowup' },
    { value: 2, label: 'Completed' },
    { value: 5, label: 'Pending' }
];

const WorkPlanAdd = () => {
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const [engineerOptions, setEngineerOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);

    const [formData, setFormData] = useState({
        work_name: '',
        created_date: new Date().toISOString().split('T')[0],
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
    const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);

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

                const [engRes, cityRes, custRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/salescontact/engineers`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/geolocation?type=city`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/customer`, { headers }).catch(() => null)
                ]);

                if (engRes) {
                    const json = await engRes.json().catch(() => ({}));
                    const data = Array.isArray(json) ? json : (json?.data || []);
                    setEngineerOptions(data.map(item => ({
                        value: item.id || item.name || item.engineer_name || item.employee_name,
                        label: item.name || item.engineer_name || item.employee_name || item.id
                    })));
                }

                if (cityRes) {
                    const json = await cityRes.json().catch(() => ({}));
                    const data = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
                    setCityOptions(data.map(item => ({
                        value: item.id || item.name || item.city_name,
                        label: item.name || item.city_name || item.id
                    })));
                }

                if (custRes) {
                    const json = await custRes.json().catch(() => ({}));
                    const data = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
                    const uniqueCustomers = Array.from(new Map(data.map(c => [(c.name || '').trim().toUpperCase(), c])).values());
                    setCustomerOptions(uniqueCustomers.map(item => ({
                        value: item.id || item.customer_id || item.name,
                        label: item.name || item.customer_name || item.id
                    })));
                }

            } catch (err) {
                console.error("Error setup fetching:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
        setShowSubmitPopup(true);
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
                referred_by: selectedReferrer ? selectedReferrer.label : '',
                contact_status: selectedStatus ? selectedStatus.value : 1
            };

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/workplan/work-plans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                navigate('/work-plan');
            } else {
                console.error('Failed to save sales contact:', data);
                alert(data.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving.');
        } finally {
            setIsSubmitting(false);
            setShowSubmitPopup(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between sm:tw-items-center tw-gap-3">
                        <h3 className="card-title max-[350px]:tw-text-center max-[350px]:tw-whitespace-nowrap max-[350px]:tw-text-lg">Add Work Plan</h3>
                        <button type="button" className="btn-header-back" onClick={() => navigate('/work-plan')}>
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
                            <div className="card-footer tw-flex max-[350px]:tw-flex-col tw-justify-between tw-mt-4 gap-3">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/work-plan')} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SimpleCustomerPopup isOpen={showCustomerPopup} onClose={() => setShowCustomerPopup(false)} onSubmit={handleNewCustomerCreated} initialName={newCustomerName} />
            <SimpleCustomerPopup isOpen={showReferredPopup} onClose={() => setShowReferredPopup(false)} onSubmit={handleNewReferredCustomerCreated} initialName={newReferredName} />
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
    );
};

export default WorkPlanAdd;
