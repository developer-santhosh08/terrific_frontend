import { useLoader } from '../../../context/LoaderContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../components/Popup/SubmitPopup';
import ExistingSerialPopup from '../../../components/Popup/ExistingSerialPopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';




const serialOptions = [
    { value: 'SN-1001', label: 'SN-1001' },
    { value: 'SN-1002', label: 'SN-1002' },
    { value: 'SN-1003', label: 'SN-1003' },
];

const rsStyles = {
    control: (provided) => ({ ...provided, background: '#fff', minHeight: '36px' }),
    menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const INITIAL_ROWS = [
    { id: 1, contactPerson: 'Ramesh Kumar', designation: 'Manager', contactNumber: '9876543210', convenientTime: '10:00 AM – 12:00 PM' },
    { id: 2, contactPerson: 'Priya Devi', designation: 'Director', contactNumber: '9123456780', convenientTime: '02:00 PM – 04:00 PM' },
];

const TABS = [
    { key: 'customerProfile', label: 'Customer Profile' },
    { key: 'productDetails', label: 'Product Details' },
    // { key: 'accessoriesDetails', label: 'Accessories Details' },
    { key: 'installationDetails', label: 'Installation Details' },
];

const JobCardAdd = () => {
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = !!location.state?.editId;
    const [editId, setEditId] = useState(location.state?.editId || null);

    const [activeTab, setActiveTab] = useState('productDetails');
    const [headerInfo, setHeaderInfo] = useState(null);
    const [submitPopupOpen, setSubmitPopupOpen] = useState(false);
    const [existingSerialPopupOpen, setExistingSerialPopupOpen] = useState(false);
    const [serialPopupMessage, setSerialPopupMessage] = useState('');
    const [errorPopupOpen, setErrorPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [cityOptions, setCityOptions] = useState([]);
    const [enquiriesOptions, setEnquiriesOptions] = useState([]);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const abortControllersRef = useRef({});

    useEffect(() => {
        const fetchEnquiries = async () => {
            if (isEditMode) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards`);
                const result = await res.json();
                if (result.status && result.data) {
                    const options = result.data.map(item => ({
                        value: item.enquiry_header_id,
                        label: item.enq_no,
                        customerName: item.customer_name,
                        engineerName: item.engineer_name
                    }));
                    setEnquiriesOptions(options);
                }
            } catch (error) {
                console.error("Error fetching enquiries:", error);
            }
        };
        fetchEnquiries();
    }, [isEditMode]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/geolocation?type=city&state_id=30`);
                const result = await res.json();
                if (result.status && result.data) {
                    const options = result.data.map(item => ({
                        value: item.name.toLowerCase(),
                        label: item.name
                    }));
                    setCityOptions(options);
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    const [productOptions, setProductOptions] = useState([]);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/products`);
                const result = await res.json();
                if (result.status && result.data) {
                    const options = result.data.map(item => ({
                        value: item.id,
                        label: item.name,
                        id: item.id,
                        price: item.price
                    }));
                    setProductOptions(options);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const [taxOptions, setTaxOptions] = useState([]);
    useEffect(() => {
        const fetchTaxes = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/tax`);
                const json = await res.json();
                if (json.status && json.data) {
                    const uniqueTaxes = Array.from(new Map(json.data.map(t => [(t.name || '').trim().toUpperCase(), t])).values());
                    setTaxOptions(uniqueTaxes.map(t => ({ 
                        value: t.id, 
                        label: `${t.name} (${t.percentage !== undefined && t.percentage !== null ? t.percentage : 0}%)`, 
                        percentage: t.percentage !== undefined && t.percentage !== null ? t.percentage : 0,
                        id: t.id 
                    })));
                }
            } catch (error) {
                console.error("Error fetching taxes:", error);
            }
        };
        fetchTaxes();
    }, []);

    const [productTakenByOptions, setProductTakenByOptions] = useState([]);
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/employee`);
                const result = await res.json();
                if (result.status && result.data) {
                    const options = result.data.map(item => ({
                        value: item.name,
                        label: item.name
                    }));
                    setProductTakenByOptions(options);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    /* ── Customer Profile form state ──────────────────────────── */
    const [addr1, setAddr1] = useState('');
    const [addr2, setAddr2] = useState('');
    const [addr3, setAddr3] = useState('');
    const [city, setCity] = useState(null);
    const [enqDate, setEnqDate] = useState('');

    /* ── Contact rows ─────────────────────────────────────────── */
    const [rows, setRows] = useState(INITIAL_ROWS);

    const addRow = () =>
        setRows(prev => [...prev, { id: Date.now(), contactPerson: '', designation: '', contactNumber: '', convenientTime: '' }]);

    const deleteRow = (id) =>
        setRows(prev => prev.filter(r => r.id !== id));

    const updateRow = (id, field, value) =>
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

    /* ── Product Details state ────────────────────────────────── */
    const [cashDiscount, setCashDiscount] = useState(0);
    const [freight, setFreight] = useState(0);
    const [products, setProducts] = useState([
        { productName: '', serialNumbers: [{ value: '', isText: false }], qty: 1, rate: 0, discount: 0, buyback: 0, pnf: 0, tax: 18, basic: 0, amount: 0 }
    ]);

    const handleProductSelect = async (index, opt) => {
        if (!opt) {
            updateProduct(index, 'productName', '');
            return;
        }

        // Fetch stock for this product
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards/jobcard/stock/${opt.id}?type=product`);
            const stockResult = await res.json();
            let newStock = 0;
            let availableSerials = [];

            if (stockResult.status && Array.isArray(stockResult.data) && stockResult.data.length > 0) {
                const productStock = stockResult.data.find(item => Number(item.product_id) === Number(opt.id)) || stockResult.data[0];
                if (productStock) {
                    newStock = productStock.available_stock !== undefined
                        ? Number(productStock.available_stock)
                        : (Number(productStock.stock_qty) || 0);
                    availableSerials = (productStock.available_serial_numbers || [])
                        .filter(s => s)
                        .map(s => ({ value: s, label: s }));
                }
            } else if (stockResult.status && stockResult.data && !Array.isArray(stockResult.data)) {
                newStock = stockResult.data.available_stock !== undefined
                    ? Number(stockResult.data.available_stock)
                    : (Number(stockResult.data.stock_qty) || 0);
                availableSerials = (stockResult.data.available_serial_numbers || [])
                    .filter(s => s)
                    .map(s => ({ value: s, label: s }));
            }

            // Trigger calculation and update state in a single call to avoid state updates overwriting each other
            updateProduct(index, {
                productName: opt.label,
                productId: opt.id, // Store product id separately, don't overwrite enquiryDetailId
                rate: opt.price || 0,
                availableStock: newStock,
                serialOptionsList: availableSerials
            });
        } catch (err) {
            console.error("Error fetching stock:", err);
        }
    };

    const updateProduct = async (index, field, value) => {
        const next = [...products];
        if (typeof field === 'object' && field !== null) {
            next[index] = { ...next[index], ...field };
        } else {
            if (['qty', 'rate', 'discount', 'buyback', 'pnf'].includes(field)) {
                if (Number(value) < 0) return;
            }
            if (field === 'tax') value = Number(value) || 0;
            next[index][field] = value;
            const qty = Number(next[index].qty) || 0;

            if (field === 'qty') {
                const currentSerials = next[index].serialNumbers || [];
                if (qty > currentSerials.length) {
                    next[index].serialNumbers = [
                        ...currentSerials,
                        ...Array.from({ length: qty - currentSerials.length }, () => ({ value: '', isText: false }))
                    ];
                } else if (qty > 0 && qty < currentSerials.length) {
                    next[index].serialNumbers = currentSerials.slice(0, qty);
                } else if (qty === 0) {
                    next[index].serialNumbers = [];
                }
            }
        }

        // Optimistically update raw fields
        setProducts([...next]);

        // Debounce API call to avoid cancelled requests showing in network tab
        if (abortControllersRef.current[index]) {
            clearTimeout(abortControllersRef.current[index]);
        }

        abortControllersRef.current[index] = setTimeout(async () => {
            try {
                const payload = {
                    customer_id: 1,
                    enquiry_date: enqDate || new Date().toISOString().split('T')[0],
                    cash_discount: Number(cashDiscount || 0),
                    details: next.map(p => ({
                        product_id: p.enquiryDetailId || 101,
                        product_name: p.productName || 'Product',
                        quantity: Number(p.qty) || 0,
                        original_rate: Number(p.rate) || 0,
                        discount: Number(p.discount) || 0,
                        buyback: Number(p.buyback) || 0,
                        pf: Number(p.pnf) || 0,
                        tax_percentage: Number(p.tax) || 0
                    }))
                };

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.status === 'success' && result.data && result.data.details) {
                    setProducts(prevProducts => {
                        const updated = [...prevProducts];
                        result.data.details.forEach((calc, idx) => {
                            if (updated[idx]) {
                                updated[idx].basic = calc.calculated_basic;
                                updated[idx].pnfAmount = calc.calculated_pf_amount;
                                updated[idx].taxAmount = calc.calculated_tax_amount;
                                updated[idx].amount = calc.calculated_total_value;
                            }
                        });
                        return updated;
                    });
                }
            } catch (error) {
                console.error("Error calculating via API:", error);
            }
        }, 500);
    };

    // Recalculate when cash discount changes
    useEffect(() => {
        if (products.length === 0 || !products[0].productName) return;
        
        if (abortControllersRef.current['cashDiscount']) {
            clearTimeout(abortControllersRef.current['cashDiscount']);
        }
        
        abortControllersRef.current['cashDiscount'] = setTimeout(async () => {
            try {
                const payload = {
                    customer_id: 1,
                    enquiry_date: enqDate || new Date().toISOString().split('T')[0],
                    cash_discount: Number(cashDiscount || 0),
                    details: products.map(p => ({
                        product_id: p.enquiryDetailId || 101,
                        product_name: p.productName || 'Product',
                        quantity: Number(p.qty) || 0,
                        original_rate: Number(p.rate) || 0,
                        discount: Number(p.discount) || 0,
                        buyback: Number(p.buyback) || 0,
                        pf: Number(p.pnf) || 0,
                        tax_percentage: Number(p.tax) || 0
                    }))
                };

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.status === 'success' && result.data && result.data.details) {
                    setProducts(prevProducts => {
                        const updated = [...prevProducts];
                        result.data.details.forEach((calc, idx) => {
                            if (updated[idx]) {
                                updated[idx].basic = calc.calculated_basic;
                                updated[idx].pnfAmount = calc.calculated_pf_amount;
                                updated[idx].taxAmount = calc.calculated_tax_amount;
                                updated[idx].amount = calc.calculated_total_value;
                            }
                        });
                        return updated;
                    });
                }
            } catch (err) {
                console.error("Error recalculating for cash discount:", err);
            }
        }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cashDiscount]);

    const updateSerialNumber = (productIndex, serialIndex, field, value) => {
        const next = [...products];
        if (!next[productIndex].serialNumbers) return;
        next[productIndex].serialNumbers[serialIndex][field] = value;
        setProducts(next);
    };

    const addProductRow = () => {
        setProducts([...products, { productName: '', serialNumbers: [{ value: '', isText: false }], qty: 1, rate: 0, discount: 0, buyback: 0, pnf: 0, tax: 18, basic: 0, amount: 0 }]);
    };

    const deleteProductRow = (index) => {
        if (products.length <= 1) return;
        setProducts(products.filter((_, i) => i !== index));
    };

    const totalAmount = Math.round(products.reduce((s, p) => s + Number(p.amount || 0), 0));
    const grandTotal = Math.round(totalAmount + Number(freight || 0)).toFixed(2);
    const totalBasic = products.reduce((s, p) => s + Number(p.basic || 0), 0).toFixed(2);
    const totalPnf = products.reduce((s, p) => s + Number(p.pnfAmount || 0), 0).toFixed(2);
    const totalTax = products.reduce((s, p) => s + Number(p.taxAmount || 0), 0).toFixed(2);

    const prodSgst = products.reduce((s, p) => s + (p.tax === 18 ? Number(p.taxAmount || 0) / 2 : (p.tax === 9 ? Number(p.taxAmount || 0) : 0)), 0);
    const prodCgst = products.reduce((s, p) => s + (p.tax === 18 ? Number(p.taxAmount || 0) / 2 : (p.tax === 9 ? Number(p.taxAmount || 0) : 0)), 0);
    const prodIgst = products.reduce((s, p) => s + (p.tax === 5 ? Number(p.taxAmount || 0) : 0), 0);

    /* ── Accessories Details state ────────────────────────────── */
    const [accessories, setAccessories] = useState([
        { productName: '', qty: '', unit: '', rate: '', discount: '', tax: 18, taxAmount: 0, amount: 0, basic: 0 }
    ]);

    const updateAccessory = (index, field, value) => {
        const next = [...accessories];
        if (field === 'tax') value = Number(value) || 0;
        next[index][field] = value;
        const qty = Number(next[index].qty) || 0;
        const rate = Number(next[index].rate) || 0;
        const discount = Number(next[index].discount) || 0;
        const tax = Number(next[index].tax) || 0;
        const basic = (qty * rate) - discount;
        const taxAmt = basic * (tax / 100);
        const amount = basic + taxAmt;
        next[index].taxAmount = Number(taxAmt.toFixed(2));
        next[index].amount = Number(amount.toFixed(2));
        next[index].basic = Number(basic.toFixed(2));
        setAccessories(next);
    };

    const addAccessoryRow = () => {
        setAccessories([...accessories, { productName: '', qty: '', unit: '', rate: '', discount: '', tax: 18, taxAmount: 0, amount: 0, basic: 0 }]);
    };

    const deleteAccessoryRow = (index) => {
        if (accessories.length <= 1) return;
        setAccessories(accessories.filter((_, i) => i !== index));
    };

    const accTotalBasic = accessories.reduce((s, a) => s + Number(a.basic || 0), 0);
    const accSgst = accessories.reduce((s, a) => s + (a.tax === 18 ? Number(a.taxAmount || 0) / 2 : (a.tax === 9 ? Number(a.taxAmount || 0) : 0)), 0);
    const accCgst = accessories.reduce((s, a) => s + (a.tax === 18 ? Number(a.taxAmount || 0) / 2 : (a.tax === 9 ? Number(a.taxAmount || 0) : 0)), 0);
    const accIgst = accessories.reduce((s, a) => s + (a.tax === 5 ? Number(a.taxAmount || 0) : 0), 0);
    const accNetTotal = accessories.reduce((s, a) => s + Number(a.amount || 0), 0);

    /* ── Installation Details state ──────────────────────────── */
    const [productTakenBy, setProductTakenBy] = useState(null);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [instMobile, setInstMobile] = useState('');
    const [remark, setRemark] = useState('');

    useEffect(() => {
        const fetchJobCard = async () => {
            if (!editId) return;
            setLoading(true);
            try {
                // Fetch both endpoints concurrently
                const [res, stockRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards/jobcard/${editId}`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards/jobcard/stock/${editId}`)
                ]);
                const result = await res.json();
                const stockResult = await stockRes.json();

                const stockDataMap = {};
                if (stockResult.status && Array.isArray(stockResult.data)) {
                    stockResult.data.forEach(item => {
                        stockDataMap[item.enquiry_detail_id] = item;
                    });
                }

                if (result.status && result.data) {
                    const data = result.data;

                    if (data.customer_profile) {
                        const cp = data.customer_profile;
                        setHeaderInfo({
                            customerName: cp.customer_name,
                            enqNo: cp.enquiry_no,
                            enqDate: cp.enquiry_date,
                            allottedTo: cp.allotted_to_name || '',
                            cashDiscount: cp.cash_discount || 0
                        });
                        setCashDiscount(Number(cp.cash_discount || 0));
                        setAddr1(cp.address1 || '');
                        setAddr2(cp.address2 || '');
                        setAddr3(cp.address3 || '');
                        // If city matches an option
                        const cityName = cp.city || '';
                        const foundCity = cityOptions.find(c => c.label.toLowerCase() === cityName.toLowerCase());
                        if (foundCity) {
                            setCity(foundCity);
                        } else if (cityName) {
                            setCity({ label: cityName, value: cityName.toLowerCase() });
                        }

                        setRows([{
                            id: 1,
                            contactPerson: cp.contact_person || '',
                            designation: cp.designation || '',
                            contactNumber: cp.contact_number || '',
                            convenientTime: cp.convenient_time || ''
                        }]);

                        if (cp.enquiry_date) {
                            // Convert dd/mm/yyyy to yyyy-mm-dd
                            const parts = cp.enquiry_date.split('/');
                            if (parts.length === 3) {
                                setEnqDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                            }
                        }
                    }

                    if (data.product_details && data.product_details.length > 0) {
                        const pd = data.product_details.map(item => {
                            const basic = Number(item.basic) || 0;
                            const tax = Number(item.tax_percentage) || 0;
                            const pnf = Number(item.pf) || 0;
                            const qty = Number(item.quantity) || 0;
                            const rate = Number(item.original_rate) || 0;
                            const discount = Number(item.discount) || 0;
                            const buyback = Number(item.buyback) || 0;

                            const stockInfo = stockDataMap[item.id] || {};
                            const availableSerials = (stockInfo.available_serial_numbers || [])
                                .filter(s => s) // remove empty strings
                                .map(s => ({ value: s, label: s }));

                            let loadedSerials = [];
                            if (stockInfo.assigned_serial_numbers && stockInfo.assigned_serial_numbers.length > 0) {
                                loadedSerials = stockInfo.assigned_serial_numbers.map(s => ({ value: String(s).trim(), isText: false }));
                            } else if (item.serial_number) {
                                loadedSerials = item.serial_number.split(',').map(s => ({ value: s.trim(), isText: false }));
                            }
                            const needed = qty > 0 ? qty : 1;
                            while (loadedSerials.length < needed) {
                                loadedSerials.push({ value: '', isText: false });
                            }

                            const allSerialOptions = [...availableSerials];
                            loadedSerials.forEach(ls => {
                                if (ls.value && !allSerialOptions.find(o => o.value === ls.value)) {
                                    allSerialOptions.push({ value: ls.value, label: ls.value });
                                }
                            });

                            return {
                                enquiryDetailId: item.id,
                                productName: item.product_name || '',
                                serialNumbers: loadedSerials.slice(0, needed),
                                qty, rate, discount, buyback, pnf, tax,
                                basic,
                                pnfAmount: Number(item.pf_amount) || 0,
                                taxAmount: Number(item.tax_amount) || 0,
                                amount: Number(item.total_value) || 0,
                                availableStock: stockInfo.available_stock !== undefined ? Number(stockInfo.available_stock) : (Number(item.stock_qty) || 0),
                                serialOptionsList: allSerialOptions,
                            };
                        });
                        setProducts(pd);
                    }

                    if (data.installation_details) {
                        const inst = data.installation_details;
                        setVehicleNumber(inst.vehicle_number || '');
                        setDriverName(inst.driver_name || '');
                        setInstMobile(inst.mobile_number || '');
                        setRemark(inst.remark_text || '');

                        if (inst.product_taken_by_name) {
                            setHeaderInfo(prev => ({
                                ...prev,
                                allottedTo: inst.product_taken_by_name
                            }));
                        }
                    }
                    if (data.tax_summary && data.tax_summary.totals && data.tax_summary.totals.freight !== undefined) {
                        setFreight(Number(data.tax_summary.totals.freight) || 0);
                    }
                }
            } catch (error) {
                console.error("Error fetching job card data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobCard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]);

    const handleSubmit = () => {
        const hasInsufficientStock = products.some(item => parseInt(item.qty || 0) > (item.availableStock || 0));
        if (hasInsufficientStock) {
            setErrorMessage("Cannot save: Insufficient stock for one or more products.");
            setErrorPopupOpen(true);
            return;
        }
        setSubmitPopupOpen(true);
    };

    const submitForm = async () => {
        try {
            setLoading(true);
            const payload = {
                cash_discount: Number(cashDiscount || 0),
                customer_profile: {
                    address1: addr1,
                    address2: addr2,
                    address3: addr3
                },
                installation_details: {
                    vehicle_number: vehicleNumber,
                    driver_name: driverName,
                    mobile_number: instMobile,
                    remark_text: remark,
                    product_taken_by_name: productTakenBy ? productTakenBy.label : '',
                    product_taken_by: productTakenBy ? productTakenBy.value : 0
                },
                items: products.map(p => {
                    const itemPayload = {
                        enquiry_detail_id: p.enquiryDetailId || 0,
                        vendor_product_mapping_id: p.productId || 0,
                        product_name: p.productName,
                        product_type: 0,
                        quantity: p.qty,
                        original_rate: p.rate,
                        discount: p.discount,
                        buyback: p.buyback,
                        basic: p.basic,
                        pf: p.pnf,
                        pf_amount: p.pnfAmount || 0,
                        tax_percentage: p.tax,
                        tax_amount: p.taxAmount || 0,
                        total_value: p.amount,
                    };
                    const serials = p.serialNumbers ? p.serialNumbers.map(s => s.value).filter(Boolean).join(',') : '';
                    if (serials) {
                        itemPayload.serial_number = serials;
                    }
                    return itemPayload;
                })
            };

            const token = sessionStorage.getItem('erp_token');
            const headers = { 
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            // 1. Update Customer Profile first
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/update-customer-profile/${editId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    address1: addr1,
                    address2: addr2,
                    address3: addr3,
                    city_id: city ? city.value : null
                })
            });

            // 2. Submit JobCard
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards/jobcard/submit/${editId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status) {
                setSubmitPopupOpen(false);
                navigate('/sales/job-card');
            } else {
                setSubmitPopupOpen(false);
                setSerialPopupMessage('Error submitting Job Card: ' + result.message);
                setExistingSerialPopupOpen(true);
            }
        } catch (error) {
            console.error('Error submitting form', error);
            setSubmitPopupOpen(false);
            setSerialPopupMessage('Failed to submit Job Card');
            setExistingSerialPopupOpen(true);
        } finally {
            setLoading(false);
        }
    };


    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-center tw-gap-3 sm:tw-gap-0">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Add Job Card</h3>
                        <button className="btn-header-back" onClick={() => navigate('/sales/job-card')}>Back</button>
                    </div>
                    <div className="card-body">

                        {/* Top Info Section (Light Blue Background) */}
                        <div
                            className="tw-mb-5"
                            style={{
                                background: '#cce9f7', borderRadius: 6,
                                padding: '14px 24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Customer Name</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerInfo?.customerName || 'YOUNG STYLE CLOTHING'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Enquiry Number</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                {isEditMode ? (
                                    <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerInfo?.enqNo || '8204'}</span>
                                ) : (
                                    <Select
                                        options={enquiriesOptions}
                                        value={selectedEnquiry}
                                        onChange={(opt) => {
                                            setSelectedEnquiry(opt);
                                            setEditId(opt ? opt.value : null);
                                            if (opt) {
                                                setHeaderInfo(prev => ({
                                                    ...prev,
                                                    customerName: opt.customerName,
                                                    allottedTo: opt.engineerName,
                                                    enqNo: opt.label
                                                }));
                                            }
                                        }}
                                        placeholder="Select Enquiry"
                                        styles={{ ...rsStyles, container: base => ({ ...base, minWidth: 150 }) }}
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                        menuPosition="fixed"
                                    />
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Allotted To</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerInfo?.allottedTo || 'RAMESH P'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Date<span className="tw-text-red-500">*</span></span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={enqDate}
                                    onChange={e => setEnqDate(e.target.value)}
                                    style={{ width: '160px' }}
                                />
                            </div>
                        </div>

                        {/* Red Bordered Table (Second Card) */}
                        <div className="tw-border tw-border-[#ff4d4f] tw-p-1 tw-rounded-sm tw-mb-5">
                            {/* Desktop Table View */}
                            <div className="tw-hidden md:tw-block tw-overflow-x-auto">
                                <table className="table no-margin tw-min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="tw-border-b tw-border-gray-200 tw-bg-white tw-py-3">Product Name</th>
                                            <th className="tw-border-b tw-border-gray-200 tw-bg-white tw-py-3">Available Quantity</th>
                                            <th className="tw-border-b tw-border-gray-200 tw-bg-white tw-py-3">Minimum Quantity</th>
                                            <th className="tw-border-b tw-border-gray-200 tw-bg-white tw-py-3">Suggested for PO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((prod, i) => (
                                            <tr key={i}>
                                                <td className="tw-py-4">{prod.productName}</td>
                                                <td className="tw-py-4">{prod.availableStock || 0}</td>
                                                <td className="tw-py-4">0</td>
                                                <td className="tw-py-4">
                                                    {(prod.availableStock || 0) < prod.qty ? (
                                                        <span className="tw-bg-[#d9534f] tw-text-white tw-px-3 tw-py-1.5 tw-rounded tw-text-sm">
                                                            Not Enough Stock
                                                        </span>
                                                    ) : (
                                                        <span className="tw-bg-[#5cb85c] tw-text-white tw-px-3 tw-py-1.5 tw-rounded tw-text-sm">
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="tw-py-4 tw-text-center">No products found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:tw-hidden tw-flex tw-flex-col tw-gap-3 tw-p-2 tw-bg-gray-50/50">
                                {products.map((prod, i) => (
                                    <div key={i} className="tw-border tw-border-gray-200 tw-rounded-md tw-p-4 tw-bg-white tw-shadow-sm">
                                        <div className="tw-mb-4">
                                            <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-1">Product Name</div>
                                            <div className="tw-text-sm tw-font-semibold tw-text-gray-800">{prod.productName}</div>
                                        </div>
                                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                                            <div>
                                                <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-1">Available Qty</div>
                                                <div className="tw-text-sm tw-font-medium">{prod.availableStock || 0}</div>
                                            </div>
                                            <div className="tw-text-right">
                                                <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-1">Minimum Qty</div>
                                                <div className="tw-text-sm tw-font-medium">0</div>
                                            </div>
                                        </div>
                                        <div className="tw-pt-3 tw-border-t tw-border-gray-100">
                                            <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-2">Suggested for PO</div>
                                            <div>
                                                {(prod.availableStock || 0) < prod.qty ? (
                                                    <span className="tw-bg-[#d9534f] tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium">
                                                        Not Enough Stock
                                                    </span>
                                                ) : (
                                                    <span className="tw-bg-[#5cb85c] tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium">
                                                        In Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {products.length === 0 && (
                                    <div className="tw-text-center tw-py-6 tw-text-sm tw-text-gray-500 tw-bg-white tw-rounded tw-border tw-border-gray-100">No products found</div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4">
                            {TABS.map(t => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    className={`tw-w-full sm:tw-w-auto tw-px-4 tw-py-2 ${activeTab === t.key
                                        ? 'tw-bg-blue-600 tw-text-white'
                                        : 'tw-bg-white tw-border tw-text-gray-700'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tw-min-h-[200px]">
                            {activeTab === 'customerProfile' && (
                                <div>
                                    {/* ── Address / Date fields ── */}
                                    <div className="row">
                                        <div className="col-md-4 form-group">
                                            <label>Address 1</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Address line 1"
                                                value={addr1}
                                                onChange={e => setAddr1(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label>Address 2</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Address line 2"
                                                value={addr2}
                                                onChange={e => setAddr2(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label>Address 3</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Address line 3"
                                                value={addr3}
                                                onChange={e => setAddr3(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label>City</label>
                                            <Select
                                                options={cityOptions}
                                                value={city}
                                                onChange={setCity}
                                                placeholder="Select City"
                                                classNamePrefix="react-select"
                                                styles={{
                                                    ...rsStyles,
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed"
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label>Enquiry Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={enqDate}
                                                onChange={e => setEnqDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* ── Contact Persons table ────────── */}
                                    <div className="table-responsive tw-mt-3">
                                        <table className="table table-bordered table-striped no-margin">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: 46 }}>#</th>
                                                    <th>Contact Person</th>
                                                    <th>Designation</th>
                                                    <th>Contact Number</th>
                                                    <th>Convenient Time</th>
                                                    <th style={{ width: 80 }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row, i) => (
                                                    <tr key={row.id}>
                                                        <td className="tw-align-middle tw-text-center">{i + 1}</td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Contact person name"
                                                                value={row.contactPerson}
                                                                onChange={e => updateRow(row.id, 'contactPerson', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Designation"
                                                                value={row.designation}
                                                                onChange={e => updateRow(row.id, 'designation', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                placeholder="Contact number"
                                                                value={row.contactNumber}
                                                                onChange={e => updateRow(row.id, 'contactNumber', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="time"
                                                                className="form-control"
                                                                placeholder="e.g. 10:00 AM – 12:00 PM"
                                                                value={row.convenientTime}
                                                                onChange={e => updateRow(row.id, 'convenientTime', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="tw-align-middle">
                                                            <div className="tw-flex tw-gap-1 tw-justify-center">
                                                                <button
                                                                    type="button"
                                                                    className="table-add"
                                                                    title="Add Row"
                                                                    onClick={addRow}
                                                                >
                                                                    <i className="bi bi-plus-lg" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="table-delete"
                                                                    title="Delete Row"
                                                                    onClick={() => deleteRow(row.id)}
                                                                >
                                                                    <i className="bi bi-trash" />
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

                            {activeTab === 'productDetails' && (
                                <div className="tw-mt-2">
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table table-bordered tw-w-full">
                                            <thead>
                                                <tr>
                                                    <th>Product Name</th>
                                                    <th>Serial Number</th>
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
                                                        <td style={{ minWidth: 300 }}>
                                                            <Select
                                                                options={productOptions}
                                                                styles={{
                                                                    ...rsStyles,
                                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                                }}
                                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                                menuPosition="fixed"
                                                                placeholder="Select Product"
                                                                value={productOptions.find(o => o.id === row.productId || o.label === row.productName) || (row.productName ? { label: row.productName, value: row.productName } : null)}
                                                                onChange={(opt) => handleProductSelect(idx, opt)}
                                                            />
                                                        </td>
                                                        <td style={{ minWidth: 160 }}>
                                                            {row.serialNumbers && row.serialNumbers.map((sn, sIdx) => (
                                                                <div key={sIdx} className={sIdx > 0 ? "tw-mt-3" : ""}>
                                                                    {sn.isText ? (
                                                                        <div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                placeholder="Enter serial number"
                                                                                value={sn.value}
                                                                                onChange={(e) => updateSerialNumber(idx, sIdx, 'value', e.target.value)}
                                                                            />
                                                                            <div
                                                                                className="tw-text-blue-500 tw-cursor-pointer tw-text-xs tw-mt-1 tw-font-medium hover:tw-underline"
                                                                                onClick={() => updateSerialNumber(idx, sIdx, 'isText', false)}
                                                                            >
                                                                                Select from List
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <Select
                                                                                options={(row.serialOptionsList || []).filter(o =>
                                                                                    o.value === sn.value ||
                                                                                    !row.serialNumbers.some((otherSn, otherIdx) => otherIdx !== sIdx && !otherSn.isText && otherSn.value === o.value)
                                                                                )}
                                                                                styles={{
                                                                                    ...rsStyles,
                                                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                                                }}
                                                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                                                menuPosition="fixed"
                                                                                placeholder="Select"
                                                                                value={(row.serialOptionsList || []).find(o => o.value === sn.value) || null}
                                                                                onChange={(opt) => updateSerialNumber(idx, sIdx, 'value', opt ? opt.value : '')}
                                                                            />
                                                                            <div
                                                                                className="tw-text-blue-500 tw-cursor-pointer tw-text-xs tw-mt-1 tw-font-medium hover:tw-underline"
                                                                                onClick={() => {
                                                                                    updateSerialNumber(idx, sIdx, 'value', '');
                                                                                    updateSerialNumber(idx, sIdx, 'isText', true);
                                                                                }}
                                                                            >
                                                                                + Add New
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td style={{ minWidth: 90 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} value={row.qty} onChange={(e) => updateProduct(idx, 'qty', e.target.value)} className="form-control" style={{ minWidth: '90px', width: row.qty ? `${row.qty.toString().length + 2}ch` : 'auto' }} />
                                                        </td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} value={row.rate} onChange={(e) => updateProduct(idx, 'rate', e.target.value)} readOnly className="form-control" style={{ minWidth: '120px', width: row.rate ? `${row.rate.toString().length + 2}ch` : 'auto' }} />
                                                        </td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} value={row.discount} onChange={(e) => updateProduct(idx, 'discount', e.target.value)} className="form-control" style={{ minWidth: '120px', width: row.discount ? `${row.discount.toString().length + 2}ch` : 'auto' }} />
                                                        </td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} value={row.buyback} onChange={(e) => updateProduct(idx, 'buyback', e.target.value)} className="form-control" style={{ minWidth: '120px', width: row.buyback ? `${row.buyback.toString().length + 2}ch` : 'auto' }} />
                                                        </td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <input value={row.basic} className="form-control" style={{ minWidth: '120px', width: row.basic ? `${row.basic.toString().length + 2}ch` : 'auto' }} />
                                                        </td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <div>
                                                                <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} value={row.pnf} onChange={(e) => updateProduct(idx, 'pnf', e.target.value)} className="form-control" placeholder="P&F %" style={{ minWidth: '120px', width: row.pnf ? `${row.pnf.toString().length + 2}ch` : 'auto' }} />
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
                                                        <td style={{ minWidth: 120 }}>
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
                                                    <td></td>
                                                    <td style={{ fontWeight: 600 }}>{totalBasic}</td>
                                                    <td style={{ fontWeight: 600 }}>{totalPnf}</td>
                                                    <td style={{ fontWeight: 600 }}>{totalTax}</td>
                                                    <td style={{ fontWeight: 600 }}>{totalAmount.toFixed(2)}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* <div className="tw-mt-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="updateQuotationAdd" />
                                            <label className="form-check-label" htmlFor="updateQuotationAdd">Update Changes in Quotation</label>
                                        </div>
                                    </div> */}

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
                                                    <hr />
                                                    <div className="d-flex justify-content-between py-2"><div>SGST </div><div>{prodSgst.toFixed(2)}</div></div>
                                                    <div className="d-flex justify-content-between py-2"><div>CGST </div><div>{prodCgst.toFixed(2)}</div></div>
                                                    <div className="d-flex justify-content-between py-2"><div>IGST   </div><div>{prodIgst.toFixed(2)}</div></div>
                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                        <div>Cash Discount</div>
                                                        <div style={{ width: 140 }}><input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={cashDiscount} onChange={(e) => setCashDiscount(e.target.value)} /></div>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                        <div>Freight Value</div>
                                                        <div style={{ width: 140 }}><input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={freight} onChange={(e) => setFreight(e.target.value)} /></div>
                                                    </div>
                                                    <div className="d-flex justify-content-between py-2"><div>Total</div><div>{totalAmount.toFixed(2)}</div></div>
                                                    <div className="mt-3 p-2 bg-light d-flex justify-content-between align-items-center"><strong>Total</strong><strong className="text-primary">{grandTotal}</strong></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'accessoriesDetails' && (
                                <div className="tw-mt-2">
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table table-bordered tw-w-full">
                                            <thead>
                                                <tr>
                                                    <th>Product Name</th>
                                                    <th>Quantity</th>
                                                    <th>Unit</th>
                                                    <th>Rate</th>
                                                    <th>Discount</th>
                                                    <th>Tax</th>
                                                    <th>Amount</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {accessories.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ minWidth: 200 }}>
                                                            <input value={row.productName} onChange={(e) => updateAccessory(idx, 'productName', e.target.value)} className="form-control" />
                                                        </td>
                                                        <td style={{ minWidth: 100 }}>
                                                            <input type="number" value={row.qty} onChange={(e) => updateAccessory(idx, 'qty', e.target.value)} className="form-control" />
                                                        </td>
                                                        <td style={{ minWidth: 100 }}>
                                                            <input type="text" value={row.unit} onChange={(e) => updateAccessory(idx, 'unit', e.target.value)} className="form-control" />
                                                        </td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <input type="number" value={row.rate} onChange={(e) => updateAccessory(idx, 'rate', e.target.value)} className="form-control" />
                                                        </td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <input type="number" value={row.discount} onChange={(e) => updateAccessory(idx, 'discount', e.target.value)} className="form-control" />
                                                        </td>
                                                        <td style={{ minWidth: 180 }}>
                                                            <Select
                                                                options={taxOptions}
                                                                styles={{
                                                                    ...rsStyles,
                                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                                }}
                                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                                menuPosition="fixed"
                                                                placeholder="Choose a Tax"
                                                                value={taxOptions.find(o => o.id === row.taxId) || taxOptions.find(o => Number(o.percentage) === Number(row.tax))}
                                                                onChange={(opt) => {
                                                                    updateAccessory(idx, 'tax', opt ? opt.percentage : 0);
                                                                    updateAccessory(idx, 'taxId', opt ? opt.id : null);
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ minWidth: 140 }}>
                                                            <input value={row.amount || 0} readOnly className="form-control" />
                                                        </td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <div className="tw-flex tw-gap-2">
                                                                <button type="button" className="table-add" onClick={addAccessoryRow}><i className="bi bi-plus-lg" /></button>
                                                                <button type="button" className="table-delete" onClick={() => deleteAccessoryRow(idx)}><i className="bi bi-trash" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="tw-flex tw-justify-between tw-mt-8">
                                        <div className="tw-pl-4">
                                            <div className="tw-text-gray-700 tw-font-medium tw-text-base">Allotted To</div>
                                        </div>
                                        <div className="tw-w-[400px]">
                                            <div className="tw-flex tw-justify-between tw-py-4 tw-border-b tw-border-gray-100 tw-pr-6">
                                                <div className="tw-text-gray-600 tw-text-md">Sub Amount</div>
                                                <div className="tw-font-medium tw-text-gray-800">{accTotalBasic.toFixed(2)}</div>
                                            </div>
                                            <div className="tw-flex tw-justify-between tw-py-4 tw-border-b tw-border-gray-100 tw-pr-6">
                                                <div className="tw-text-gray-600 tw-text-md">SGET</div>
                                                <div className="tw-font-medium tw-text-gray-800">{accSgst.toFixed(2)}</div>
                                            </div>
                                            <div className="tw-flex tw-justify-between tw-py-4 tw-border-b tw-border-gray-100 tw-pr-6">
                                                <div className="tw-text-gray-600 tw-text-md">CGST</div>
                                                <div className="tw-font-medium tw-text-gray-800">{accCgst.toFixed(2)}</div>
                                            </div>
                                            <div className="tw-flex tw-justify-between tw-py-4 tw-border-b tw-border-gray-100 tw-pr-6">
                                                <div className="tw-text-gray-600 tw-text-md">IGST</div>
                                                <div className="tw-font-medium tw-text-gray-800">{accIgst.toFixed(2)}</div>
                                            </div>
                                            <div className="tw-flex tw-justify-between tw-py-5 tw-bg-slate-50 tw-px-6 tw-mt-4 tw-border tw-border-gray-100 tw-rounded">
                                                <div className="tw-text-blue-600 tw-font-medium tw-text-base">Net Total</div>
                                                <div className="tw-text-blue-600 tw-font-medium tw-text-base">{accNetTotal.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'installationDetails' && (
                                <div className="tw-mt-2">
                                    <div className="row">
                                        <div className="col-md-4 form-group">
                                            <label>Product Taken By</label>
                                            <Select
                                                options={productTakenByOptions}
                                                value={productTakenBy}
                                                onChange={setProductTakenBy}
                                                placeholder="Select Person"
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed"
                                                styles={{ control: (b) => ({ ...b, minHeight: 36 }), menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label>Vehicle Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Vehicle Number"
                                                value={vehicleNumber}
                                                onChange={e => setVehicleNumber(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label>Driver Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Driver Name"
                                                value={driverName}
                                                onChange={e => setDriverName(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label>Mobile Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Mobile Number"
                                                value={instMobile}
                                                onChange={e => setInstMobile(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <label>Remark</label>
                                            <textarea
                                                className="form-control"
                                                placeholder="Remark"
                                                rows={2}
                                                value={remark}
                                                onChange={e => setRemark(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="tw-mt-8 tw-flex tw-justify-between">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/sales/job-card')}>Cancel</button>
                                <button type="button" className="btn-save" onClick={handleSubmit}>Submit</button>
                            </div>
                        </div>

                    </div>
                    {/* Submit Popup component */}
                    <SubmitPopup
                        isOpen={submitPopupOpen}
                        onClose={() => setSubmitPopupOpen(false)}
                        onConfirm={submitForm}
                    />
                    <ExistingSerialPopup
                        isOpen={existingSerialPopupOpen}
                        onClose={() => setExistingSerialPopupOpen(false)}
                        message={serialPopupMessage}
                    />
                    <ErrorPopup
                        isOpen={errorPopupOpen}
                        onClose={() => setErrorPopupOpen(false)}
                        message={errorMessage}
                    />
                </div>
            </div >
        </section >
    );
};

export default JobCardAdd;
