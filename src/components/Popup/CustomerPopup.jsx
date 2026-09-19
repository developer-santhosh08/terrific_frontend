import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import SubmitPopup from './SubmitPopup';

const CustomerPopup = ({ isOpen, onClose, onSubmit, initialName = '' }) => {
    const [group, setGroup] = useState(null);
    const [category, setCategory] = useState(null);
    const [subCategory, setSubCategory] = useState(null);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [gstin, setGstin] = useState('');
    const [addr1, setAddr1] = useState('');
    const [addr2, setAddr2] = useState('');
    const [addr3, setAddr3] = useState('');
    const [pincode, setPincode] = useState('');
    const [city, setCity] = useState(null);

    const [groupOptions, setGroupOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
        } else {
            // Reset form when closed
            setName('');
            setGroup(null);
            setCategory(null);
            setSubCategory(null);
            setMobile('');
            setGstin('');
            setAddr1('');
            setAddr2('');
            setAddr3('');
            setPincode('');
            setCity(null);
        }
    }, [isOpen, initialName]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                const batch = await Promise.all([
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/enquiry/customer-groups'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/enquiry/customer-categories'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/enquiry/customer-sub-categories'),
                    fetch(import.meta.env.VITE_API_BASE_URL + '/api/enquiry/cities')
                ]);

                const [grpRes, catRes, subRes, cityRes] = batch;

                const grpJson = await grpRes.json();
                const catJson = await catRes.json();
                const subJson = await subRes.json();
                const cityJson = await cityRes.json();

                const extractData = (json) => Array.isArray(json) ? json : (json?.data || []);

                setGroupOptions(extractData(grpJson).map(i => ({ value: i.id, label: i.name })));
                setCategoryOptions(extractData(catJson).map(i => ({ value: i.id, label: i.name })));
                setSubCategoryOptions(extractData(subJson).map(i => ({ value: i.id, label: i.name })));
                setCityOptions(extractData(cityJson).map(i => ({ value: i.id, label: i.name })));
            } catch (err) {
                console.error("Error fetching popup dropdowns:", err);
            }
        };

        fetchData();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name || !mobile || !city) {
            alert("Please fill in all mandatory fields (*)");
            return;
        }
        setShowSubmitConfirm(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: name,
                customer_group_id: group ? group.value : 1,
                customer_category_id: category ? category.value : 1,
                customer_sub_category_id: subCategory ? subCategory.value : 1,
                mobile_number1: mobile,
                gstin_number: gstin || "",
                address1: addr1 || "",
                address2: addr2 || "",
                address3: addr3 || "",
                pincode: pincode || "",
                city_id: city.value,
                business_address1: addr1 || "",
                business_address2: addr2 || "",
                business_address3: addr3 || "",
                business_city_id: city.value,
                contact_person: []
            };

            const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/enquiry/customer-create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const json = await response.json();

            if (json.status === 'success' || json.status === true) {
                if (onSubmit) onSubmit(json.data);
                onClose();
            } else {
                alert(json.message || "Failed to create customer");
            }
        } catch (error) {
            console.error("Error creating customer:", error);
            alert("An error occurred while creating the customer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-slate-900/40 tw-p-4 sm:tw-p-6" style={{ zIndex: 999999 }}>
            {/* Background overlay click to close */}
            <div className="tw-absolute tw-inset-0" onClick={onClose} />
            
            {/* Modal Container */}
            <div className="tw-bg-white tw-w-full tw-max-w-4xl tw-max-h-full tw-flex tw-flex-col tw-rounded-xl tw-shadow-2xl tw-overflow-hidden tw-relative tw-z-[1060] tw-border-2 tw-border-blue-600/20">
                
                {/* Header */}
                <div className="tw-flex tw-items-center tw-justify-between tw-p-4 sm:tw-p-5 tw-border-b tw-border-gray-100 tw-shrink-0 tw-bg-gray-50/50">
                    <h5 className="tw-text-lg sm:tw-text-xl tw-font-bold tw-text-gray-800 tw-m-0">Customer Popup</h5>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-transition-colors tw-border-none tw-cursor-pointer"
                    >
                        <span className="tw-text-xl tw-leading-none tw-mb-[2px]">&times;</span>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="tw-flex-1 tw-overflow-y-auto tw-p-4 sm:tw-p-5">
                    <div className="row tw-m-0">
                        <div className="col-md-6 tw-px-2">
                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Group</label>
                                <Select
                                    options={groupOptions}
                                    value={group}
                                    onChange={setGroup}
                                    placeholder="Select Group"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999999 }) }}
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Category</label>
                                <Select
                                    options={categoryOptions}
                                    value={category}
                                    onChange={setCategory}
                                    placeholder="Select Category"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999999 }) }}
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Sub Category</label>
                                <Select
                                    options={subCategoryOptions}
                                    value={subCategory}
                                    onChange={setSubCategory}
                                    placeholder="Select Sub Category"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999999 }) }}
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Name <span className="text-danger">*</span></label>
                                <input type="text" className="form-control tw-text-sm" value={name} onChange={e => setName(e.target.value)} />
                            </div>

                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Mobile Number <span className="text-danger">*</span></label>
                                <input type="text" className="form-control tw-text-sm" value={mobile} onChange={e => setMobile(e.target.value)} />
                            </div>

                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Customer GSTIN</label>
                                <input type="text" className="form-control tw-text-sm" value={gstin} onChange={e => setGstin(e.target.value)} />
                            </div>
                        </div>

                        <div className="col-md-6 tw-px-2">
                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Address Line 1</label>
                                <input type="text" className="form-control tw-text-sm" value={addr1} onChange={e => setAddr1(e.target.value)} />
                            </div>
                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Address Line 2</label>
                                <input type="text" className="form-control tw-text-sm" value={addr2} onChange={e => setAddr2(e.target.value)} />
                            </div>
                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Address Line 3</label>
                                <input type="text" className="form-control tw-text-sm" value={addr3} onChange={e => setAddr3(e.target.value)} />
                            </div>
                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">Pincode</label>
                                <input type="text" className="form-control tw-text-sm" value={pincode} onChange={e => setPincode(e.target.value)} />
                            </div>
                            <div className="form-group mb-3">
                                <label className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1 tw-block">City <span className="text-danger">*</span></label>
                                <Select
                                    options={cityOptions}
                                    value={city}
                                    onChange={setCity}
                                    placeholder="Select City"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999999 }) }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="tw-flex tw-items-center tw-justify-between tw-p-4 sm:tw-p-5 tw-border-t tw-border-gray-100 tw-shrink-0 tw-bg-gray-50/50">
                    <button type="button" className="btn btn-warning tw-px-6" onClick={onClose} disabled={isSubmitting}>Close</button>
                    <button 
                        type="button" 
                        className="btn btn-success tw-px-6" 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
            
            <SubmitPopup 
                isOpen={showSubmitConfirm} 
                onClose={() => setShowSubmitConfirm(false)} 
                onConfirm={confirmSubmit} 
            />
        </div>,
        document.body
    );
};

export default CustomerPopup;
