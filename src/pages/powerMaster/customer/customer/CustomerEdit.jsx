import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Plus, Trash } from '@phosphor-icons/react';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';
import { useLoader } from '../../../../context/LoaderContext';

const CustomerEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setLoading } = useLoader();

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [contactPersons, setContactPersons] = useState([]);
    
    const [formData, setFormData] = useState({
        customer_group_id: null,
        customer_category_id: null,
        customer_sub_category_id: null,
        name: '',
        address1: '',
        address2: '',
        address3: '',
        pincode: '',
        city_id: null,
        business_address1: '',
        business_address2: '',
        business_address3: '',
        business_city_id: null,
        tin_number: '',
        cst_number: '',
        gstin_number: '',
        registration_date: '',
        email1: '',
        email2: '',
        mobile_number1: '',
        mobile_number2: '',
        phone_number: '',
        date_of_birth: '',
        website: '',
        status: { value: 'Active', label: 'Active' }
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const groupOptions = [
        { value: 1, label: 'Industry' },
        { value: 2, label: 'Civil Construction' },
        { value: 3, label: 'Hospital' },
        { value: 4, label: 'Knitting' }
    ];

    const categoryOptions = [
        { value: 1, label: 'Engineering' },
        { value: 2, label: 'Food' },
        { value: 3, label: 'Grained' },
        { value: 4, label: 'Hospital' },
        { value: 5, label: 'Medical' },
        { value: 6, label: 'Metal Manufacturing' },
        { value: 7, label: 'Plastics' },
        { value: 8, label: 'Textile' }
    ];

    const subCategoryOptions = [
        { value: 1, label: 'Compacting' },
        { value: 2, label: 'Dealers' },
        { value: 3, label: 'Dhal Mill' },
        { value: 4, label: 'Dying' },
        { value: 5, label: 'Garments' },
        { value: 6, label: 'Grained' },
        { value: 7, label: 'Knitting' },
        { value: 8, label: 'Lager' }
    ];

    const cityOptions = [
        { value: 1, label: 'BANGALORE' },
        { value: 2, label: 'CHENNAI' },
        { value: 3, label: 'COIMBATORE' },
        { value: 4, label: 'DHARMAPURI' },
        { value: 5, label: 'DINDUKKAL' },
        { value: 6, label: 'ERODE' },
        { value: 7, label: 'HOSUR' },
        { value: 8, label: 'KANGAYAM' }
    ];

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const currentDate = `${yyyy}-${mm}-${dd}`;

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/customer/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const json = await res.json();
                if (json.status && json.data) {
                    const data = json.data;
                    setFormData({
                        customer_group_id: groupOptions.find(o => o.value === data.customer_group_id) || null,
                        customer_category_id: categoryOptions.find(o => o.value === data.customer_category_id) || null,
                        customer_sub_category_id: subCategoryOptions.find(o => o.value === data.customer_sub_category_id) || null,
                        name: data.name || '',
                        address1: data.address1 || '',
                        address2: data.address2 || '',
                        address3: data.address3 || '',
                        pincode: data.pincode || '',
                        city_id: cityOptions.find(o => o.value === data.city_id) || null,
                        business_address1: data.business_address1 || '',
                        business_address2: data.business_address2 || '',
                        business_address3: data.business_address3 || '',
                        business_city_id: cityOptions.find(o => o.value === data.business_city_id) || null,
                        tin_number: data.tin_number || '',
                        cst_number: data.cst_number || '',
                        gstin_number: data.gstin_number || '',
                        registration_date: data.registration_date || currentDate,
                        email1: data.email1 || '',
                        email2: data.email2 || '',
                        mobile_number1: data.mobile_number1 || '',
                        mobile_number2: data.mobile_number2 || '',
                        phone_number: data.phone_number || '',
                        date_of_birth: data.date_of_birth || currentDate,
                        website: data.website || '',
                        status: (data.status === 2 || data.status === "2") ? { value: 'Inactive', label: 'Inactive' } : { value: 'Active', label: 'Active' }
                    });

                    let fetchedContacts = data.contacts || json.contacts || data.contactDetails || data.customerContacts || data.customer_contacts || data.contact_persons || data.contact_details || data.details || [];
                    
                    if (typeof fetchedContacts === 'string') {
                        try {
                            fetchedContacts = JSON.parse(fetchedContacts);
                        } catch (e) {
                            fetchedContacts = [];
                        }
                    }
                    if (!Array.isArray(fetchedContacts)) {
                        fetchedContacts = [];
                    }

                    if (fetchedContacts.length > 0) {
                        setContactPersons(fetchedContacts.map((c, i) => ({
                            id: c.id || i,
                            contactPerson: c.contact_person || c.contactPerson || c.name || '',
                            designation: c.designation || '',
                            contactNumber: c.contact_number || c.contactNumber || c.mobile || '',
                            convenientTime: c.convenient_time || c.convenientTime || c.time || ''
                        })));
                    } else {
                        setContactPersons([{ id: Date.now(), contactPerson: '', designation: '', contactNumber: '', convenientTime: '' }]);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsInitialLoading(false);
                setLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [id]);

    const handleAddRow = () => {
        setContactPersons([...contactPersons, { id: Date.now(), contactPerson: '', designation: '', contactNumber: '', convenientTime: '' }]);
    };

    const handleDeleteRow = (id) => {
        if (contactPersons.length > 1) {
            setContactPersons(contactPersons.filter(cp => cp.id !== id));
        }
    };

    const handleContactChange = (id, field, value) => {
        setContactPersons(contactPersons.map(cp =>
            cp.id === id ? { ...cp, [field]: value } : cp
        ));
    };

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoading(true);
        
        const payload = {
            customer_group_id: formData.customer_group_id?.value || 1,
            customer_category_id: formData.customer_category_id?.value || 1,
            customer_sub_category_id: formData.customer_sub_category_id?.value || 1,
            name: formData.name,
            address1: formData.address1,
            address2: formData.address2,
            address3: formData.address3,
            pincode: parseInt(formData.pincode) || 0,
            city_id: formData.city_id?.value || 1,
            business_city_id: formData.business_city_id?.value || 1,
            registration_date: (!formData.registration_date || formData.registration_date === '0000-00-00') ? new Date().toISOString().split('T')[0] : formData.registration_date,
            date_of_birth: (!formData.date_of_birth || formData.date_of_birth === '0000-00-00') ? new Date().toISOString().split('T')[0] : formData.date_of_birth,
            mobile_number1: parseInt(formData.mobile_number1) || 0,
            mobile_number2: parseInt(formData.mobile_number2) || 0,
            extra_amount: 0,
            customer_grade: 1,
            status: formData.status?.value === 'Inactive' ? 2 : 1,
            log_status: 1
        };

        if (formData.business_address1) payload.business_address1 = formData.business_address1;
        if (formData.business_address2) payload.business_address2 = formData.business_address2;
        if (formData.business_address3) payload.business_address3 = formData.business_address3;
        if (formData.tin_number) payload.tin_number = formData.tin_number;
        if (formData.cst_number) payload.cst_number = formData.cst_number;
        if (formData.gstin_number) payload.gstin_number = formData.gstin_number;
        if (formData.email1) payload.email1 = formData.email1;
        if (formData.email2) payload.email2 = formData.email2;
        if (formData.phone_number) payload.phone_number = formData.phone_number;
        if (formData.website) payload.website = formData.website;

        // TEMPORARY FIX: The backend PUT endpoint for customer update is currently trying to 
        // save the 'contacts' array directly into a 'contacts' column on the 'customer' table, 
        // which crashes with an SQL Unknown Column error. 
        // Commenting this out allows the rest of the customer details to be updated successfully.
        // payload.contacts = contactPersons.filter(c => c.contactPerson || c.contactNumber).map(c => ({
        //     contact_person: c.contactPerson,
        //     designation: c.designation,
        //     contact_number: c.contactNumber,
        //     convenient_time: c.convenientTime
        // }));

        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/customer/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.status) {
                setShowUpdatePopup(true);
            } else {
                alert(json.message + (json.error ? '\n' + json.error : ''));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update customer');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const handleConfirmUpdate = () => {
        navigate('/power-master/customer/customer');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Customer</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/customer/customer')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {isInitialLoading ? (
                            <div className="text-center py-5">Loading customer data...</div>
                        ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Group <span className="text-danger">*</span></label>
                                    <Select options={groupOptions} value={formData.customer_group_id} onChange={v => handleChange('customer_group_id', v)} placeholder="Customer Group" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Category <span className="text-danger">*</span></label>
                                    <Select options={categoryOptions} value={formData.customer_category_id} onChange={v => handleChange('customer_category_id', v)} placeholder="Customer Category" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Sub Category <span className="text-danger">*</span></label>
                                    <Select options={subCategoryOptions} value={formData.customer_sub_category_id} onChange={v => handleChange('customer_sub_category_id', v)} placeholder="Customer Sub Category" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Name" required value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 1 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Address Line 1" required value={formData.address1} onChange={e => handleChange('address1', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 2 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Address Line 2" required value={formData.address2} onChange={e => handleChange('address2', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 3 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Address Line 3" required value={formData.address3} onChange={e => handleChange('address3', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Pincode <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Pincode" required value={formData.pincode} onChange={e => handleChange('pincode', e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select options={cityOptions} value={formData.city_id} onChange={v => handleChange('city_id', v)} placeholder="Choose City" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Business Address Line 1</label>
                                    <input type="text" className="form-control" placeholder="Address Line 1" value={formData.business_address1} onChange={e => handleChange('business_address1', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Business Address Line 2</label>
                                    <input type="text" className="form-control" placeholder="Address Line 2" value={formData.business_address2} onChange={e => handleChange('business_address2', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Business Address Line 3</label>
                                    <input type="text" className="form-control" placeholder="Address Line 3" value={formData.business_address3} onChange={e => handleChange('business_address3', e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Business City</label>
                                    <Select options={cityOptions} value={formData.business_city_id} onChange={v => handleChange('business_city_id', v)} placeholder="Choose City" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Tin Number</label>
                                    <input type="text" className="form-control" placeholder="Tin Number" value={formData.tin_number} onChange={e => handleChange('tin_number', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>CST Number</label>
                                    <input type="text" className="form-control" placeholder="CST Number" value={formData.cst_number} onChange={e => handleChange('cst_number', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>GSTIN Number</label>
                                    <input type="text" className="form-control" placeholder="GSTIN Number" value={formData.gstin_number} onChange={e => handleChange('gstin_number', e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Reg Date</label>
                                    <input type="date" className="form-control" placeholder="Registration Date" value={formData.registration_date} onChange={e => handleChange('registration_date', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Email 1</label>
                                    <input type="email" className="form-control" placeholder="Email ID" value={formData.email1} onChange={e => handleChange('email1', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Email 2</label>
                                    <input type="email" className="form-control" placeholder="Email ID" value={formData.email2} onChange={e => handleChange('email2', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Mobile Number 1 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" placeholder="Mobile Number 1" required value={formData.mobile_number1} onChange={e => handleChange('mobile_number1', e.target.value)} />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Mobile Number 2</label>
                                    <input type="text" className="form-control" placeholder="Mobile Number 2" value={formData.mobile_number2} onChange={e => handleChange('mobile_number2', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Phone Number</label>
                                    <input type="text" className="form-control" placeholder="Phone Number" value={formData.phone_number} onChange={e => handleChange('phone_number', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>DOB</label>
                                    <input type="date" className="form-control" placeholder="Date Of Birth" value={formData.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Web Site</label>
                                    <input type="text" className="form-control" placeholder="Web Site" value={formData.website} onChange={e => handleChange('website', e.target.value)} />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status</label>
                                    <Select options={statusOptions} value={formData.status} onChange={v => handleChange('status', v)} placeholder="Status" className="react-select-container" classNamePrefix="react-select" />
                                </div>
                            </div>
                            
                            <hr className="my-4" />
                            
                            <h5 className="tw-font-bold tw-text-sm mb-3">Contact Person Details</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered mb-0">
                                    <thead className="tw-bg-slate-50">
                                        <tr>
                                            <th className="tw-w-16">S.No</th>
                                            <th>Contact Person</th>
                                            <th>Designation</th>
                                            <th>Contact Number</th>
                                            <th>Convenient Time</th>
                                            <th className="tw-w-32 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contactPersons.map((cp, index) => (
                                            <tr key={cp.id}>
                                                <td className="align-middle">{index + 1}</td>
                                                <td>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        placeholder="Contact Person"
                                                        value={cp.contactPerson}
                                                        onChange={(e) => handleContactChange(cp.id, 'contactPerson', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        placeholder="Designation"
                                                        value={cp.designation}
                                                        onChange={(e) => handleContactChange(cp.id, 'designation', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        placeholder="Contact Number"
                                                        value={cp.contactNumber}
                                                        onChange={(e) => handleContactChange(cp.id, 'contactNumber', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="time" 
                                                        className="form-control" 
                                                        placeholder="Convenient Time"
                                                        value={cp.convenientTime}
                                                        onChange={(e) => handleContactChange(cp.id, 'convenientTime', e.target.value)}
                                                    />
                                                </td>
                                                <td className="align-middle text-center">
                                                    <div className="tw-flex tw-justify-center tw-gap-2">
                                                        <button 
                                                            type="button"
                                                            className="list-action-btn btn-delete"
                                                            onClick={() => handleDeleteRow(cp.id)}
                                                        >
                                                            <Trash weight="bold" className="tw-w-4" />
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            className="list-action-btn btn-add"
                                                            onClick={handleAddRow}
                                                        >
                                                            <Plus weight="bold" className="tw-w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <hr className="my-4" />

                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button type="button" className="btn tw-bg-yellow-500 tw-text-white tw-px-6 tw-py-2 tw-rounded-md hover:tw-bg-yellow-600 tw-font-medium" onClick={() => navigate('/power-master/customer/customer')}>Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="btn tw-bg-green-500 tw-text-white tw-px-6 tw-py-2 tw-rounded-md hover:tw-bg-green-600 tw-font-medium">{isSubmitting ? 'Updating...' : 'Update'}</button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section >
    );
};

export default CustomerEdit;
