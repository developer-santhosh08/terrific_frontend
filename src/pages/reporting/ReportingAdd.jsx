import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import CustomerPopup from '../../components/Popup/CustomerPopup';
import ReferredCustomerPopup from '../../components/Popup/ReferredCustomerPopup';
import CustomerHistoryPopup from '../../components/Popup/CustomerHistoryPopup';
import SubmitPopup from '../../components/Popup/SubmitPopup';
import { useLoader } from '../../context/LoaderContext';



const ReportingAdd = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Customer Profile');
    const [showCustomerPopup, setShowCustomerPopup] = useState(false);
    const [showReferredPopup, setShowReferredPopup] = useState(false);
    const [showCustomerHistoryPopup, setShowCustomerHistoryPopup] = useState(false);
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const { setLoading } = useLoader();
    
    const [engineerOpts, setEngineerOpts] = useState([]);
    const [customerOpts, setCustomerOpts] = useState([]);
    const [cityOpts, setCityOpts] = useState([]);
    const [verticalOptions, setVerticalOptions] = useState([]);

    const [formData, setFormData] = useState({
        customer_id: null,
        billing_address1: '',
        billing_address2: '',
        billing_address3: '',
        pincode: '',
        city_id: null,
        mobile_number1: '',
        mobile_number2: '',
        landline_number: '',
        email: '',
        website: '',
        reporting_no: '',
        business_vertical: null,
        engineer_id: null,
        commit_date: new Date().toISOString().split('T')[0],
        referred_by: null,
        date: new Date().toISOString().split('T')[0]
    });

    const handleCustomerChange = (selectedOption) => {
        if (!selectedOption) {
            setFormData(prev => ({
                ...prev, customer_id: null, billing_address1: '', billing_address2: '', billing_address3: '',
                pincode: '', city_id: null, mobile_number1: '', mobile_number2: '', landline_number: '', email: '', website: ''
            }));
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            customer_id: selectedOption,
            billing_address1: selectedOption.billing_address1 || '',
            billing_address2: selectedOption.billing_address2 || '',
            billing_address3: selectedOption.billing_address3 || '',
            pincode: selectedOption.pincode || '',
            city_id: cityOpts.find(c => c.value == selectedOption.city_id) || null, // Best effort match
            mobile_number1: selectedOption.mobile_number1 || '',
            mobile_number2: selectedOption.mobile_number2 || '',
            landline_number: selectedOption.landline_number || '',
            email: selectedOption.email || '',
            website: selectedOption.website || ''
        }));
    };

    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                const [engRes, custRes, cityRes, noRes, verticalRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting/engineers`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting/customers`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/city`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting/generate-number`, { headers }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting/business-verticals`, { headers })
                ]);

                if (engRes.ok) {
                    const engJson = await engRes.json();
                    const engData = Array.isArray(engJson) ? engJson : (engJson.data || []);
                    setEngineerOpts(engData.map(e => ({ value: e.id, label: e.name || e.employee_name || e.engineer_name })));
                }

                if (custRes.ok) {
                    const custJson = await custRes.json();
                    const custData = Array.isArray(custJson) ? custJson : (custJson.data || []);
                    setCustomerOpts(custData.map(c => ({ value: c.id, label: c.name || c.customer_name, ...c })));
                }

                if (cityRes.ok) {
                    const cityJson = await cityRes.json();
                    const cityData = Array.isArray(cityJson) ? cityJson : (cityJson.data || []);
                    setCityOpts(cityData.map(c => ({ value: c.id, label: c.city_name || c.name || c.city })));
                }

                if (noRes.ok) {
                    const noJson = await noRes.json();
                    if (noJson.status === 'success' && noJson.data) {
                        setFormData(prev => ({ ...prev, reporting_no: noJson.data }));
                    }
                }

                if (verticalRes.ok) {
                    const verticalJson = await verticalRes.json();
                    const verticalData = Array.isArray(verticalJson) ? verticalJson : (verticalJson.data || []);
                    setVerticalOptions(verticalData.map(v => ({ value: v.id, label: v.name || v.vertical })));
                }
            } catch (err) {
                console.error("Error fetching dropdowns:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDropdowns();
    }, []);
    
    // State for Recommended Spares
    const [spares, setSpares] = useState([{ description: '', quantity: '', units: '' }]);

    const handleAddSpare = () => {
        setSpares([...spares, { description: '', quantity: '', units: '' }]);
    };

    const handleRemoveSpare = (index) => {
        if (spares.length > 1) {
            const newSpares = spares.filter((_, i) => i !== index);
            setSpares(newSpares);
        }
    };

    const handleSpareChange = (index, field, value) => {
        const newSpares = [...spares];
        newSpares[index][field] = value;
        setSpares(newSpares);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        if (formData.customer_id) {
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting/customers/${formData.customer_id.value}`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify({
                        billing_address1: formData.billing_address1,
                        billing_address2: formData.billing_address2,
                        billing_address3: formData.billing_address3,
                        pincode: formData.pincode,
                        city_id: formData.city_id ? formData.city_id.value : null,
                        mobile_number1: formData.mobile_number1,
                        mobile_number2: formData.mobile_number2,
                        contact_number: formData.landline_number // Landline/Contact number
                    })
                });

                const json = await response.json();
                if (!response.ok || json.status !== 'success') {
                    console.error('Failed to update customer: ' + (json.message || 'Unknown error'));
                }
            } catch (err) {
                console.error("Error updating customer:", err);
            }
        }
        
        try {
            const token = sessionStorage.getItem('erp_token');
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            
            // Build report payload
            const payload = {
                enquiry_number: formData.reporting_no,
                business_vertical: formData.business_vertical ? formData.business_vertical.value : null,
                engineer_id: formData.engineer_id ? formData.engineer_id.value : null,
                customer_id: formData.customer_id ? formData.customer_id.value : null,
                customer_name: formData.customer_id ? formData.customer_id.label : '',
                billing_address1: formData.billing_address1,
                billing_address2: formData.billing_address2,
                billing_address3: formData.billing_address3,
                pincode: formData.pincode,
                city_id: formData.city_id ? formData.city_id.value : null,
                mobile_number: formData.mobile_number1,
                mobile_number1: formData.mobile_number1,
                mobile_number2: formData.mobile_number2,
                landline_number: formData.landline_number,
                email: formData.email,
                website: formData.website,
                commit_date: formData.commit_date,
                date: formData.date,
                referred_by: formData.referred_by ? formData.referred_by.value : null,
                
                // Customer Profile Fields
                cust_contact_name: formData.cust_contact_name,
                cust_designation: formData.cust_designation,
                contact_number: formData.contact_number,
                customer_remark: formData.customer_remark,
                
                // Product Details Fields
                enquiry_from: formData.enquiry_from,
                person_contacted_designation: formData.person_contacted_designation,
                customer_status: formData.customer_status,
                machine_model: formData.machine_model,
                service_no: formData.service_no,
                year_manufacture: formData.year_manufacture,
                compressor_capacity: formData.compressor_capacity,
                dryer_capacity: formData.dryer_capacity,
                receive_tank_capacity: formData.receive_tank_capacity,
                incomeing_v1: formData.incomeing_v1,
                incoming_v2: formData.incoming_v2,
                incoming_v3: formData.incoming_v3,
                load_a1: formData.load_a1,
                load_a2: formData.load_a2,
                load_a3: formData.load_a3,
                running_hrs: formData.running_hrs,
                loading_hrs: formData.loading_hrs,
                pressure_setting: formData.pressure_setting,
                pressure_setting_to: formData.pressure_setting_to,
                sum_pressure: formData.sum_pressure,
                air_end_temperature: formData.air_end_temperature,
                halfs_total: formData.halfs_total,
                fulls_total: formData.fulls_total,
                next_service: formData.next_service,
                balance: formData.balance,
                loading_time: formData.loading_time,
                unloading_time: formData.unloading_time,
                compresser_cleaning: formData.compresser_cleaning,
                service_charge: formData.service_charge,
                time_from: formData.time_from,
                time_to: formData.time_to,
                nature_of_complaint: formData.nature_of_complaint,
                observation: formData.observation,
                work_done: formData.work_done,
                service_enginer_remark: formData.service_enginer_remark,

                details: spares
            };

            const reportRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reporting/reporting`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            const reportJson = await reportRes.json();
            if (reportRes.ok && reportJson.status === 'success') {
                navigate('/reporting');
            } else {
                alert('Failed to submit reporting: ' + (reportJson.message || 'Unknown error'));
            }
        } catch (err) {
            console.error("Error submitting report:", err);
            alert("An error occurred while submitting the report.");
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between sm:tw-items-center tw-gap-3">
                        <h3 className="card-title max-[768px]:tw-text-center max-[768px]:tw-w-full max-[350px]:tw-whitespace-nowrap max-[350px]:tw-text-lg">Add Reporting</h3>
                        <div className="tw-flex max-[425px]:tw-flex-col tw-gap-2 max-[425px]:tw-w-full">
                            <button className="btn btn-primary max-[425px]:tw-w-full" onClick={() => setShowCustomerHistoryPopup(true)}>
                                Customer History
                            </button>
                            <button className="btn-header-back max-[425px]:tw-w-full" onClick={() => navigate('/reporting')}>
                                Back
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Reporting No <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Reporting No" value={formData.reporting_no} onChange={e => setFormData({...formData, reporting_no: e.target.value})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Business Vertical</label>
                                    <Select options={verticalOptions} defaultValue={verticalOptions[0]} placeholder="Choose a Vertical" value={formData.business_vertical} onChange={opt => setFormData({...formData, business_vertical: opt})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Engineer Name</label>
                                    <Select options={engineerOpts} placeholder="Choose a Person" value={formData.engineer_id} onChange={opt => setFormData({...formData, engineer_id: opt})} />
                                </div>
                                <div className="col-md-3 form-group" style={{ position: 'relative' }}>
                                    <button type="button" className="popup-icon" aria-label="Add customer" onClick={() => setShowCustomerPopup(true)}><i className="bi bi-plus-lg" /></button>
                                    <label>Customer Name <span className="text-danger">*</span></label>
                                    <Select 
                                        options={customerOpts} 
                                        placeholder="Choose a Customer" 
                                        value={formData.customer_id}
                                        onChange={handleCustomerChange}
                                        isClearable
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Billing Address1</label>
                                    <input type="text" className="form-control" placeholder="Billing Address1" value={formData.billing_address1} onChange={e => setFormData({...formData, billing_address1: e.target.value})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Billing Address2</label>
                                    <input type="text" className="form-control" placeholder="Billing Address2" value={formData.billing_address2} onChange={e => setFormData({...formData, billing_address2: e.target.value})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Billing Address3</label>
                                    <input type="text" className="form-control" placeholder="Billing Address3" value={formData.billing_address3} onChange={e => setFormData({...formData, billing_address3: e.target.value})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Pincode</label>
                                    <input type="text" className="form-control" placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select options={cityOpts} placeholder="Choose a City" value={formData.city_id} onChange={opt => setFormData({...formData, city_id: opt})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Committed Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" value={formData.commit_date} onChange={e => setFormData({...formData, commit_date: e.target.value})} />
                                </div>
                                <div className="col-md-3 form-group" style={{ position: 'relative' }}>
                                    <button type="button" className="popup-icon" aria-label="Add referrer" onClick={() => setShowReferredPopup(true)}><i className="bi bi-plus-lg" /></button>
                                    <label>Referred By</label>
                                    <Select options={customerOpts} placeholder="Referred By" value={formData.referred_by} onChange={opt => setFormData({...formData, referred_by: opt})} /> 
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Mobile Number1 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Mobile Number1" value={formData.mobile_number1} onChange={e => setFormData({...formData, mobile_number1: e.target.value})} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Mobile Number2</label>
                                    <input type="text" className="form-control" placeholder="Mobile Number2" value={formData.mobile_number2} onChange={e => setFormData({...formData, mobile_number2: e.target.value})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Landline No</label>
                                    <input type="text" className="form-control" placeholder="Landline No" value={formData.landline_number} onChange={e => setFormData({...formData, landline_number: e.target.value})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Email</label>
                                    <input type="email" className="form-control" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Website</label>
                                    <input type="text" className="form-control" placeholder="Website" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                </div>
                            </div>

                            {/* Tabs Section */}
                            <div className="tw-mt-8">
                                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-mb-6">
                                    <button
                                        type="button"
                                        className={`tw-flex-1 sm:tw-flex-none tw-py-2.5 tw-px-2 sm:tw-px-8 tw-font-semibold tw-text-[13px] sm:tw-text-sm tw-border tw-transition-colors tw-duration-200 ${activeTab === 'Customer Profile' ? 'tw-border-blue-600 tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700 hover:tw-border-blue-700' : 'tw-border-gray-300 tw-text-gray-600 tw-bg-white hover:tw-bg-blue-50 hover:tw-text-blue-600 hover:tw-border-blue-200'}`}
                                        onClick={() => setActiveTab('Customer Profile')}
                                    >
                                        Customer Profile
                                    </button>
                                    <button
                                        type="button"
                                        className={`tw-flex-1 sm:tw-flex-none tw-py-2.5 tw-px-2 sm:tw-px-8 tw-font-semibold tw-text-[13px] sm:tw-text-sm tw-border tw-border-t-0 sm:tw-border-t sm:tw-border-l-0 tw-transition-colors tw-duration-200 ${activeTab === 'Product Details' ? 'tw-border-blue-600 tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700 hover:tw-border-blue-700' : 'tw-border-gray-300 tw-text-gray-600 tw-bg-white hover:tw-bg-blue-50 hover:tw-text-blue-600 hover:tw-border-blue-200'}`}
                                        onClick={() => setActiveTab('Product Details')}
                                    >
                                        Product Details
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="tw-bg-slate-50/50 tw-p-6 tw-rounded-lg tw-border tw-border-gray-100">
                                    {activeTab === 'Customer Profile' && (
                                        <>
                                            <div className="row">
                                                <div className="col-md-4 form-group">
                                                    <label>Contact Person</label>
                                                    <input type="text" className="form-control" placeholder="Contact Person" value={formData.cust_contact_name || ''} onChange={e => setFormData({...formData, cust_contact_name: e.target.value})} />
                                                </div>
                                                <div className="col-md-4 form-group">
                                                    <label>Designation</label>
                                                    <input type="text" className="form-control" placeholder="Designation" value={formData.cust_designation || ''} onChange={e => setFormData({...formData, cust_designation: e.target.value})} />
                                                </div>
                                                <div className="col-md-4 form-group">
                                                    <label>Contact Number</label>
                                                    <input type="text" className="form-control" placeholder="Contact Number" value={formData.contact_number || ''} onChange={e => setFormData({...formData, contact_number: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="row tw-mt-2">
                                                <div className="col-md-12 form-group">
                                                    <label>Remark</label>
                                                    <textarea className="form-control" rows="2" placeholder="Enter remarks..." value={formData.customer_remark || ''} onChange={e => setFormData({...formData, customer_remark: e.target.value})}></textarea>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === 'Product Details' && (
                                        <>
                                            <div className="row">
                                                <div className="col-md-3 form-group">
                                                    <label>Person Contacted Name</label>
                                                    <input type="text" className="form-control" placeholder="Person Contacted Name" value={formData.enquiry_from || ''} onChange={e => setFormData({...formData, enquiry_from: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Person Contacted Designation</label>
                                                    <input type="text" className="form-control" placeholder="Person Contacted Designation" value={formData.person_contacted_designation || ''} onChange={e => setFormData({...formData, person_contacted_designation: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Customer Status</label>
                                                    <select className="form-select" value={formData.customer_status || ''} onChange={e => setFormData({...formData, customer_status: e.target.value})}>
                                                        <option value="">Select Status</option>
                                                        <option value="Warrenty">Warrenty</option>
                                                        <option value="AMC">AMC</option>
                                                        <option value="Paid Service">Paid Service</option>
                                                        <option value="Free Service">Free Service</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Machine Model</label>
                                                    <input type="text" className="form-control" placeholder="Machine Model" value={formData.machine_model || ''} onChange={e => setFormData({...formData, machine_model: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-3 form-group">
                                                    <label>Service No</label>
                                                    <input type="text" className="form-control" placeholder="Service No" value={formData.service_no || ''} onChange={e => setFormData({...formData, service_no: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Year of Manufacturing</label>
                                                    <input type="text" className="form-control" placeholder="Year of Manufacturing" value={formData.year_manufacture || ''} onChange={e => setFormData({...formData, year_manufacture: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Compressor Capacity</label>
                                                    <input type="text" className="form-control" placeholder="Compressor Capacity" value={formData.compressor_capacity || ''} onChange={e => setFormData({...formData, compressor_capacity: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Dryer Capacity</label>
                                                    <input type="text" className="form-control" placeholder="Dryer Capacity" value={formData.dryer_capacity || ''} onChange={e => setFormData({...formData, dryer_capacity: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-3 form-group">
                                                    <label>Receiver Tank Capacity</label>
                                                    <input type="text" className="form-control" placeholder="Receiver Tank Capacity" value={formData.receive_tank_capacity || ''} onChange={e => setFormData({...formData, receive_tank_capacity: e.target.value})} />
                                                </div>
                                            </div>

                                            <h6 className="tw-mt-4 tw-font-semibold tw-text-center">Incoming Voltage : Load</h6>
                                            <div className="row">
                                                <div className="col-md-3 form-group">
                                                    <label>V1</label>
                                                    <input type="text" className="form-control" placeholder="V1" value={formData.incomeing_v1 || ''} onChange={e => setFormData({...formData, incomeing_v1: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>V2</label>
                                                    <input type="text" className="form-control" placeholder="V2" value={formData.incoming_v2 || ''} onChange={e => setFormData({...formData, incoming_v2: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>V3</label>
                                                    <input type="text" className="form-control" placeholder="V3" value={formData.incoming_v3 || ''} onChange={e => setFormData({...formData, incoming_v3: e.target.value})} />
                                                </div>
                                            </div>

                                            <h6 className="tw-mt-4 tw-font-semibold tw-text-center">Current Rated : Ideal - Load</h6>
                                            <div className="row">
                                                <div className="col-md-3 form-group">
                                                    <label>A1</label>
                                                    <input type="text" className="form-control" placeholder="A1" value={formData.load_a1 || ''} onChange={e => setFormData({...formData, load_a1: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>A2</label>
                                                    <input type="text" className="form-control" placeholder="A2" value={formData.load_a2 || ''} onChange={e => setFormData({...formData, load_a2: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>A3</label>
                                                    <input type="text" className="form-control" placeholder="A3" value={formData.load_a3 || ''} onChange={e => setFormData({...formData, load_a3: e.target.value})} />
                                                </div>
                                            </div>

                                            <div className="row tw-mt-6">
                                                <div className="col-md-3 form-group">
                                                    <label>Running (Hrs)</label>
                                                    <input type="text" className="form-control" placeholder="Hrs" value={formData.running_hrs || ''} onChange={e => setFormData({...formData, running_hrs: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Loading (Hrs)</label>
                                                    <input type="text" className="form-control" placeholder="Hrs" value={formData.loading_hrs || ''} onChange={e => setFormData({...formData, loading_hrs: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Pressure setting (Kg/cm2)</label>
                                                    <input type="text" className="form-control" placeholder="Kg/cm2" value={formData.pressure_setting || ''} onChange={e => setFormData({...formData, pressure_setting: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>To (Kg/cm2)</label>
                                                    <input type="text" className="form-control" placeholder="Kg/cm2" value={formData.pressure_setting_to || ''} onChange={e => setFormData({...formData, pressure_setting_to: e.target.value})} />
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-3 form-group">
                                                    <label>Sum Pressure (Kg/cm2)</label>
                                                    <input type="text" className="form-control" placeholder="Kg/cm2" value={formData.sum_pressure || ''} onChange={e => setFormData({...formData, sum_pressure: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Air and Temperature (C)</label>
                                                    <input type="text" className="form-control" placeholder="C" value={formData.air_end_temperature || ''} onChange={e => setFormData({...formData, air_end_temperature: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Half(S) Total</label>
                                                    <input type="text" className="form-control" placeholder="Half's Total" value={formData.halfs_total || ''} onChange={e => setFormData({...formData, halfs_total: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Full(S) Total</label>
                                                    <input type="text" className="form-control" placeholder="Full's Total" value={formData.fulls_total || ''} onChange={e => setFormData({...formData, fulls_total: e.target.value})} />
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-3 form-group">
                                                    <label>Next Service</label>
                                                    <input type="text" className="form-control" placeholder="Next Service" value={formData.next_service || ''} onChange={e => setFormData({...formData, next_service: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Balance</label>
                                                    <input type="text" className="form-control" placeholder="Balance" value={formData.balance || ''} onChange={e => setFormData({...formData, balance: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Loading Time</label>
                                                    <input type="text" className="form-control" placeholder="Loading Time" value={formData.loading_time || ''} onChange={e => setFormData({...formData, loading_time: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Unloading Time</label>
                                                    <input type="text" className="form-control" placeholder="Unloading Time" value={formData.unloading_time || ''} onChange={e => setFormData({...formData, unloading_time: e.target.value})} />
                                                </div>
                                            </div>

                                            <h6 className="tw-mt-6 tw-font-semibold tw-text-center">When the all machine Stop in the factory</h6>
                                            <div className="row">
                                                <div className="col-md-3 form-group">
                                                    <label>Compressor Cleaning</label>
                                                    <input type="text" className="form-control" placeholder="Compressor Cleaning" value={formData.compresser_cleaning || ''} onChange={e => setFormData({...formData, compresser_cleaning: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Service Charges</label>
                                                    <input type="text" className="form-control" placeholder="Service Charges" value={formData.service_charge || ''} onChange={e => setFormData({...formData, service_charge: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>Time: From</label>
                                                    <input type="time" className="form-control" placeholder="From" value={formData.time_from || ''} onChange={e => setFormData({...formData, time_from: e.target.value})} />
                                                </div>
                                                <div className="col-md-3 form-group">
                                                    <label>To</label>
                                                    <input type="time" className="form-control" placeholder="To" value={formData.time_to || ''} onChange={e => setFormData({...formData, time_to: e.target.value})} />
                                                </div>
                                            </div>

                                            <h6 className="tw-mt-6 tw-font-semibold tw-text-center">Recommended Spares</h6>
                                            <div className="table-responsive tw-mt-2">
                                                <table className="table table-bordered">
                                                    <thead className="tw-bg-gray-50">
                                                        <tr>
                                                            <th className="tw-w-16">S.No</th>
                                                            <th>Description</th>
                                                            <th>Quantity</th>
                                                            <th>Units</th>
                                                            <th className="tw-w-24">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {spares.map((spare, index) => (
                                                            <tr key={index}>
                                                                <td className="tw-align-middle">{index + 1}</td>
                                                                <td><input type="text" className="form-control" placeholder="Description" value={spare.description} onChange={(e) => handleSpareChange(index, 'description', e.target.value)} style={{ minWidth: 'max(150px, 100%)', width: spare.description ? `${spare.description.length + 2}ch` : 'auto' }} /></td>
                                                                <td><input type="text" className="form-control" placeholder="Quantity" value={spare.quantity} onChange={(e) => handleSpareChange(index, 'quantity', e.target.value)} style={{ minWidth: 'max(80px, 100%)', width: spare.quantity ? `${spare.quantity.toString().length + 2}ch` : 'auto' }} /></td>
                                                                <td><input type="text" className="form-control" placeholder="Units" value={spare.units} onChange={(e) => handleSpareChange(index, 'units', e.target.value)} style={{ minWidth: 'max(100px, 100%)', width: spare.units ? `${spare.units.length + 2}ch` : 'auto' }} /></td>
                                                                <td className="tw-align-middle tw-text-center">
                                                                    <div className="tw-flex tw-justify-center tw-gap-2">
                                                                        <button 
                                                                            type="button" 
                                                                            className="tw-w-8 tw-h-8 tw-rounded-md tw-bg-[#22c55e] tw-text-white tw-shadow-[0_2px_10px_rgba(34,197,94,0.4)] tw-flex tw-items-center tw-justify-center hover:tw-bg-[#16a34a] tw-transition-colors tw-border-none"
                                                                            title="Add Row" 
                                                                            onClick={handleAddSpare}
                                                                        >
                                                                            <i className="bi bi-plus tw-text-xl tw-font-bold" />
                                                                        </button>
                                                                        <button 
                                                                            type="button" 
                                                                            className="tw-w-8 tw-h-8 tw-rounded-md tw-bg-[#ef4444] tw-text-white tw-shadow-[0_2px_10px_rgba(239,68,68,0.4)] tw-flex tw-items-center tw-justify-center hover:tw-bg-[#dc2626] tw-transition-colors tw-border-none" 
                                                                            title="Remove Row" 
                                                                            onClick={() => handleRemoveSpare(index)}
                                                                        >
                                                                            <i className="bi bi-trash tw-text-sm" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="row tw-mt-6">
                                                <div className="col-md-12 form-group">
                                                    <label>Nature Of Complaint</label>
                                                    <textarea className="form-control" rows="3" placeholder="Nature Of Complaint" value={formData.nature_of_complaint || ''} onChange={e => setFormData({...formData, nature_of_complaint: e.target.value})}></textarea>
                                                </div>
                                            </div>
                                            <div className="row tw-mt-3">
                                                <div className="col-md-12 form-group">
                                                    <label>Observation</label>
                                                    <textarea className="form-control" rows="3" placeholder="Observation" value={formData.observation || ''} onChange={e => setFormData({...formData, observation: e.target.value})}></textarea>
                                                </div>
                                            </div>
                                            <div className="row tw-mt-3">
                                                <div className="col-md-12 form-group">
                                                    <label>Work Done</label>
                                                    <textarea className="form-control" rows="3" placeholder="Work Done" value={formData.work_done || ''} onChange={e => setFormData({...formData, work_done: e.target.value})}></textarea>
                                                </div>
                                            </div>
                                            <div className="row tw-mt-3">
                                                <div className="col-md-12 form-group">
                                                    <label>Customer Remarks</label>
                                                    <textarea className="form-control" rows="3" placeholder="Customer Remarks" value={formData.customer_remark || ''} onChange={e => setFormData({...formData, customer_remark: e.target.value})}></textarea>
                                                </div>
                                            </div>
                                            <div className="row tw-mt-3">
                                                <div className="col-md-12 form-group">
                                                    <label>Service Engineer Remark</label>
                                                    <textarea className="form-control" rows="3" placeholder="Service Engineer Remark" value={formData.service_enginer_remark || ''} onChange={e => setFormData({...formData, service_enginer_remark: e.target.value})}></textarea>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="form-actions mt-3 tw-flex max-[425px]:tw-flex-col tw-justify-between tw-gap-3">
                                <button type="button" className="btn-cancel max-[425px]:tw-w-full" onClick={() => navigate('/reporting')}>Cancel</button>
                                <button type="submit" className="btn-save max-[425px]:tw-w-full">Submit</button>
                            </div>
                        </form>
                        <CustomerPopup isOpen={showCustomerPopup} onClose={() => setShowCustomerPopup(false)} onSubmit={(data)=>{console.log('Customer created', data)}} />
                        <ReferredCustomerPopup isOpen={showReferredPopup} onClose={() => setShowReferredPopup(false)} onSubmit={(data)=>{console.log('Referred customer created', data)}} />
                        <CustomerHistoryPopup isOpen={showCustomerHistoryPopup} onClose={() => setShowCustomerHistoryPopup(false)} customerId={formData.customer_id?.value} />
                        <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReportingAdd;
