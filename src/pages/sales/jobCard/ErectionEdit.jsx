import { useLoader } from '../../../context/LoaderContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../components/Popup/UpdatePopup';
import ErrorPopup from '../../../components/Popup/ErrorPopup';

/* ── Options ─────────────────────────────────────────────────── */

const serialOptions  = [
    { value: 'SN-1001', label: 'SN-1001' },
    { value: 'SN-1002', label: 'SN-1002' },
    { value: 'SN-1003', label: 'SN-1003' },
];


const rsStyles = {
    control: (b) => ({ ...b, minHeight: 36, background: '#fff' }),
    menu:    (b) => ({ ...b, zIndex: 9999 }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
};

/* ── Tabs ────────────────────────────────────────────────────── */
const TABS = [
    { key: 'customerProfile',     label: 'Customer Profile'     },
    { key: 'productDetails',      label: 'Product Details'      },
    { key: 'installationDetails', label: 'Installation Details' },
];

/* ── Row helpers ──────────────────────────────────────────────── */
const makeRow = () => ({
    id: Date.now() + Math.random(),
    productName: '', qty: 1, rate: 0, discount: 0, buyback: 0,
    basic: 0, pnf: 0, pnfAmt: 0, tax: 18, taxAmt: 0, amount: 0,
    serialNumbers: [{ value: '', isText: false }], serialOptionsList: [], labour: null, date: new Date().toISOString().split('T')[0],
});
const calc = (r) => {
    const basic  = Number(r.qty) * Number(r.rate) - Number(r.discount) - Number(r.buyback);
    const pnfAmt = basic * (Number(r.pnf) / 100);
    const taxAmt = (basic + pnfAmt) * (Number(r.tax) / 100);
    return { ...r, basic: +basic.toFixed(2), pnfAmt: +pnfAmt.toFixed(2), taxAmt: +taxAmt.toFixed(2), amount: +(basic + pnfAmt + taxAmt).toFixed(2) };
};

const INITIAL_CONTACT_ROWS = [
    { id: 1, contactPerson: 'Ramesh Kumar', designation: 'Manager',  contactNumber: '9876543210', convenientTime: '10:00 AM – 12:00 PM' },
    { id: 2, contactPerson: 'Priya Devi',   designation: 'Director', contactNumber: '9123456780', convenientTime: '02:00 PM – 04:00 PM' },
];

/* ── Component ────────────────────────────────────────────────── */
const ErectionEdit = () => {
    const { setLoading } = useLoader();
    const navigate = useNavigate();
    const { id: editId } = useParams();

    const [errorPopupOpen, setErrorPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [cityOptions, setCityOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/products`);
                const result = await res.json();
                if (result.status && result.data) {
                    const opts = result.data.map(p => ({
                        value: p.name,
                        label: p.name,
                        id: p.id,
                        price: p.price
                    }));
                    setProductOptions(opts);
                }
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };
        fetchProducts();

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

    const [headerInfo, setHeaderInfo] = useState({
        customerName: '',
        enqNo: '',
        allottedTo: '',
        jobCardNo: '',
        jobCardDate: ''
    });

    useEffect(() => {
        const fetchErectionData = async () => {
            if (!editId) return;
            setLoading(true);
            try {
                const [res, stockRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards/erection/${editId}`),
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
                        setHeaderInfo(prev => ({
                            ...prev,
                            customerName: cp.customer_name || '',
                            enqNo: cp.enquiry_no || '',
                            jobCardNo: data.jobcard_no || cp.enquiry_no || '',
                            jobCardDate: data.jobcard_date || cp.enquiry_date || '',
                            allottedTo: cp.allotted_to_name || '',
                            cashDiscount: cp.cash_discount || 0
                        }));
                        setAddr1(cp.address1 || '');
                        setAddr2(cp.address2 || '');
                        setAddr3(cp.address3 || '');
                        
                        const cityName = cp.city || '';
                        if (cityName) {
                           setCity({ label: cityName, value: cityName.toLowerCase() });
                        }
                        
                        setContactRows([{
                            id: 1,
                            contactPerson: cp.contact_person || '',
                            designation: cp.designation || '',
                            contactNumber: cp.contact_number || '',
                            convenientTime: cp.convenient_time || ''
                        }]);
                        
                        if (cp.enquiry_date) {
                            const parts = cp.enquiry_date.split('/');
                            if (parts.length === 3) {
                                setEnqDate(`${parts[2]}-${parts[1]}-${parts[0]}`);
                            }
                        }
                    }
                    
                    if (data.product_details && data.product_details.length > 0) {
                        const pd = data.product_details.map((item, index) => {
                            const basic = Number(item.basic) || 0;
                            const tax = Number(item.tax_percentage) || 0;
                            const pnf = Number(item.pf) || 0;
                            const qty = Number(item.quantity) || 0;
                            const rate = Number(item.original_rate) || 0;
                            const discount = Number(item.discount) || 0;
                            const buyback = Number(item.buyback) || 0;
                            
                            const stockInfo = stockDataMap[item.id] || {};
                            const availableSerials = (stockInfo.available_serial_numbers || [])
                                .filter(s => s)
                                .map(s => ({ value: s, label: s }));

                            const existingSerialsStr = item.serial_number || '';
                            const existingSerialsArr = existingSerialsStr.split(',').filter(Boolean);
                            const serialNumbers = Array.from({ length: qty > 0 ? qty : 1 }, (_, i) => {
                                const val = existingSerialsArr[i] || '';
                                return { value: val, isText: !availableSerials.find(s => s.value === val) && val !== '' };
                            });

                            const availableStock = stockInfo.available_stock !== undefined
                                ? Number(stockInfo.available_stock)
                                : (Number(stockInfo.stock_qty) || 0);

                            return {
                                id: item.id || Date.now() + index,
                                productName: item.product_name || '',
                                qty, rate, discount, buyback, pnf, tax,
                                basic,
                                pnfAmt: Number(item.pf_amount) || 0,
                                taxAmt: Number(item.tax_amount) || 0,
                                amount: Number(item.total_value) || 0,
                                serialNumbers,
                                serialOptionsList: availableSerials,
                                availableStock,
                                labour: item.labour_by ? { value: item.labour_by, label: item.labour_by } : null,
                                date: item.date ? (item.date.includes('/') ? item.date.split('/').reverse().join('-') : item.date) : new Date().toISOString().split('T')[0]
                            };
                        });
                        // Call calculation API on load to fix legacy 0 values
                        try {
                            const payload = {
                                customer_id: data.customer_profile?.id || 1,
                                enquiry_date: cp.enquiry_date ? cp.enquiry_date.split('/').reverse().join('-') : new Date().toISOString().split('T')[0],
                                cash_discount: Number(cp.cash_discount || 0),
                                details: pd.map(p => ({
                                    product_id: p.productId || 101,
                                    product_name: p.productName || 'Product',
                                    quantity: p.qty,
                                    original_rate: p.rate,
                                    discount: p.discount,
                                    buyback: p.buyback,
                                    pf: p.pnf,
                                    tax_percentage: p.tax
                                }))
                            };
                            const calcRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/enquiry/enquiry/calculate`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });
                            const calcResult = await calcRes.json();
                            if (calcResult.status === 'success' && calcResult.data && calcResult.data.details) {
                                calcResult.data.details.forEach((calc, idx) => {
                                    if (pd[idx]) {
                                        pd[idx].basic = calc.calculated_basic || 0;
                                        pd[idx].pnfAmt = calc.calculated_pf_amount || 0;
                                        pd[idx].taxAmt = calc.calculated_tax_amount || 0;
                                        pd[idx].amount = calc.calculated_total_value || 0;
                                    }
                                });
                            }
                        } catch (err) {
                            console.error("Error with initial calculation:", err);
                        }

                        setProductRows(pd);
                    }
                    
                    if (data.installation_details) {
                        const inst = data.installation_details;
                        setVehicleNumber(inst.vehicle_number || '');
                        setDriverName(inst.driver_name || '');
                        setInstMobile(inst.mobile_number || '');
                        setRemark(inst.remark_text || '');
                        
                        if (inst.product_taken_by_name) {
                            setProductTakenBy({ value: inst.product_taken_by_name, label: inst.product_taken_by_name });
                            setHeaderInfo(prev => ({
                                ...prev,
                                allottedTo: inst.product_taken_by_name
                            }));
                        }
                    }
                    if (data.tax_summary && data.tax_summary.totals && data.tax_summary.totals.freight !== undefined) {
                        setFreightValue(data.tax_summary.totals.freight);
                    }
                }
            } catch (error) {
                console.error("Error fetching erection data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchErectionData();
    }, [editId]);

    const handleUpdateClick = () => {
        const hasInsufficientStock = productRows.some(item => parseInt(item.qty || 0) > (item.availableStock || 0));
        if (hasInsufficientStock) {
            setErrorMessage("Cannot save: Insufficient stock for one or more products.");
            setErrorPopupOpen(true);
            return;
        }
        setIsUpdatePopupOpen(true);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = {
                customer_profile: {
                    address1: addr1,
                    address2: addr2,
                    address3: addr3,
                    city: city ? city.label : '',
                    contact_person: contactRows[0] ? contactRows[0].contactPerson : '',
                    designation: contactRows[0] ? contactRows[0].designation : '',
                    contact_number: contactRows[0] ? contactRows[0].contactNumber : '',
                    convenient_time: contactRows[0] ? contactRows[0].convenientTime : ''
                },
                installation_details: {
                    vehicle_number: vehicleNumber,
                    driver_name: driverName,
                    mobile_number: instMobile,
                    remark_text: remark,
                    product_taken_by_name: productTakenBy ? productTakenBy.label : '',
                    product_taken_by: productTakenBy ? productTakenBy.value : 0
                },
                items: productRows.map(p => ({
                    enquiry_detail_id: typeof p.id === 'number' && p.id > 1000000000000 ? undefined : p.id,
                    product_name: p.productName,
                    quantity: p.qty,
                    original_rate: p.rate,
                    discount: p.discount,
                    buyback: p.buyback,
                    pf: p.pnf,
                    tax_percentage: p.tax,
                    serial_number: p.serialNumbers ? p.serialNumbers.map(s => s.value).filter(Boolean).join(',') : '',
                    labour_by: p.labour ? p.labour.value : '',
                    date: p.date
                })),
                freight: Number(freightValue) || 0
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
                    city_id: city ? city.value : null,
                    contactRows
                })
            });

            // 2. Submit Erection Update
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sales/jobcards/erection/update/${editId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status) {
                navigate('/sales/job-card', { state: { defaultTab: 'erection' } }); // Redirect to job card list
            } else {
                alert('Error updating Erection Details: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting form', error);
            alert('Failed to update Erection Details');
        } finally {
            setLoading(false);
        }
    };

    const [activeTab, setActiveTab] = useState('customerProfile');
    const [topDate,   setTopDate]   = useState(new Date().toISOString().split('T')[0]);
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);

    /* ── Customer Profile state ── */
    const [addr1, setAddr1]     = useState('');
    const [addr2, setAddr2]     = useState('');
    const [addr3, setAddr3]     = useState('');
    const [city,  setCity]      = useState(null);
    const [enqDate, setEnqDate] = useState('');
    const [contactRows, setContactRows] = useState(INITIAL_CONTACT_ROWS);

    const addContact    = () => setContactRows(p => [...p, { id: Date.now(), contactPerson: '', designation: '', contactNumber: '', convenientTime: '' }]);
    const deleteContact = (id) => setContactRows(p => p.length > 1 ? p.filter(r => r.id !== id) : p);
    const updateContact = (id, field, value) => setContactRows(p => p.map(r => r.id === id ? { ...r, [field]: value } : r));

    const abortControllersRef = useRef({});

    /* ── Tab rows state (Product / Accessories / Labour / Installation) ── */
    const initRow = (overrides = {}) => ({
        id: Date.now() + Math.random(),
        productName: '', qty: 1, rate: 0, discount: 0, buyback: 0,
        basic: 0, pnf: 0, pnfAmt: 0, tax: 18, taxAmt: 0, amount: 0,
        serialNumbers: [{ value: '', isText: false }], serialOptionsList: [], labour: null, date: new Date().toISOString().split('T')[0],
        availableStock: 0,
        ...overrides
    });

    const [productRows,  setProductRows]  = useState([initRow()]);

    const [freightValue, setFreightValue] = useState('');

    const handleProductSelect = async (rowId, opt) => {
        if (!opt) {
            updateProduct(rowId, 'productName', '');
            return;
        }

        try {
            // Fetch stock for this product
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

            updateProduct(rowId, {
                productName: opt.value,
                rate: opt.price || 0,
                availableStock: newStock,
                serialOptionsList: availableSerials
            });
        } catch (err) {
            console.error("Error fetching stock:", err);
        }
    };

    const updateProduct = async (rowId, field, value) => {
        let updatedRows = [];
        
        setProductRows(prev => {
            const next = prev.map(r => {
                if (r.id !== rowId) return r;
                
                let updated = { ...r };
                if (typeof field === 'object' && field !== null) {
                    updated = { ...updated, ...field };
                } else {
                    if (['qty', 'rate', 'discount', 'buyback', 'pnf'].includes(field)) {
                        if (Number(value) < 0) return r;
                    }
                    if (field === 'tax') value = Number(value) || 0;
                    updated[field] = value;
                    
                    if (field === 'qty') {
                        const qty = Number(value) || 0;
                        const currentSerials = updated.serialNumbers || [];
                        if (qty > currentSerials.length) {
                            updated.serialNumbers = [
                                ...currentSerials,
                                ...Array.from({ length: qty - currentSerials.length }, () => ({ value: '', isText: false }))
                            ];
                        } else if (qty > 0 && qty < currentSerials.length) {
                            updated.serialNumbers = currentSerials.slice(0, qty);
                        } else if (qty === 0) {
                            updated.serialNumbers = [];
                        }
                    }
                }
                return updated;
            });
            updatedRows = next;
            return next;
        });

        // Debounce calculation API call
        if (abortControllersRef.current[rowId]) {
            clearTimeout(abortControllersRef.current[rowId]);
        }

        abortControllersRef.current[rowId] = setTimeout(async () => {
            try {
                // Ensure we get the latest row state for calculations
                const latestRows = updatedRows.length > 0 ? updatedRows : productRows;
                const payload = {
                    customer_id: 1,
                    enquiry_date: enqDate || new Date().toISOString().split('T')[0],
                    cash_discount: Number(headerInfo?.cashDiscount || 0),
                    details: latestRows.map(p => ({
                        product_id: 101, // fallback
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
                    setProductRows(prev => {
                        return prev.map((r, idx) => {
                            const calc = result.data.details[idx];
                            if (calc) {
                                return {
                                    ...r,
                                    basic: calc.calculated_basic,
                                    pnfAmt: calc.calculated_pf_amount,
                                    taxAmt: calc.calculated_tax_amount,
                                    amount: calc.calculated_total_value
                                };
                            }
                            return r;
                        });
                    });
                }
            } catch (error) {
                console.error("Error calculating via API:", error);
            }
        }, 500);
    };

    const updateSerialNumber = (rowId, sIdx, field, value) => {
        setProductRows(prev => prev.map(r => {
            if (r.id !== rowId) return r;
            const nextSerials = [...(r.serialNumbers || [])];
            if (nextSerials[sIdx]) {
                nextSerials[sIdx] = { ...nextSerials[sIdx], [field]: value };
            }
            return { ...r, serialNumbers: nextSerials };
        }));
    };

    const addProductRow = () => {
        setProductRows(prev => [...prev, initRow()]);
    };

    const deleteProductRow = (rowId) => {
        setProductRows(prev => prev.length > 1 ? prev.filter(r => r.id !== rowId) : prev);
    };

    const pH = {
        update: updateProduct,
        updateSerialNumber,
        addRow: addProductRow,
        delRow: deleteProductRow
    };

    /* ── Installation Details state ── */
    const [employeeOptions, setEmployeeOptions] = useState([]);
    
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/employee`);
                const result = await res.json();
                if (result.status && result.data) {
                    const options = result.data.map(item => ({
                        value: item.id,
                        label: item.name
                    }));
                    setEmployeeOptions(options);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const [productTakenBy, setProductTakenBy] = useState(null);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [instMobile, setInstMobile] = useState('');
    const [remark, setRemark] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/employee`);
                const result = await res.json();
                if (result.status && result.data) {
                    const options = result.data.map(item => ({
                        value: item.id,
                        label: item.name
                    }));
                    setEmployeeOptions(options);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    /* ── Totals helper ── */
    const totals = (rows, freightAmt) => {
        const sub  = rows.reduce((s, r) => s + (r.basic || 0), 0);
        const pnfTotal = rows.reduce((s, r) => s + (r.pnfAmt || 0), 0);
        const sgst = rows.reduce((s, r) => s + (r.tax === 18 ? (r.taxAmt || 0) / 2 : r.tax === 9 ? (r.taxAmt || 0) : 0), 0);
        const cgst = sgst;
        const igst = rows.reduce((s, r) => s + (r.tax === 5 ? (r.taxAmt || 0) : 0), 0);
        const net  = Math.round(sub + pnfTotal + sgst + cgst + igst + (Number(freightAmt) || 0));
        return { sub, pnfTotal, sgst, cgst, igst, net };
    };

    /* ── Render shared table + totals ── */
    const renderTab = (rows, h, freightAmt, setFreightAmt) => {
        const t = totals(rows, freightAmt);
        return (
            <div>
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th style={{ minWidth: 250 }}>Product Name</th>
                                <th style={{ minWidth: 100 }}>Available Qty</th>
                                <th style={{ minWidth: 90 }}>Quantity</th>
                                <th style={{ minWidth: 100 }}>Rate</th>
                                <th style={{ minWidth: 95 }}>Discount</th>
                                <th style={{ minWidth: 95 }}>Buyback</th>
                                <th style={{ minWidth: 100 }}>Basic</th>
                                <th style={{ minWidth: 80 }}>P&F(%)</th>
                                <th style={{ minWidth: 150 }}>Tax</th>
                                <th style={{ minWidth: 110 }}>Amount</th>
                                <th style={{ minWidth: 150 }}>Serial Number</th>
                                {/* <th style={{ minWidth: 160 }}>Labour / Erection By</th> */}
                                <th style={{ minWidth: 140 }}>Date</th>
                                <th style={{ minWidth: 80 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id}>
                                    <td className="tw-align-middle">
                                        <Select
                                            className="tw-w-full"
                                            options={productOptions}
                                            value={productOptions.find(o => o.value === r.productName) || (r.productName ? { label: r.productName, value: r.productName } : null)}
                                            onChange={(opt) => handleProductSelect(r.id, opt)}
                                            placeholder="Select Product"
                                            isClearable
                                            styles={rsStyles}
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                            menuPosition="fixed"
                                        />
                                    </td>
                                    <td className="tw-align-middle tw-text-center">
                                        {r.availableStock || 0}
                                    </td>
                                    <td className="tw-align-middle">
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={r.qty} onChange={e => h.update(r.id, 'qty', e.target.value)} style={{ minWidth: '90px', width: r.qty ? `${r.qty.toString().length + 2}ch` : 'auto' }} />
                                    </td>
                                    <td className="tw-align-middle">
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={r.rate} onChange={e => h.update(r.id, 'rate', e.target.value)} style={{ minWidth: '120px', width: r.rate ? `${r.rate.toString().length + 2}ch` : 'auto' }} />
                                    </td>
                                    <td className="tw-align-middle">
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={r.discount} onChange={e => h.update(r.id, 'discount', e.target.value)} style={{ minWidth: '120px', width: r.discount ? `${r.discount.toString().length + 2}ch` : 'auto' }} />
                                    </td>
                                    <td className="tw-align-middle">
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={r.buyback} onChange={e => h.update(r.id, 'buyback', e.target.value)} style={{ minWidth: '95px', width: r.buyback ? `${r.buyback.toString().length + 2}ch` : 'auto' }} />
                                    </td>
                                    <td className="tw-align-middle">
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={r.basic} readOnly style={{ background: '#f8fafc', minWidth: '100px', width: r.basic ? `${r.basic.toString().length + 2}ch` : 'auto' }} />
                                    </td>
                                    <td className="tw-align-middle">
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={r.pnf} onChange={e => h.update(r.id, 'pnf', e.target.value)} placeholder="%" style={{ minWidth: '80px', width: r.pnf ? `${r.pnf.toString().length + 2}ch` : 'auto' }} />
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control tw-mt-1" value={r.pnfAmt} readOnly style={{ background: '#f8fafc', minWidth: '80px', width: r.pnfAmt ? `${r.pnfAmt.toString().length + 2}ch` : 'auto' }} />
                                    </td>
                                    <td className="tw-align-middle">
                                        <Select
                                            options={taxOptions}
                                            value={taxOptions.find(o => o.id === r.taxId) || taxOptions.find(o => Number(o.percentage) === Number(r.tax))}
                                            onChange={opt => {
                                                h.update(r.id, 'tax', opt ? opt.percentage : 0);
                                                h.update(r.id, 'taxId', opt ? opt.id : null);
                                            }}
                                            styles={{ ...rsStyles, menuPortal: b => ({ ...b, zIndex: 9999 }) }}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control tw-mt-1" value={r.taxAmt} readOnly style={{ background: '#f8fafc', minWidth: '150px', width: r.taxAmt ? `${r.taxAmt.toString().length + 2}ch` : 'auto' }} />
                                    </td>
                                    <td className="tw-align-middle">
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" value={r.amount} readOnly style={{ background: '#f8fafc', fontWeight: 600, minWidth: '110px', width: r.amount ? `${r.amount.toString().length + 2}ch` : 'auto' }} />
                                    </td>
                                    <td className="tw-align-middle">
                                        {r.serialNumbers && r.serialNumbers.map((sn, sIdx) => (
                                            <div key={sIdx} className={sIdx > 0 ? "tw-mt-3" : ""}>
                                                {sn.isText ? (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter serial number"
                                                            value={sn.value}
                                                            onChange={(e) => pH.updateSerialNumber(r.id, sIdx, 'value', e.target.value)}
                                                        />
                                                        <div
                                                            className="tw-text-blue-500 tw-cursor-pointer tw-text-xs tw-mt-1 tw-font-medium hover:tw-underline"
                                                            onClick={() => pH.updateSerialNumber(r.id, sIdx, 'isText', false)}
                                                        >
                                                            Select from List
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Select
                                                            options={(r.serialOptionsList || []).filter(o =>
                                                                o.value === sn.value ||
                                                                !r.serialNumbers.some((otherSn, otherIdx) => otherIdx !== sIdx && !otherSn.isText && otherSn.value === o.value)
                                                            )}
                                                            styles={{
                                                                ...rsStyles,
                                                                menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                            }}
                                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                            menuPosition="fixed"
                                                            placeholder="Select"
                                                            value={(r.serialOptionsList || []).find(o => o.value === sn.value) || null}
                                                            onChange={(opt) => pH.updateSerialNumber(r.id, sIdx, 'value', opt ? opt.value : '')}
                                                        />
                                                        <div
                                                            className="tw-text-blue-500 tw-cursor-pointer tw-text-xs tw-mt-1 tw-font-medium hover:tw-underline"
                                                            onClick={() => {
                                                                pH.updateSerialNumber(r.id, sIdx, 'value', '');
                                                                pH.updateSerialNumber(r.id, sIdx, 'isText', true);
                                                            }}
                                                        >
                                                            + Add New
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </td>
                                    {/* <td className="tw-align-middle">
                                        <Select
                                            options={employeeOptions}
                                            value={employeeOptions.find(o => Number(o.value) === Number(r.labour?.value)) || null}
                                            onChange={opt => h.update(r.id, 'labour', opt)}
                                            placeholder="Select an Option"
                                            styles={{ ...rsStyles, menuPortal: b => ({ ...b, zIndex: 9999 }) }}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                    </td> */}
                                    <td className="tw-align-middle">
                                        <input type="date" className="form-control" value={r.date} onChange={e => h.update(r.id, 'date', e.target.value)} />
                                    </td>
                                    <td className="tw-align-middle tw-text-center">
                                        <div className="tw-flex tw-gap-1 tw-justify-center">
                                            <button type="button" className="table-add"    onClick={h.addRow}><i className="bi bi-plus-lg" /></button>
                                            <button type="button" className="table-delete" onClick={() => h.delRow(r.id)}><i className="bi bi-trash" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Tax Detail + Totals */}
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
                                            {rows.map((r, i) => (
                                                <tr key={r.id}>
                                                    <td>{i + 1}.</td>
                                                    <td>{(r.basic + (r.pnfAmt || 0)).toFixed(2)}</td>
                                                    <td>{r.tax ? `${r.tax}%` : '0%'}</td>
                                                    <td>{r.taxAmt.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card p-3">
                                <div className="d-flex justify-content-between py-2"><span>Sub Amount</span><span>{t.sub.toFixed(2)}</span></div>
                                {t.pnfTotal > 0 && (
                                    <div className="d-flex justify-content-between py-2"><span>P&F Amount</span><span>{t.pnfTotal.toFixed(2)}</span></div>
                                )}
                                <hr className="tw-my-1" />
                                <div className="d-flex justify-content-between py-2"><span>SGST</span><span>{t.sgst.toFixed(2)}</span></div>
                                <div className="d-flex justify-content-between py-2"><span>CGST</span><span>{t.cgst.toFixed(2)}</span></div>
                                <div className="d-flex justify-content-between py-2"><span>IGST</span><span>{t.igst}</span></div>
                                <hr className="tw-my-1" />
                                <div className="d-flex justify-content-between align-items-center py-2">
                                    <span>Freight Amount</span>
                                    <div style={{ width: 160 }}>
                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" placeholder="0.00" value={freightAmt} onChange={e => setFreightAmt(e.target.value)} />
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between py-3 mt-2" style={{ background: '#f1f5f9', borderRadius: 4, padding: '10px 12px' }}>
                                    <strong style={{ color: '#2563eb' }}>Net Total</strong>
                                    <strong style={{ color: '#2563eb' }}>{t.net.toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">

                    <div className="card-header with-border tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-center tw-gap-3 sm:tw-gap-0">
                        <h3 className="card-title tw-text-center sm:tw-text-left tw-w-full sm:tw-w-auto max-[320px]:tw-text-sm max-[320px]:tw-whitespace-nowrap max-[320px]:tw-overflow-hidden max-[320px]:tw-text-ellipsis">Erection Edit</h3>
                        <button className="btn-header-back" onClick={() => navigate('/sales/job-card', { state: { defaultTab: 'erection' } })}>Back</button>
                    </div>

                    <div className="card-body">

                        {/* ── Top info bar ── */}
                        <div className="tw-mb-5" style={{ background: '#cce9f7', borderRadius: 6, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Customer Name</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerInfo.customerName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Enquiry Number</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerInfo.enqNo}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Allotted To</span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <span style={{ color: '#0f2d40', fontSize: 14, fontWeight: 700 }}>{headerInfo.allottedTo}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>Date<span className="tw-text-red-500">*</span></span>
                                <span style={{ color: '#4a6a7c', fontSize: 14 }}>:</span>
                                <input type="date" className="form-control" value={topDate} onChange={e => setTopDate(e.target.value)} style={{ width: 160 }} />
                            </div>
                        </div>

                        {/* ── JobCard Number / Date ── */}
                        <div className="row tw-mb-4">
                            <div className="col-md-3 form-group">
                                <label>JobCard Number</label>
                                <input type="text" className="form-control" value={headerInfo.jobCardNo} readOnly />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>JobCard Date</label>
                                <input type="text" className="form-control" value={headerInfo.jobCardDate} readOnly />
                            </div>
                        </div>

                        {/* ── Product Stock Summary ── */}
                        <div className="tw-mb-5">
                            {/* Desktop Table View */}
                            <div className="tw-hidden md:tw-block tw-overflow-x-auto">
                                <table className="table table-bordered tw-text-center tw-mb-5 tw-min-w-full">
                                    <thead>
                                        <tr className="tw-bg-gray-100">
                                            <th className="tw-border-b tw-border-gray-200 tw-bg-white tw-py-3">Product Name</th>
                                            <th className="tw-border-b tw-border-gray-200 tw-bg-white tw-py-3">Available Quantity</th>
                                            <th className="tw-border-b tw-border-gray-200 tw-bg-white tw-py-3">Minimum Quantity</th>
                                            <th className="tw-border-b tw-border-gray-200 tw-bg-white tw-py-3">Suggested for PO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productRows.map((prod, i) => (
                                            <tr key={i}>
                                                <td className="tw-py-4">{prod.productName || 'Select Product'}</td>
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
                                        {productRows.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="tw-py-4 tw-text-center">No products found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:tw-hidden tw-flex tw-flex-col tw-gap-3 tw-bg-gray-50/50">
                                {productRows.map((prod, i) => (
                                    <div key={i} className="tw-border tw-border-gray-200 tw-rounded-md tw-p-4 tw-bg-white tw-shadow-sm">
                                        <div className="tw-mb-4">
                                            <div className="tw-text-[10px] tw-text-gray-500 tw-uppercase tw-font-bold tw-tracking-wider tw-mb-1">Product Name</div>
                                            <div className="tw-text-sm tw-font-semibold tw-text-gray-800">{prod.productName || 'Select Product'}</div>
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
                                {productRows.length === 0 && (
                                    <div className="tw-text-center tw-py-6 tw-text-sm tw-text-gray-500 tw-bg-white tw-rounded tw-border tw-border-gray-100">No products found</div>
                                )}
                            </div>
                        </div>

                        {/* ── Tabs — JobCardAdd style ── */}
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-4">
                            {TABS.map(t => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    className={`tw-w-full sm:tw-w-auto tw-px-4 tw-py-2 ${activeTab === t.key ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white tw-border tw-text-gray-700'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* ════════ Customer Profile ════════ */}
                        {activeTab === 'customerProfile' && (
                            <div>
                                <div className="row">
                                    <div className="col-md-4 form-group">
                                        <label>Address 1</label>
                                        <input type="text" className="form-control" placeholder="Address line 1" value={addr1} onChange={e => setAddr1(e.target.value)} />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Address 2</label>
                                        <input type="text" className="form-control" placeholder="Address line 2" value={addr2} onChange={e => setAddr2(e.target.value)} />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Address 3</label>
                                        <input type="text" className="form-control" placeholder="Address line 3" value={addr3} onChange={e => setAddr3(e.target.value)} />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>City</label>
                                        <Select options={cityOptions} value={city} onChange={setCity} placeholder="Select City" styles={rsStyles} />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Enquiry Date</label>
                                        <input type="date" className="form-control" value={enqDate} onChange={e => setEnqDate(e.target.value)} />
                                    </div>
                                </div>

                                {/* Contact Persons table */}
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
                                            {contactRows.map((row, i) => (
                                                <tr key={row.id}>
                                                    <td className="tw-align-middle tw-text-center">{i + 1}</td>
                                                    <td>
                                                        <input type="text" className="form-control" placeholder="Contact person name" value={row.contactPerson} onChange={e => updateContact(row.id, 'contactPerson', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="text" className="form-control" placeholder="Designation" value={row.designation} onChange={e => updateContact(row.id, 'designation', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="number" min="0" onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="form-control" placeholder="Contact number" value={row.contactNumber} onChange={e => updateContact(row.id, 'contactNumber', e.target.value)} />
                                                    </td>
                                                    <td>
                                                        <input type="text" className="form-control" placeholder="e.g. 10:00 AM – 12:00 PM" value={row.convenientTime} onChange={e => updateContact(row.id, 'convenientTime', e.target.value)} />
                                                    </td>
                                                    <td className="tw-align-middle">
                                                        <div className="tw-flex tw-gap-1 tw-justify-center">
                                                            <button type="button" className="table-add"    onClick={addContact}><i className="bi bi-plus-lg" /></button>
                                                            <button type="button" className="table-delete" onClick={() => deleteContact(row.id)}><i className="bi bi-trash" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'productDetails'      && renderTab(productRows, pH, freightValue, setFreightValue)}
                        {activeTab === 'installationDetails' && (
                            <div className="tw-mt-2">
                                <div className="row">
                                    <div className="col-md-4 form-group">
                                        <label>Product Taken By</label>
                                        <Select
                                            options={employeeOptions}
                                            value={employeeOptions.find(o => o.label === productTakenBy?.label || Number(o.value) === Number(productTakenBy?.value)) || null}
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

                    </div>

                    <div className="card-footer mt-3 d-flex justify-content-between">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/sales/job-card', { state: { defaultTab: 'erection' } })}>Cancel</button>
                        <button type="button" className="btn-create" onClick={handleUpdateClick}>Update</button>
                    </div>

                </div>
            </div>
            <UpdatePopup isOpen={isUpdatePopupOpen} onClose={() => setIsUpdatePopupOpen(false)} onConfirm={handleSubmit} />
        </section>
    );
};

export default ErectionEdit;
