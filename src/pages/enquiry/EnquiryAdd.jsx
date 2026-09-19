import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { CaretLeft } from '@phosphor-icons/react';
import CustomerPopup from '../../components/Popup/CustomerPopup';
import ReferredCustomerPopup from '../../components/Popup/ReferredCustomerPopup';
import SubmitPopup from '../../components/Popup/SubmitPopup';
import { useLoader } from '../../context/LoaderContext';

const EnquiryAdd = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [activeTab, setActiveTab] = useState('Product Details');
    const [showCustomerPopup, setShowCustomerPopup] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newReferredName, setNewReferredName] = useState('');
    const [showReferredPopup, setShowReferredPopup] = useState(false);
    const [submitPopupOpen, setSubmitPopupOpen] = useState(false);
    const [errors, setErrors] = useState({});

    const verticalOptions = [
        // { value: 2, label: 'Service' },
        { value: 1, label: 'Sales' },
    ];

    const [engineerOptions, setEngineerOptions] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [deliveryOptions, setDeliveryOptions] = useState([]);
    const [warrantyOptions, setWarrantyOptions] = useState([]);
    const [freightOptions, setFreightOptions] = useState([]);
    const [taxNoteOptions, setTaxNoteOptions] = useState([]);
    const [pnfOptions, setPnfOptions] = useState([]);
    const [paymentOptions, setPaymentOptions] = useState([]);
    const [vendorMappings, setVendorMappings] = useState([]);
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        businessVertical: verticalOptions.find(opt => opt.value === 1) || null,
        engineerName: null,
        freightValue: 0,
        customerId: null,
        billingAddress1: '',
        billingAddress2: '',
        billingAddress3: '',
        pincode: '',
        city: null,
        committedDate: today,
        referredBy: null,
        mobileNumber1: '',
        mobileNumber2: '',
        landlineNo: '',
        email: '',
        website: '',
        date: today,
        contactPerson: '',
        designation: '',
        contactNumber: '',
        convenientTime: '',
        pnf: null,
        taxNote: null,
        payment: null,
        delivery: null,
        warranty: null,
        frightDropdown: null,
        remarks: '',
        cashDiscount: 0
    });

    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoading(true);
            try {
                const batch1 = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/employee`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/customer`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/city`)
                ]);
                const batch2 = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/tax`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/products`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/deliverynote`)
                ]);
                const batch3 = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/warrentynotes`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/frieghtnotes`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL.trim()}/api/master/dropdown/taxnotes`)
                ]);
                const batch4 = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/vendorProductMapping`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/pfnotes`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/paymentnotes`)
                ]);

                const [empRes, custRes, cityRes] = batch1;
                const [taxRes, prodRes, delRes] = batch2;
                const [warRes, freightRes, taxNoteRes] = batch3;
                const [vendorMapRes, pfRes, paymentRes] = batch4;
                const empJson = await empRes.json();
                const custJson = await custRes.json();
                const cityJson = await cityRes.json();
                const taxJson = await taxRes.json();
                const prodJson = await prodRes.json();
                const delJson = await delRes.json();
                const warJson = await warRes.json();
                const freightJson = await freightRes.json();
                const taxNoteJson = await taxNoteRes.json();
                const pfJson = await pfRes.json();
                const paymentJson = await paymentRes.json();

                const vendorMapJson = await vendorMapRes.json();
                if ((vendorMapJson.status === 'success' || vendorMapJson.status === true) && vendorMapJson.data) {
                    setVendorMappings(vendorMapJson.data);
                }

                if (empJson.status && empJson.data) setEngineerOptions(empJson.data.map(e => ({ value: e.id, label: e.name })));
                if (custJson.status && custJson.data) {
                    // Deduplicate customers by name
                    const uniqueCustomers = Array.from(new Map(custJson.data.map(c => [(c.name || '').trim().toUpperCase(), c])).values());
                    setCustomerOptions(uniqueCustomers.map(c => ({ value: c.id, label: c.name })));
                }
                if (cityJson.status && cityJson.data) setCityOptions(cityJson.data.map(c => ({ value: c.id, label: c.name })));

                // Keep percentage if available in tax
                if (taxJson.status && taxJson.data) {
                    const uniqueTaxes = Array.from(new Map(taxJson.data.map(t => [(t.name || '').trim().toUpperCase(), t])).values());
                    setTaxOptions(uniqueTaxes.map(t => ({
                        value: t.id,
                        label: `${t.name} (${t.percentage !== undefined && t.percentage !== null ? t.percentage : 0}%)`,
                        percentage: t.percentage !== undefined && t.percentage !== null ? t.percentage : 0,
                        id: t.id
                    })));
                }

                const extractData = (json) => Array.isArray(json) ? json : (json?.data || []);

                setProductOptions(extractData(prodJson).map(p => ({ value: p.id, label: p.name, price: p.price })));
                setDeliveryOptions([{ value: '', label: 'select' }, ...extractData(delJson).map(d => ({ value: d.id, label: d.name }))]);
                setWarrantyOptions([{ value: '', label: 'select' }, ...extractData(warJson).map(w => ({ value: w.id, label: w.name }))]);
                setFreightOptions([{ value: '', label: 'select' }, ...extractData(freightJson).map(f => ({ value: f.id, label: f.name }))]);
                setTaxNoteOptions([{ value: '', label: 'select' }, ...extractData(taxNoteJson).map(t => ({ value: t.id, label: t.name }))]);
                setPnfOptions([{ value: '', label: 'select' }, ...extractData(pfJson).map(p => ({ value: p.id, label: p.name }))]);
                setPaymentOptions([{ value: '', label: 'select' }, ...extractData(paymentJson).map(p => ({ value: p.id, label: p.name }))]);

            } catch (err) {
                console.error('Error fetching dropdowns:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDropdowns();
    }, []);

    const handleCustomerChange = async (selectedOption) => {
        setFormData(prev => ({ ...prev, customerId: selectedOption }));
        if (!selectedOption) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/customers/${selectedOption.value}`);
            const json = await res.json();
            if (json.status === 'success' && json.data) {
                const c = json.data;
                const matchedCity = cityOptions.find(opt => opt.value === c.city_id);
                setFormData(prev => ({
                    ...prev,
                    billingAddress1: c.billing_address1 || '',
                    billingAddress2: c.billing_address2 || '',
                    billingAddress3: c.billing_address3 || '',
                    pincode: c.pincode || '',
                    mobileNumber1: c.mobile_number1 || '',
                    mobileNumber2: c.mobile_number2 || '',
                    landlineNo: c.landline_number || '',
                    email: c.email || '',
                    website: c.website || '',
                    contactPerson: c.cust_contact_name || '',
                    designation: c.cust_designation || '',
                    contactNumber: c.contact_number || c.mobile_number2 || c.mobile_number1 || '',
                    convenientTime: c.convenient_time || (c.time_from ? (c.time_from + (c.time_to ? ' to ' + c.time_to : '')) : ''),
                    city: matchedCity || null
                }));
            }
        } catch (err) {
            console.error('Error fetching customer details:', err);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'freightValue') {
                const num = Number(value) || 0;
                if (num > 0 && freightOptions && freightOptions.length > 0) {
                    const includedOpt = freightOptions.find(o => o.label.toLowerCase().includes('included') || o.label.toLowerCase().includes('charge'));
                    if (includedOpt) {
                        next.frightDropdown = includedOpt;
                    }
                } else if (num === 0) {
                    const selectOpt = freightOptions?.find(o => o.value === '');
                    next.frightDropdown = selectOpt || { value: '', label: 'select' };
                }
            }
            return next;
        });
    };





    const rsStyles = {
        control: (provided) => ({ ...provided, background: '#fff', minHeight: '36px' }),
        menu: (provided) => ({ ...provided, zIndex: 9999, width: 'max-content', minWidth: '100%' }),
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    const [products, setProducts] = useState([
        { productId: null, productName: '', qty: 1, rate: 0, discount: 0, buyback: 0, pnf: 0, tax: 18, taxId: null, basic: 0, amount: 0, pnfAmount: 0, taxAmount: 0 }
    ]);

    const updateProduct = (index, field, value) => {
        setProducts(prev => {
            const next = [...prev];
            if (field === 'tax') value = Number(value) || 0;
            next[index] = { ...next[index], [field]: value };

            // Instant frontend calculation to match backend for instant UI response
            const qty = Number(next[index].qty) || 0;
            const rate = Number(next[index].rate) || 0;
            const discount = Number(next[index].discount) || 0;
            const buyback = Number(next[index].buyback) || 0;
            const pnf = Number(next[index].pnf) || 0;
            const tax = Number(next[index].tax) || 0;

            const basic = (qty * rate) - discount - buyback;
            const pnfAmt = basic * (pnf / 100);
            const taxableAmt = basic + pnfAmt;
            const taxAmt = taxableAmt * (tax / 100);
            const amount = taxableAmt + taxAmt;

            next[index].basic = Number(basic.toFixed(2));
            next[index].pnfAmount = Number(pnfAmt.toFixed(2));
            next[index].taxAmount = Number(taxAmt.toFixed(2));
            next[index].amount = Number(amount.toFixed(2));

            return next;
        });
    };

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            const hasValidProduct = products.some(p => p.productId || p.productName);
            if (!hasValidProduct) return;

            try {
                const payload = {
                    customer_id: formData.customerId?.value || null,
                    enquiry_date: formData.date || new Date().toISOString().split('T')[0],
                    cash_discount: Number(formData.cashDiscount) || 0,
                    details: products.map(p => ({
                        product_id: p.productId || null,
                        product_name: p.productName || '',
                        quantity: Number(p.qty) || 0,
                        original_rate: Number(p.rate) || 0,
                        discount: Number(p.discount) || 0,
                        buyback: Number(p.buyback) || 0,
                        pf: Number(p.pnf) || 0,
                        tax_percentage: Number(p.tax) || 0
                    }))
                };

                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const json = await res.json();
                if (json.status === 'success' && json.data) {
                    const calcDetails = json.data.details || [];
                    setProducts(prev => {
                        if (prev.length !== calcDetails.length) return prev;

                        let hasChanged = false;
                        const next = prev.map((p, idx) => {
                            const calc = calcDetails[idx];
                            if (!calc) return p;

                            const newBasic = calc.calculated_basic || 0;
                            const newPnfAmt = calc.calculated_pf_amount || 0;
                            const newTaxAmt = calc.calculated_tax_amount || 0;
                            const newAmt = calc.calculated_total_value || 0;

                            if (p.basic !== newBasic || p.pnfAmount !== newPnfAmt || p.taxAmount !== newTaxAmt || p.amount !== newAmt) {
                                hasChanged = true;
                                return {
                                    ...p,
                                    basic: newBasic,
                                    pnfAmount: newPnfAmt,
                                    taxAmount: newTaxAmt,
                                    amount: newAmt
                                };
                            }
                            return p;
                        });
                        return hasChanged ? next : prev;
                    });
                }
            } catch (err) {
                console.error("Calculation API error:", err);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [
        JSON.stringify(products.map(p => ({
            productId: p.productId,
            qty: p.qty,
            rate: p.rate,
            discount: p.discount,
            buyback: p.buyback,
            pnf: p.pnf,
            tax: p.tax
        }))),
        formData.customerId,
        formData.date
    ]);

    const addProductRow = () => {
        setProducts([...products, { productId: null, productName: '', qty: 1, rate: 0, discount: 0, buyback: 0, pnf: 0, tax: 18, taxId: null, basic: 0, amount: 0, pnfAmount: 0, taxAmount: 0 }]);
    };

    const handleNewCustomerCreated = (newCustomerData) => {
        if (!newCustomerData || !newCustomerData.id) return;
        const newOption = { value: newCustomerData.id, label: newCustomerData.name };
        setCustomerOptions(prev => {
            if (!prev.some(opt => opt.value === newOption.value)) {
                return [...prev, newOption];
            }
            return prev;
        });

        const matchedCity = cityOptions.find(opt => opt.value === newCustomerData.city_id);

        setFormData(prev => ({
            ...prev,
            customerId: newOption,
            billingAddress1: newCustomerData.address1 || '',
            billingAddress2: newCustomerData.address2 || '',
            billingAddress3: newCustomerData.address3 || '',
            pincode: newCustomerData.pincode || '',
            mobileNumber1: newCustomerData.mobile_number1 || '',
            mobileNumber2: newCustomerData.mobile_number2 || '',
            landlineNo: newCustomerData.phone_number || '',
            email: newCustomerData.email1 || '',
            website: newCustomerData.website || '',
            contactPerson: '',
            designation: '',
            contactNumber: newCustomerData.mobile_number1 || '',
            city: matchedCity || null
        }));
    };

    const handleNewReferredCustomerCreated = (newCustomerData) => {
        if (!newCustomerData || !newCustomerData.id) return;
        const newOption = { value: newCustomerData.id, label: newCustomerData.name };
        setCustomerOptions(prev => {
            if (!prev.some(opt => opt.value === newOption.value)) {
                return [...prev, newOption];
            }
            return prev;
        });
        setFormData(prev => ({ ...prev, referredBy: newOption }));
    };

    const deleteProductRow = (index) => {
        if (products.length <= 1) return; // don't delete last row
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.customerId) newErrors.customerId = "Customer Name is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.committedDate) newErrors.committedDate = "Committed Date is required";
        if (!formData.mobileNumber1) newErrors.mobileNumber1 = "Mobile Number1 is required";
        if (!formData.date) newErrors.date = "Date is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setErrors({});
        setSubmitPopupOpen(true);
    };

    const submitForm = async () => {
        setSubmitPopupOpen(false);
        setLoading(true);
        try {
            let parsedTimeFrom = '00:00:00';
            let parsedTimeTo = '00:00:00';
            if (formData.convenientTime) {
                const parts = formData.convenientTime.split('to');
                const t1 = parts[0]?.trim();
                const t2 = parts[1]?.trim();
                const isValidTime = (t) => /^([01]\d|2[0-3]):?([0-5]\d)(:?[0-5]\d)?$/.test(t) || /^([01]?\d|2[0-3])(:[0-5]\d)?\s?(AM|PM|am|pm)$/.test(t);

                const formatTime = (t) => {
                    if (!t) return '00:00:00';
                    let [time, modifier] = t.split(' ');
                    if (!modifier) modifier = t.match(/(AM|PM|am|pm)/i)?.[0];
                    time = time.replace(/(AM|PM|am|pm)/i, '');
                    let [hours, minutes, seconds] = time.split(':');
                    hours = parseInt(hours || 0, 10);
                    if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
                    return `${hours.toString().padStart(2, '0')}:${(minutes || '00').toString().padStart(2, '0')}:${(seconds || '00').toString().padStart(2, '0')}`;
                };
                if (t1) parsedTimeFrom = formatTime(t1);
                if (t2) parsedTimeTo = formatTime(t2);
            }

            const payload = {
                customer_id: formData.customerId?.value || null,
                enquiry_date: formData.date || new Date().toISOString().split('T')[0],
                last_committed_date: formData.committedDate || new Date().toISOString().split('T')[0],
                business_vertical_id: formData.businessVertical?.value || 1,
                enquiry_source_id: 2,
                allotted_id: formData.engineerName?.value || 0,
                referred_by: formData.referredBy?.value || 0,
                referred_by_name: formData.referredBy?.label || '',
                project_name: '',
                team_members: '',
                enquiry_status_id: 1,
                mobile_number1: formData.mobileNumber1 || '',
                mobile_number2: formData.mobileNumber2 || formData.contactNumber || '',
                landline_number: formData.landlineNo || '',
                website: formData.website || '',
                email: formData.email || '',
                billing_address1: formData.billingAddress1 || '',
                billing_address2: formData.billingAddress2 || '',
                billing_address3: formData.billingAddress3 || '',
                city_id: formData.city?.value || null,
                customer_state_id: 5,
                pincode: formData.pincode || '',
                remark_id: 3,
                status: 1,
                freight: Number(formData.freightValue) || 0,
                cash_discount: Number(formData.cashDiscount) || 0,
                pf: formData.pnf?.value || 0,
                tax: formData.taxNote?.value || 0,
                payment: formData.payment?.value || 0,
                delivery: formData.delivery?.value || 0,
                warranty: formData.warranty?.value || 0,
                fright_id: formData.frightDropdown?.value || 0,
                customer_remark: formData.remarks || '',
                cust_contact_name: formData.contactPerson || '',
                cust_designation: formData.designation || '',
                time_from: parsedTimeFrom,
                time_to: parsedTimeTo,
                details: products.map(p => ({
                    product_id: p.productId || null,
                    vendor_product_mapping_id: vendorMappings.find(v => v.product_id == p.productId)?.id || 0,
                    product_name: p.productName || '',
                    quantity: Number(p.qty) || 0,
                    units: 1,
                    original_rate: Number(p.rate) || 0,
                    discount: Number(p.discount) || 0,
                    buyback: Number(p.buyback) || 0,
                    pf: Number(p.pnf) || 0,
                    tax_percentage: Number(p.tax) || 0,
                    tax_id: p.taxId || 1,
                    product_description: "",
                    problem_description: "",
                    service_remark: ""
                }))
            };

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.status === 'success') {
                navigate('/enquiry');
            } else {
                console.error('Create failed:', json);
                alert('Failed to save: ' + (json.message || 'Unknown error') + (json.error ? '\nDetails: ' + json.error : ''));
            }
        } catch (error) {
            console.error('Error saving enquiry:', error);
            alert('An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = Math.round(products.reduce((s, p) => s + Number(p.amount || 0), 0)).toFixed(2);
    const totalBasic = products.reduce((s, p) => s + Number(p.basic || 0), 0).toFixed(2);
    const totalPnf = products.reduce((s, p) => s + Number(p.pnfAmount || 0), 0).toFixed(2);
    const totalTax = products.reduce((s, p) => s + Number(p.taxAmount || 0), 0).toFixed(2);

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between sm:tw-items-center tw-gap-3">
                        <h3 className="card-title max-[768px]:tw-text-center max-[768px]:tw-w-full max-[350px]:tw-whitespace-nowrap max-[350px]:tw-text-lg">Add Enquiry</h3>
                        <div className="tw-flex max-[425px]:tw-flex-col tw-gap-2 max-[425px]:tw-w-full">
                            <button className="btn-header-back max-[425px]:tw-w-full" onClick={() => navigate('/enquiry')}> Back
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <style>{`.btn-add-small{position:absolute;top:-10px;right:10px;width:20px;height:20px;border-radius:50%;background-color:#ff7a00;color:#fff;border:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.15);transition:background-color .15s ease,transform .08s ease;font-weight:600}.btn-add-small:hover{background-color:#ff6600;transform:translateY(-1px)} .btn-add-small:focus{outline:none;box-shadow:0 0 0 3px rgba(255,122,0,0.18)}`}</style>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Business Vertical</label>
                                    <Select options={verticalOptions} value={formData.businessVertical} onChange={opt => handleChange('businessVertical', opt)} placeholder="Choose a Vertical" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Engineer Name</label>
                                    <Select options={engineerOptions} value={formData.engineerName} onChange={opt => handleChange('engineerName', opt)} placeholder="Choose a Person" />
                                </div>
                                <div className="col-md-3 form-group" style={{ position: 'relative' }}>
                                    <button type="button" className="popup-icon" aria-label="Add customer" onClick={() => { setNewCustomerName(''); setShowCustomerPopup(true); }}><i className="bi bi-plus-lg" /></button>
                                    <label>Customer Name ({customerOptions.length}) <span className="text-danger">*</span></label>
                                    <Select
                                        options={customerOptions}
                                        value={formData.customerId}
                                        onChange={handleCustomerChange}
                                        placeholder="Choose a Customer"
                                        noOptionsMessage={({ inputValue }) => (
                                            <div className="tw-p-2 tw-text-center">
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setNewCustomerName(inputValue);
                                                        setShowCustomerPopup(true);
                                                    }}
                                                    className="btn btn-sm btn-primary tw-w-full tw-py-2 tw-font-semibold"
                                                >
                                                    <i className="bi bi-plus-lg tw-mr-2" />
                                                    Add new "{inputValue}"
                                                </button>
                                            </div>
                                        )}
                                    />
                                    {errors.customerId && <span className="text-danger tw-text-xs mt-1 tw-block">{errors.customerId}</span>}
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Billing Address1</label>
                                    <input type="text" className="form-control" value={formData.billingAddress1} onChange={e => handleChange('billingAddress1', e.target.value)} placeholder="Billing Address1" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Billing Address2</label>
                                    <input type="text" className="form-control" value={formData.billingAddress2} onChange={e => handleChange('billingAddress2', e.target.value)} placeholder="Billing Address2" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Billing Address3</label>
                                    <input type="text" className="form-control" value={formData.billingAddress3} onChange={e => handleChange('billingAddress3', e.target.value)} placeholder="Billing Address3" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Pincode</label>
                                    <input type="text" className="form-control" value={formData.pincode} onChange={e => handleChange('pincode', e.target.value)} placeholder="Pincode" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select options={cityOptions} value={formData.city} onChange={opt => handleChange('city', opt)} placeholder="Choose a City" />
                                    {errors.city && <span className="text-danger tw-text-xs mt-1 tw-block">{errors.city}</span>}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Committed Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" value={formData.committedDate || ''} onChange={e => handleChange('committedDate', e.target.value)} />
                                    {errors.committedDate && <span className="text-danger tw-text-xs mt-1 tw-block">{errors.committedDate}</span>}
                                </div>
                                <div className="col-md-3 form-group" style={{ position: 'relative' }}>
                                    <button type="button" className="popup-icon" aria-label="Add referrer" onClick={() => { setNewReferredName(''); setShowReferredPopup(true); }}><i className="bi bi-plus-lg" /></button>
                                    <label>Referred By</label>
                                    <Select
                                        options={customerOptions}
                                        value={formData.referredBy}
                                        onChange={opt => handleChange('referredBy', opt)}
                                        placeholder="Referred By"
                                        noOptionsMessage={({ inputValue }) => (
                                            <div className="tw-p-2 tw-text-center">
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setNewReferredName(inputValue);
                                                        setShowReferredPopup(true);
                                                    }}
                                                    className="btn btn-sm btn-primary tw-w-full tw-py-2 tw-font-semibold"
                                                >
                                                    <i className="bi bi-plus-lg tw-mr-2" />
                                                    Add new "{inputValue}"
                                                </button>
                                            </div>
                                        )}
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Mobile Number1 <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" value={formData.mobileNumber1} onChange={e => handleChange('mobileNumber1', e.target.value)} placeholder="Mobile Number1" />
                                    {errors.mobileNumber1 && <span className="text-danger tw-text-xs mt-1 tw-block">{errors.mobileNumber1}</span>}
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Mobile Number2</label>
                                    <input type="text" className="form-control" value={formData.mobileNumber2} onChange={e => handleChange('mobileNumber2', e.target.value)} placeholder="Mobile Number2" />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Landline No</label>
                                    <input type="text" className="form-control" value={formData.landlineNo} onChange={e => handleChange('landlineNo', e.target.value)} placeholder="Landline No" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Email</label>
                                    <input type="email" className="form-control" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="Email" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Website</label>
                                    <input type="text" className="form-control" value={formData.website} onChange={e => handleChange('website', e.target.value)} placeholder="Website" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" value={formData.date || ''} onChange={e => handleChange('date', e.target.value)} />
                                    {errors.date && <span className="text-danger tw-text-xs mt-1 tw-block">{errors.date}</span>}
                                </div>
                            </div>

                            {/* Tabs Section */}
                            <div className="tw-mt-8">
                                <div className="tw-flex tw-mb-6">
                                    <button
                                        type="button"
                                        className={`tw-py-2.5 tw-px-8 tw-font-semibold tw-text-sm tw-border tw-transition-colors tw-duration-200 ${activeTab === 'Customer Profile' ? 'tw-border-blue-600 tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700 hover:tw-border-blue-700' : 'tw-border-gray-300 tw-text-gray-600 tw-bg-white hover:tw-bg-blue-50 hover:tw-text-blue-600 hover:tw-border-blue-200'}`}
                                        onClick={() => setActiveTab('Customer Profile')}
                                    >
                                        Customer Profile
                                    </button>
                                    <button
                                        type="button"
                                        className={`tw-py-2.5 tw-px-8 tw-font-semibold tw-text-sm tw-border tw-border-l-0 tw-transition-colors tw-duration-200 ${activeTab === 'Product Details' ? 'tw-border-blue-600 tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700 hover:tw-border-blue-700' : 'tw-border-gray-300 tw-text-gray-600 tw-bg-white hover:tw-bg-blue-50 hover:tw-text-blue-600 hover:tw-border-blue-200'}`}
                                        onClick={() => setActiveTab('Product Details')}
                                    >
                                        Product Details
                                    </button>
                                </div>

                                <div className="tw-bg-slate-50/50 tw-p-6 tw-rounded-lg tw-border tw-border-gray-100">
                                    {activeTab === 'Customer Profile' && (
                                        <div className="row">
                                            <div className="col-md-3 form-group">
                                                <label>Contact Person</label>
                                                <input type="text" className="form-control" value={formData.contactPerson} onChange={e => handleChange('contactPerson', e.target.value)} placeholder="Contact Person" />
                                            </div>
                                            <div className="col-md-3 form-group">
                                                <label>Designation</label>
                                                <input type="text" className="form-control" value={formData.designation} onChange={e => handleChange('designation', e.target.value)} placeholder="Designation" />
                                            </div>
                                            <div className="col-md-3 form-group">
                                                <label>Contact Number</label>
                                                <input type="text" className="form-control" value={formData.contactNumber} onChange={e => handleChange('contactNumber', e.target.value)} placeholder="Contact Number" />
                                            </div>
                                            <div className="col-md-3 form-group">
                                                <label>Convenient Time</label>
                                                <input type="time" className="form-control" value={formData.convenientTime} onChange={e => handleChange('convenientTime', e.target.value)} placeholder="Convenient Time" />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'Product Details' && (
                                        <div className="tw-mt-2">
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="table table-bordered tw-w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>Product Name</th>
                                                            <th>Qty</th>
                                                            <th>Rate</th>
                                                            <th>Discount</th>
                                                            <th>Buyback</th>
                                                            <th>Basic</th>
                                                            <th>P&F(%)</th>
                                                            <th>Tax(%)</th>
                                                            <th>Amount</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {products.map((row, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ minWidth: 350 }}>
                                                                    <Select
                                                                        options={productOptions}
                                                                        value={productOptions.find(o => o.value == row.productId) || null}
                                                                        onChange={opt => {
                                                                            updateProduct(idx, 'productName', opt ? opt.label : '');
                                                                            updateProduct(idx, 'productId', opt ? opt.value : null);
                                                                            // Set rate to price or 0 if null/missing
                                                                            if (opt) updateProduct(idx, 'rate', opt.price || 0);
                                                                        }}
                                                                        placeholder="Select Product"
                                                                        styles={rsStyles}
                                                                        menuPortalTarget={document.body}
                                                                        menuPosition="fixed"
                                                                    />
                                                                </td>
                                                                <td style={{ minWidth: 90 }}>
                                                                    <input type="text" value={row.qty} onChange={(e) => updateProduct(idx, 'qty', e.target.value)} className="form-control" style={{ minWidth: '90px', width: row.qty ? `${row.qty.toString().length + 2}ch` : 'auto' }} />
                                                                </td>
                                                                <td style={{ minWidth: 120 }}>
                                                                    <input type="text" value={row.rate} onChange={(e) => updateProduct(idx, 'rate', e.target.value)} className="form-control" style={{ minWidth: '120px', width: row.rate ? `${row.rate.toString().length + 2}ch` : 'auto' }} />
                                                                </td>
                                                                <td style={{ minWidth: 120 }}>
                                                                    <input type="text" value={row.discount} onChange={(e) => updateProduct(idx, 'discount', e.target.value)} className="form-control" style={{ minWidth: '120px', width: row.discount ? `${row.discount.toString().length + 2}ch` : 'auto' }} />
                                                                </td>
                                                                <td style={{ minWidth: 120 }}>
                                                                    <input type="text" value={row.buyback} onChange={(e) => updateProduct(idx, 'buyback', e.target.value)} className="form-control" style={{ minWidth: '120px', width: row.buyback ? `${row.buyback.toString().length + 2}ch` : 'auto' }} />
                                                                </td>
                                                                <td style={{ minWidth: 120 }}>
                                                                    <input value={row.basic} readOnly className="form-control" style={{ minWidth: '120px', width: row.basic ? `${row.basic.toString().length + 2}ch` : 'auto' }} />
                                                                </td>
                                                                <td style={{ minWidth: 120 }}>
                                                                    <div>
                                                                        <input type="text" value={row.pnf} onChange={(e) => updateProduct(idx, 'pnf', e.target.value)} className="form-control" placeholder="P&F %" style={{ minWidth: '120px', width: row.pnf ? `${row.pnf.toString().length + 2}ch` : 'auto' }} />
                                                                        <input value={row.pnfAmount || 0} readOnly className="form-control tw-mt-2" placeholder="P&F amt" style={{ minWidth: '120px', width: row.pnfAmount ? `${row.pnfAmount.toString().length + 2}ch` : 'auto' }} />
                                                                    </div>
                                                                </td>
                                                                <td style={{ minWidth: 160 }}>
                                                                    <div>
                                                                        <Select
                                                                            options={taxOptions}
                                                                            styles={{
                                                                                ...rsStyles,
                                                                                menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                                            }}
                                                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                                            menuPosition="fixed"
                                                                            value={taxOptions.find(o => o.id === row.taxId) || taxOptions.find(o => Number(o.percentage) === Number(row.tax))}
                                                                            onChange={(opt) => {
                                                                                updateProduct(idx, 'tax', opt ? opt.percentage : 0);
                                                                                updateProduct(idx, 'taxId', opt ? opt.id : null);
                                                                            }}
                                                                        />
                                                                        <input value={row.taxAmount || 0} readOnly className="form-control tw-mt-2" placeholder="Tax amt" style={{ minWidth: '160px', width: row.taxAmount ? `${row.taxAmount.toString().length + 2}ch` : 'auto' }} />
                                                                    </div>
                                                                </td>
                                                                <td style={{ minWidth: 140 }}>
                                                                    <input value={row.amount} readOnly className="form-control" style={{ minWidth: '140px', width: row.amount ? `${row.amount.toString().length + 2}ch` : 'auto' }} />
                                                                </td>
                                                                <td style={{ width: 120 }}>
                                                                    <div className="tw-flex tw-gap-2">
                                                                        <button type="button" className="table-add" onClick={addProductRow}><i className="bi bi-plus-lg" /></button>
                                                                        <button type="button" className="table-delete" onClick={() => deleteProductRow(idx)}><i className="bi bi-trash" /></button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td style={{ fontWeight: 600 }}>{totalBasic}</td>
                                                            <td style={{ fontWeight: 600 }}>{totalPnf}</td>
                                                            <td style={{ fontWeight: 600 }}>{totalTax}</td>
                                                            <td style={{ fontWeight: 600 }}>{totalAmount}</td>
                                                            <td></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            <div className="tw-mt-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="updateQuotationAdd" />
                                                    <label className="form-check-label" htmlFor="updateQuotationAdd">Update Changes in Quotation</label>
                                                </div>
                                            </div>

                                            {/* Image/details area (totals, selects, remarks) */}
                                            <div className="tw-mt-4">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="card p-3">
                                                            <h5 className="mb-3">Tax Detail</h5>
                                                            <div style={{ overflowX: 'auto' }}>
                                                                <table className="table table-sm mb-0">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>S.No</th>
                                                                            <th>Rate</th>
                                                                            <th>Tax</th>
                                                                            <th>Tax Amount</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {products.map((p, i) => (
                                                                            <tr key={i}>
                                                                                <td>{i + 1}.</td>
                                                                                <td>{Number((Number(p.basic) || 0) + (Number(p.pnfAmount) || 0)).toFixed(2)}</td>
                                                                                <td>{p.tax ? `${p.tax}%` : '0%'}</td>
                                                                                <td>{Number(p.taxAmount || 0).toFixed(2)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="card p-3">
                                                            <div className="d-flex justify-content-between py-2"><div>Sub Total</div><div>{totalBasic}</div></div>
                                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                                <div>Cash (Discount)</div>
                                                                <div style={{ width: 140 }}><input type="number" className="form-control" value={formData.cashDiscount} onChange={e => handleChange('cashDiscount', e.target.value)} /></div>
                                                            </div>
                                                            <hr />
                                                            <div className="d-flex justify-content-between py-2"><div>Total Tax</div>
                                                                <div>
                                                                    {(() => {
                                                                        const cashDiscount = Number(formData.cashDiscount || 0);
                                                                        let totalTaxableBase = 0;
                                                                        products.forEach(p => {
                                                                            const b = Number(p.basic || 0);
                                                                            const pf = Number(p.pnfAmount || 0);
                                                                            totalTaxableBase += (b + pf);
                                                                        });
                                                                        
                                                                        let newTotalTax = 0;
                                                                        products.forEach(p => {
                                                                            const b = Number(p.basic || 0);
                                                                            const pf = Number(p.pnfAmount || 0);
                                                                            const base = b + pf;
                                                                            let allocatedDiscount = 0;
                                                                            if (totalTaxableBase > 0) {
                                                                                allocatedDiscount = cashDiscount * (base / totalTaxableBase);
                                                                            }
                                                                            const discountedBase = Math.max(0, base - allocatedDiscount);
                                                                            const taxRate = Number(p.tax || 0);
                                                                            newTotalTax += discountedBase * (taxRate / 100);
                                                                        });
                                                                        return newTotalTax.toFixed(2);
                                                                    })()}
                                                                </div>
                                                            </div>
                                                            <hr />
                                                            <div className="d-flex justify-content-between py-2"><div>IGST</div><div>0.00</div></div>
                                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                                <div>Freight Value</div>
                                                                <div style={{ width: 140 }}><input type="number" className="form-control" value={formData.freightValue} onChange={e => handleChange('freightValue', e.target.value)} /></div>
                                                            </div>
                                                            <div className="d-flex justify-content-between py-3 fw-bold bg-light px-2 mt-3 rounded" style={{ color: 'var(--brand-color)' }}>
                                                                <div>Total</div>
                                                                <div>
                                                                    {(() => {
                                                                        const cashDiscount = Number(formData.cashDiscount || 0);
                                                                        let totalTaxableBase = 0;
                                                                        products.forEach(p => {
                                                                            const b = Number(p.basic || 0);
                                                                            const pf = Number(p.pnfAmount || 0);
                                                                            totalTaxableBase += (b + pf);
                                                                        });
                                                                        
                                                                        let newTotalTax = 0;
                                                                        products.forEach(p => {
                                                                            const b = Number(p.basic || 0);
                                                                            const pf = Number(p.pnfAmount || 0);
                                                                            const base = b + pf;
                                                                            let allocatedDiscount = 0;
                                                                            if (totalTaxableBase > 0) {
                                                                                allocatedDiscount = cashDiscount * (base / totalTaxableBase);
                                                                            }
                                                                            const discountedBase = Math.max(0, base - allocatedDiscount);
                                                                            const taxRate = Number(p.tax || 0);
                                                                            newTotalTax += discountedBase * (taxRate / 100);
                                                                        });
                                                                        
                                                                        return Math.round(Number(totalBasic) + Number(totalPnf) + newTotalTax + Number(formData.freightValue || 0) - cashDiscount).toFixed(2);
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-md-4 form-group">
                                                        <label>P&F</label>
                                                        <Select options={pnfOptions} value={formData.pnf} onChange={opt => handleChange('pnf', opt)} placeholder="select" />
                                                    </div>
                                                    <div className="col-md-4 form-group">
                                                        <label>Tax note</label>
                                                        <Select options={taxNoteOptions} value={formData.taxNote} onChange={opt => handleChange('taxNote', opt)} placeholder="select" />
                                                    </div>
                                                    <div className="col-md-4 form-group">
                                                        <label>Payment</label>
                                                        <Select options={paymentOptions} value={formData.payment} onChange={opt => handleChange('payment', opt)} placeholder="select" />
                                                    </div>
                                                    <div className="col-md-4 form-group">
                                                        <label>Delivery</label>
                                                        <Select options={deliveryOptions} value={formData.delivery} onChange={opt => handleChange('delivery', opt)} placeholder="select" />
                                                    </div>
                                                    <div className="col-md-4 form-group">
                                                        <label>Warranty</label>
                                                        <Select options={warrantyOptions} value={formData.warranty} onChange={opt => handleChange('warranty', opt)} placeholder="select" />
                                                    </div>
                                                    <div className="col-md-4 form-group">
                                                        <label>Fright</label>
                                                        <Select options={freightOptions} value={formData.frightDropdown} onChange={opt => handleChange('frightDropdown', opt)} placeholder="select" />
                                                    </div>
                                                    <div className="col-md-12 form-group">
                                                        <label>Remarks</label>
                                                        <textarea className="form-control" rows={3} value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} placeholder="Remark" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-actions mt-3 tw-flex max-[425px]:tw-flex-col tw-justify-between tw-gap-3">
                                <button type="button" className="btn-cancel max-[425px]:tw-w-full" onClick={() => navigate('/enquiry')}>Cancel</button>
                                <button type="submit" className="btn-save max-[425px]:tw-w-full">Save Enquiry</button>
                            </div>
                        </form>

                        <CustomerPopup isOpen={showCustomerPopup} onClose={() => setShowCustomerPopup(false)} onSubmit={handleNewCustomerCreated} initialName={newCustomerName} />
                        <ReferredCustomerPopup isOpen={showReferredPopup} onClose={() => setShowReferredPopup(false)} onSubmit={handleNewReferredCustomerCreated} initialName={newReferredName} />
                        <SubmitPopup isOpen={submitPopupOpen} onClose={() => setSubmitPopupOpen(false)} onConfirm={submitForm} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EnquiryAdd;
