import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { Trash, Plus } from '@phosphor-icons/react';
import SubmitPopup from '../../../components/Popup/SubmitPopup.jsx';
import { useLoader } from '../../../context/LoaderContext';



const paymentTermsOptions = [
    { value: 'card_payment', label: 'CARD PAYMENT' },
    { value: 'cash', label: 'CASH' },
    { value: 'cheque', label: 'CHEQUE' },
    { value: 'g_pay', label: 'G. PAY' },
    { value: 'neft', label: 'NEFT' },
    { value: 'phone_pay', label: 'PHONE PAY' },
];

const InvoiceEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setLoading } = useLoader();
    const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitPopupOpen(false);
        setLoading(true);

        const payload = {
            total_spares_value: products.reduce((acc, p) => acc + (Number(p.qty) * Number(p.rate)), 0),
            total_labour_value: 0,
            discount_percent: 0,
            discount_amount: formData.discount || 0,
            freight: freightValue || 0,
            net_invoice_value: formData.netAmount || 0,
            paid_amount: formData.totalPaidAmount || formData.advanceAmount || 0,
            balance_amount: formData.receivableAmount || 0,
            round_off: 0,
            remark: formData.remark,
            invoice_date: formData.date,
            delivery_address_1: deliveryDetails.address1,
            delivery_address_2: deliveryDetails.address2,
            delivery_address_3: deliveryDetails.address3,
            delivery_pincode: deliveryDetails.pincode,
            delivery_city: deliveryDetails.city?.value || deliveryDetails.city || '',
            delivery_phone: deliveryDetails.phoneNumber,
            items: products.map(p => ({
                enquiry_detail_id: p.id || 0,
                product_description: p.productName || '',
                quantity: p.qty,
                rate: p.rate,
                discount: p.discount,
                pf: p.pnf,
                buyback: p.buyback
            }))
        };

        try {
            const token = sessionStorage.getItem('erp_token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            // 1. Update Customer Profile first
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/update-customer-profile/${id}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    address1: formData.address1,
                    address2: formData.address2,
                    address3: formData.address3,
                    city_id: formData.city?.value || null,
                    gstin: formData.gstin,
                    contactRows
                })
            });

            // 2. Submit Invoice
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/invoice/submit/${id}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.status) {
                navigate(-1);
            } else {
                console.error("Submit failed:", data.message);
            }
        } catch (error) {
            console.error("Error submitting invoice:", error);
        } finally {
            setLoading(false);
        }
    };
    const [activeTab, setActiveTab] = useState('Customer Profile');
    const [cityOptions, setCityOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/geolocation?type=city&state_id=30`, { headers });
                const json = await res.json();
                if (json.status && Array.isArray(json.data)) {
                    setCityOptions(json.data.map(c => ({ value: c.id, label: c.name })));
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        const fetchEmployees = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/employee`, { headers });
                const json = await res.json();
                if (json.status && Array.isArray(json.data)) {
                    setEmployeeOptions(json.data.map(e => ({ value: e.id, label: e.name })));
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        const fetchInvoiceNumber = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/generate-invoice-number`, { headers });
                const json = await res.json();
                if (json.status && json.invoice_number) {
                    setFormData(prev => ({ ...prev, invoiceNumber: json.invoice_number }));
                }
            } catch (error) {
                console.error("Error fetching invoice number:", error);
            }
        };
        fetchCities();
        fetchEmployees();
        fetchInvoiceNumber();
    }, []);

    const today = new Date();
    const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Field States
    const [formData, setFormData] = useState({
        date: currentDate,
        invoiceNumber: '',
        customerName: '',
        enquiryNumber: '',
        allottedTo: null,
        jobCardNumber: '',
        jobCardDate: '',
        address1: '',
        address2: '',
        address3: '',
        city: null,
        enquiryDate: '',
        gstin: '',
        advanceAmount: '0.00',
        netAmount: '0.00',
        loanAmount: '0.00',
        discount: '0.00',
        totalPaidAmount: '0.00',
        receivableAmount: '0.00',
        cashDiscount: 0,
        remark: '',
        paymentTerms: null
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [freightValue, setFreightValue] = useState(0);

    useEffect(() => {
        const fetchInvoiceData = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/invoice/${id}`, { headers });
                const json = await res.json();

                if (json.status && json.data) {
                    const { customer_profile, invoice_header, enquiry_products } = json.data;

                    if (customer_profile) {
                        setFormData(prev => ({
                            ...prev,
                            customerName: customer_profile.customer_name || '',
                            enquiryNumber: customer_profile.enquiry_no || '',
                            address1: customer_profile.address1 || '',
                            address2: customer_profile.address2 || '',
                            address3: customer_profile.address3 || '',
                            city: customer_profile.city_id ? { value: customer_profile.city_id, label: customer_profile.city } : null,
                            enquiryDate: customer_profile.enquiry_date ? customer_profile.enquiry_date.split('/').reverse().join('-') : '',
                            allottedTo: customer_profile.allotted_to ? { label: customer_profile.allotted_to, value: customer_profile.allotted_to } : null,
                            jobCardNumber: customer_profile.jobcard_number || customer_profile.enquiry_no || '',
                            jobCardDate: customer_profile.jobcard_date || (customer_profile.enquiry_date ? customer_profile.enquiry_date.split('/').reverse().join('-') : '') || '',
                            gstin: customer_profile.gstin || '',
                            date: invoice_header && invoice_header.invoice_date ? invoice_header.invoice_date : currentDate,
                            discount: invoice_header ? invoice_header.discount_amount : '0.00',
                            advanceAmount: invoice_header ? invoice_header.paid_amount : '0.00',
                            cashDiscount: customer_profile.cash_discount || 0,
                            remark: invoice_header ? invoice_header.remark : '',
                            paymentTerms: invoice_header && invoice_header.payment_terms_id ? paymentTermsOptions.find(o => o.value == invoice_header.payment_terms_id) : null
                        }));

                        setContactRows([
                            {
                                id: 1,
                                contactPerson: customer_profile.contact_person || '',
                                designation: customer_profile.designation || '',
                                contactNumber: customer_profile.contact_number || ''
                            }
                        ]);

                        setFreightValue(Number(customer_profile.freight) || 0);

                        // Fetch total advance amount for this enquiry
                        try {
                            const recRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/collections/receipts`, { headers });
                            const recJson = await recRes.json();
                            if (recJson.status && recJson.data) {
                                const receipts = recJson.data.filter(r => String(r.enq_no) === String(customer_profile.enquiry_no));
                                const totalAdvance = receipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
                                if (totalAdvance > 0) {
                                    setFormData(prev => ({ ...prev, advanceAmount: totalAdvance.toFixed(2) }));
                                }
                            }
                        } catch (e) {
                            console.error('Error fetching receipts:', e);
                        }
                    }

                    if (invoice_header) {
                        setFormData(prev => ({
                            ...prev,
                            remark: invoice_header.remark_text || '',
                            date: invoice_header.invoice_date ? invoice_header.invoice_date.split(' ')[0] : prev.date
                        }));

                        // Handle City matching
                        let mappedCity = null;
                        if (invoice_header.delivery_city) {
                            // Find in cityOptions or default to raw string with fetched name
                            const existing = cityOptions.find(c => String(c.value) === String(invoice_header.delivery_city));
                            mappedCity = existing ? existing : { value: invoice_header.delivery_city, label: invoice_header.delivery_city_name || invoice_header.delivery_city };
                        }

                        setDeliveryDetails(prev => ({
                            ...prev,
                            date: invoice_header.invoice_date ? invoice_header.invoice_date.split(' ')[0] : prev.date,
                            address1: invoice_header.delivery_address_1 || '',
                            address2: invoice_header.delivery_address_2 || '',
                            address3: invoice_header.delivery_address_3 || '',
                            pincode: invoice_header.delivery_pincode || '',
                            phoneNumber: invoice_header.delivery_phone || '',
                            city: mappedCity
                        }));
                    }

                    if (enquiry_products && enquiry_products.length > 0) {
                        setProducts(enquiry_products.map((p, idx) => ({
                            id: p.id || idx,
                            productName: p.product_name || '',
                            qty: Number(p.quantity) || 1,
                            rate: Number(p.original_rate) || 0,
                            discount: Number(p.discount) || 0,
                            buyback: Number(p.buyback) || 0,
                            pnf: Number(p.pf) || 0,
                            tax: Number(p.tax_percentage) || 18,
                            basic: Number(p.basic) || 0,
                            pnfAmount: Number(p.pf_amount) || 0,
                            taxAmount: Number(p.tax_amount) || 0,
                            amount: Number(p.total_value) || 0
                        })));
                    }
                }
            } catch (err) {
                console.error("Error fetching invoice data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceData();
    }, [id]);

    // Contact Persons table
    const [contactRows, setContactRows] = useState([]);

    const addContactRow = () => {
        setContactRows([...contactRows, { id: Date.now(), contactPerson: '', designation: '', contactNumber: '' }]);
    };

    const updateContactRow = (id, field, value) => {
        setContactRows(contactRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const deleteContactRow = (id) => {
        if (contactRows.length > 1) {
            setContactRows(contactRows.filter(row => row.id !== id));
        }
    };

    // Product Details state
    const [products, setProducts] = useState([]);

    const updateProduct = (index, field, value) => {
        const next = [...products];
        if (field === 'tax') value = Number(value) || 0;
        next[index][field] = value;
        setProducts(next);
    };

    const addProductRow = () => {
        setProducts([...products, { productName: '', qty: 1, rate: 0, discount: 0, buyback: 0, pnf: 0, tax: 18, basic: 0, amount: 0 }]);
    };

    const deleteProductRow = (index) => {
        if (products.length <= 1) return;
        setProducts(products.filter((_, i) => i !== index));
    };

    const [calcSummary, setCalcSummary] = useState({
        total_spares_value: 0,
        net_invoice_value: 0
    });

    const productDeps = JSON.stringify({
        items: products.map(p => ({ qty: p.qty, rate: p.rate, discount: p.discount, buyback: p.buyback, pnf: p.pnf, tax: p.tax })),
        freightValue,
        discount: formData.discount,
        advanceAmount: formData.advanceAmount
    });

    useEffect(() => {
        const calculateInvoiceAPI = async () => {
            const payload = {
                items: products.map(p => ({
                    quantity: Number(p.qty) || 0,
                    rate: Number(p.rate) || 0,
                    discount: Number(p.discount) || 0,
                    buyback: Number(p.buyback) || 0,
                    pf: Number(p.pnf) || 0,
                    tax_percentage: Number(p.tax) || 0,
                    product_type: 1
                })),
                freight: Number(freightValue) || 0,
                discount_amount: Number(formData.discount) || 0,
                paid_amount: Number(formData.advanceAmount) || 0,
                cash_discount: Number(formData.cashDiscount) || 0
            };

            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/invoices/invoice/calculate`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.status && result.data) {
                    setCalcSummary({
                        total_spares_value: result.data.total_spares_value || 0,
                        net_invoice_value: result.data.net_invoice_value || 0
                    });

                    setProducts(prev => prev.map((p, i) => {
                        const calcItem = result.data.items[i];
                        if (calcItem) {
                            return {
                                ...p,
                                basic: calcItem.basic,
                                pnfAmount: calcItem.pf_amount,
                                taxAmount: calcItem.tax_amount,
                                amount: calcItem.amount,
                                product_value: calcItem.product_value
                            };
                        }
                        return p;
                    }));
                }
            } catch (err) {
                console.error('Calculation error:', err);
            }
        };

        const timeout = setTimeout(() => {
            calculateInvoiceAPI();
        }, 500);
        return () => clearTimeout(timeout);
    }, [productDeps]);

    const totalBasic = products.reduce((s, p) => s + Number(p.basic || 0), 0).toFixed(2);
    const totalPnf = products.reduce((s, p) => s + Number(p.pnfAmount || 0), 0).toFixed(2);
    const totalTax = products.reduce((s, p) => s + Number(p.taxAmount || 0), 0).toFixed(2);
    const totalAmount = products.reduce((s, p) => s + Number(p.amount || 0), 0).toFixed(2);

    const totalSgst = products.reduce((s, p) => s + (p.tax === 18 ? Number(p.taxAmount || 0) / 2 : (p.tax === 9 ? Number(p.taxAmount || 0) : 0)), 0).toFixed(2);
    const totalCgst = products.reduce((s, p) => s + (p.tax === 18 ? Number(p.taxAmount || 0) / 2 : (p.tax === 9 ? Number(p.taxAmount || 0) : 0)), 0).toFixed(2);
    const totalIgst = products.reduce((s, p) => s + (p.tax === 5 ? Number(p.taxAmount || 0) : 0), 0).toFixed(2);

    const netTotal = Number(calcSummary.net_invoice_value || 0).toFixed(2);

    useEffect(() => {
        setFormData(prev => ({ ...prev, netAmount: netTotal }));
    }, [netTotal]);

    useEffect(() => {
        const netAmt = Number(formData.netAmount) || 0;
        const discountAmt = Number(formData.discount) || 0;
        const advanceAmt = Number(formData.advanceAmount) || 0;
        const receivable = (netAmt - discountAmt - advanceAmt).toFixed(2);
        setFormData(prev => ({ ...prev, receivableAmount: receivable }));
    }, [formData.netAmount, formData.discount, formData.advanceAmount]);


    // Delivery Details state
    const [deliveryDetails, setDeliveryDetails] = useState({
        date: currentDate,
        address1: '',
        address2: '',
        address3: '',
        pincode: '',
        city: null,
        phoneNumber: ''
    });


    const TABS = [
        { key: 'Customer Profile', label: 'Customer Profile' },
        { key: 'Product Details', label: 'Product Details' },
        { key: 'Delivery Details', label: 'Delivery Details' },
    ];

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card tw-mb-0">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-center tw-gap-3 sm:tw-gap-0">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Edit Invoice</h3>
                        <button className="btn-header-back" onClick={() => navigate(-1)}>Back</button>
                    </div>

                    <div className="card-body">

                        {/* Tabs Section as the FIRST element */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4">
                            {TABS.map(t => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    className={`tw-w-full sm:tw-w-auto tw-px-4 tw-py-2 tw-rounded-sm ${activeTab === t.key
                                        ? 'tw-bg-blue-600 tw-text-white'
                                        : 'tw-bg-white tw-border tw-text-gray-700'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Area */}
                        <div className="tw-min-h-[200px]">
                            {activeTab === 'Customer Profile' && (
                                <div>
                                    <div className="row">
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Invoice Number</label>
                                            <input type="text" className="form-control" value={formData.invoiceNumber} readOnly />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Customer Name</label>
                                            <input type="text" className="form-control" value={formData.customerName} onChange={e => handleChange('customerName', e.target.value)} readOnly />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>JobCard Number</label>
                                            <input type="text" className="form-control" value={formData.jobCardNumber} onChange={e => handleChange('jobCardNumber', e.target.value)} readOnly />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Enquiry Number</label>
                                            <input type="text" className="form-control" value={formData.enquiryNumber} onChange={e => handleChange('enquiryNumber', e.target.value)} readOnly />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Date <span className="text-danger">*</span></label>
                                            <input type="date" className="form-control" value={formData.date} onChange={e => handleChange('date', e.target.value)} />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Allotted To</label>
                                            <Select options={employeeOptions} value={formData.allottedTo} onChange={v => handleChange('allottedTo', v)} placeholder="Choose Employee" className="react-select-container" classNamePrefix="react-select" />
                                        </div>

                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>JobCard Date</label>
                                            <input type="date" className="form-control" value={formData.jobCardDate} onChange={e => handleChange('jobCardDate', e.target.value)} readOnly />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Address 1</label>
                                            <input type="text" className="form-control" value={formData.address1} onChange={e => handleChange('address1', e.target.value)} />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Address 2</label>
                                            <input type="text" className="form-control" value={formData.address2} onChange={e => handleChange('address2', e.target.value)} />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Address 3</label>
                                            <input type="text" className="form-control" value={formData.address3} onChange={e => handleChange('address3', e.target.value)} />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>City</label>
                                            <Select options={cityOptions} value={formData.city} onChange={v => handleChange('city', v)} placeholder="Choose City" className="react-select-container" classNamePrefix="react-select" />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>Enquiry Date</label>
                                            <input type="date" className="form-control" value={formData.enquiryDate} onChange={e => handleChange('enquiryDate', e.target.value)} />
                                        </div>
                                        <div className="col-12 col-md-3 form-group mb-3">
                                            <label>GSTIN <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={formData.gstin} onChange={e => handleChange('gstin', e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Contact Persons Table */}
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
                                                    <th style={{ width: '100px' }} className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contactRows.map((row, index) => (
                                                    <tr key={row.id}>
                                                        <td className="tw-align-middle">{index + 1}</td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Contact Person"
                                                                value={row.contactPerson}
                                                                onChange={(e) => updateContactRow(row.id, 'contactPerson', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Designation"
                                                                value={row.designation}
                                                                onChange={(e) => updateContactRow(row.id, 'designation', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Contact Number"
                                                                value={row.contactNumber}
                                                                onChange={(e) => updateContactRow(row.id, 'contactNumber', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="tw-align-middle tw-text-center">
                                                            <div className="tw-flex tw-gap-1 tw-justify-center">
                                                                <button type="button" className="btn btn-sm btn-success tw-rounded tw-px-2" onClick={addContactRow}>
                                                                    <Plus weight="bold" />
                                                                </button>
                                                                <button type="button" className="btn btn-sm btn-danger tw-rounded tw-px-2" onClick={() => deleteContactRow(row.id)}>
                                                                    <Trash weight="bold" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
                                                    <th>Quantity</th>
                                                    <th>Rate</th>
                                                    <th>Discount</th>
                                                    <th>Buyback</th>
                                                    <th>Basic</th>
                                                    <th>P&F %</th>
                                                    <th>Tax</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ minWidth: 200 }}>
                                                            <input value={row.productName} onChange={(e) => updateProduct(idx, 'productName', e.target.value)} readOnly className="form-control" />
                                                        </td>
                                                        <td style={{ width: 90 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} value={row.qty} onChange={(e) => updateProduct(idx, 'qty', e.target.value)} readOnly className="form-control" />
                                                        </td>
                                                        <td style={{ width: 120 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} value={row.rate} onChange={(e) => updateProduct(idx, 'rate', e.target.value)} readOnly className="form-control" />
                                                        </td>
                                                        <td style={{ width: 120 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} value={row.discount} onChange={(e) => updateProduct(idx, 'discount', e.target.value)} className="form-control" />
                                                        </td>
                                                        <td style={{ width: 120 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} value={row.buyback} onChange={(e) => updateProduct(idx, 'buyback', e.target.value)} className="form-control" />
                                                        </td>
                                                        <td style={{ width: 120 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} value={row.basic} onChange={(e) => updateProduct(idx, 'basic', e.target.value)} className="form-control" />
                                                        </td>
                                                        <td style={{ width: 120 }}>
                                                            <div>
                                                                <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} value={row.pnf} onChange={(e) => updateProduct(idx, 'pnf', e.target.value)} className="form-control" placeholder="P&F %" />
                                                                <input value={row.pnfAmount || 0} readOnly className="form-control tw-mt-2" placeholder="P&F amt" />
                                                            </div>
                                                        </td>
                                                        <td style={{ width: 160 }}>
                                                            <div>
                                                                <Select
                                                                    options={[
                                                                        { value: 0, label: 'NO TAX [0.00]' },
                                                                        { value: 9, label: 'SGST [9.00]' },
                                                                        { value: 5, label: 'GST [5.00]' },
                                                                        { value: 18, label: 'GST [18.00]' }
                                                                    ]}
                                                                    styles={{
                                                                        control: (provided) => ({ ...provided, background: '#fff', minHeight: '36px' }),
                                                                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                                    }}
                                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                                    menuPosition="fixed"
                                                                    value={[{ value: 0, label: 'NO TAX [0.00]' }, { value: 9, label: 'SGST [9.00]' }, { value: 5, label: 'GST [5.00]' }, { value: 18, label: 'GST [18.00]' }].find(o => Number(o.value) === Number(row.tax))}
                                                                    onChange={(opt) => updateProduct(idx, 'tax', opt ? opt.value : 0)}
                                                                />
                                                                <input value={row.taxAmount || 0} readOnly className="form-control tw-mt-2" placeholder="Tax amt" />
                                                            </div>
                                                        </td>
                                                        <td style={{ width: 140 }}>
                                                            <input value={row.amount} readOnly className="form-control" />
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
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

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
                                                    <div className="d-flex justify-content-between py-2"><div>Sub Amount</div><div>{totalBasic}</div></div>
                                                    <div className="d-flex justify-content-between py-2"><div>P&F Amount</div><div>{totalPnf}</div></div>
                                                    <hr />
                                                    <div className="d-flex justify-content-between py-2"><div>SGST</div><div>{totalSgst}</div></div>
                                                    <div className="d-flex justify-content-between py-2"><div>CGST</div><div>{totalCgst}</div></div>
                                                    <div className="d-flex justify-content-between py-2"><div>IGST</div><div>{totalIgst}</div></div>
                                                    <div className="d-flex justify-content-between align-items-center py-2">
                                                        <div>Freight Value</div>
                                                        <div style={{ width: 140 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} className="form-control" value={freightValue} onChange={(e) => setFreightValue(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 p-2 bg-light d-flex justify-content-between align-items-center">
                                                        <strong className="text-primary">Net Total</strong>
                                                        <strong className="tw-text-blue-600">{netTotal}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'Delivery Details' && (
                                <div className="tw-p-4">
                                    <div className="row">
                                        <div className="col-md-3 form-group mb-3">
                                            <label>Date <span className="text-danger">*</span>:</label>
                                            <input type="date" className="form-control tw-mt-1" value={deliveryDetails.date} onChange={e => setDeliveryDetails({ ...deliveryDetails, date: e.target.value })} />
                                        </div>
                                        <div className="col-md-3 form-group mb-3">
                                            <label>Delivery Address Line 1 <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control tw-mt-1" placeholder="Address Line 1" value={deliveryDetails.address1} onChange={e => setDeliveryDetails({ ...deliveryDetails, address1: e.target.value })} />
                                        </div>
                                        <div className="col-md-3 form-group mb-3">
                                            <label>Delivery Address Line 2 <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control tw-mt-1" placeholder="Address Line 2" value={deliveryDetails.address2} onChange={e => setDeliveryDetails({ ...deliveryDetails, address2: e.target.value })} />
                                        </div>
                                        <div className="col-md-3 form-group mb-3">
                                            <label>Delivery Address Line 3</label>
                                            <input type="text" className="form-control tw-mt-1" placeholder="Address Line 3" value={deliveryDetails.address3} onChange={e => setDeliveryDetails({ ...deliveryDetails, address3: e.target.value })} />
                                        </div>
                                        <div className="col-md-3 form-group mb-3">
                                            <label>Delivery Pincode <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control tw-mt-1" placeholder="Pincode" value={deliveryDetails.pincode} onChange={e => setDeliveryDetails({ ...deliveryDetails, pincode: e.target.value })} />
                                        </div>
                                        <div className="col-md-3 form-group mb-3">
                                            <label>Delivery City <span className="text-danger">*</span></label>
                                            <Select
                                                options={cityOptions}
                                                value={deliveryDetails.city}
                                                onChange={v => setDeliveryDetails({ ...deliveryDetails, city: v })}
                                                placeholder="Choose City"
                                                className="react-select-container tw-mt-1"
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            />
                                        </div>
                                        <div className="col-md-3 form-group mb-3">
                                            <label>Delivery Phone Number <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control tw-mt-1" placeholder="Phone number" value={deliveryDetails.phoneNumber} onChange={e => setDeliveryDetails({ ...deliveryDetails, phoneNumber: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Footer changed to fields */}
                <div className="card tw-mt-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-12 col-md-3 form-group mb-3">
                                <label>Advance Amount</label>
                                <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} className="form-control" value={formData.advanceAmount} onChange={e => handleChange('advanceAmount', e.target.value)} readOnly />
                            </div>
                            <div className="col-12 col-md-3 form-group mb-3">
                                <label>Net Amount</label>
                                <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} className="form-control" value={formData.netAmount} onChange={e => handleChange('netAmount', e.target.value)} readOnly />
                            </div>
                            {/* <div className="col-12 col-md-3 form-group mb-3">
                                <label>Loan Amount</label>
                                <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} className="form-control" value={formData.loanAmount} onChange={e => handleChange('loanAmount', e.target.value)} readOnly />
                            </div> */}
                            <div className="col-12 col-md-3 form-group mb-3">
                                <label>Discount</label>
                                <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} className="form-control" value={formData.discount} onChange={e => handleChange('discount', e.target.value)} />
                            </div>
                            {/* <div className="col-12 col-md-3 form-group mb-3">
                                <label>Total Paid Amount</label>
                                <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} className="form-control" value={formData.totalPaidAmount} onChange={e => handleChange('totalPaidAmount', e.target.value)} readOnly />
                            </div> */}
                            <div className="col-12 col-md-3 form-group mb-3">
                                <label>Receivable Amount</label>
                                <input type="number" min="0" onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()} className="form-control" value={formData.receivableAmount} onChange={e => handleChange('receivableAmount', e.target.value)} readOnly />
                            </div>
                            <div className="col-12 col-md-3 form-group mb-3">
                                <label>Remark</label>
                                <input type="text" className="form-control" placeholder="Remark" value={formData.remark} onChange={e => handleChange('remark', e.target.value)} />
                            </div>
                            {/* <div className="col-12 col-md-3 form-group mb-3">
                                <label>Payment Terms</label>
                                <Select options={paymentTermsOptions} value={formData.paymentTerms} onChange={v => handleChange('paymentTerms', v)} placeholder="Choose Payment Terms" className="react-select-container" classNamePrefix="react-select" menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
                            </div> */}
                        </div>

                        {/* Bottom Action Buttons */}
                        <hr className="mt-4" />
                        <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="button" className="btn-save" onClick={() => setIsSubmitPopupOpen(true)}>Submit</button>
                        </div>
                    </div>
                </div>
                <SubmitPopup isOpen={isSubmitPopupOpen} onClose={() => setIsSubmitPopupOpen(false)} onConfirm={handleSubmit} />
            </div>
        </section>
    );
};

export default InvoiceEdit;
