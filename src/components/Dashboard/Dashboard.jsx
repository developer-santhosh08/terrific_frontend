/* OLD CALENDAR DASHBOARD — FULLY COMMENTED OUT */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { usePermissions } from '../../context/PermissionContext';
import Loader from '../Loader';
import { CurrencyInr, Hourglass, Bank, ClipboardText, Receipt, FileText, Wrench, PhoneCall, CheckCircle, TrendUp } from '@phosphor-icons/react';
import ExportMenu from './ExportMenu';

/* ── Data ──────────────────────────────────────────────────── */
const engineerOptions = [
    { value: 'all', label: 'All Engineers' },
    { value: 'raju', label: 'C.RAJU' },
    { value: 'chandru', label: 'CHANDRU' },
    { value: 'ramesh', label: 'RAMESH P' },
    { value: 'gokul', label: 'Gokul Shree' },
];
const yearOptions = [
    { value: '2021-2022', label: '2021-2022' },
    { value: '2022-2023', label: '2022-2023' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2025-2026', label: '2025-2026' },
    { value: '2026-2027', label: '2026-2027' },
];

const voucherOptions = [
    { value: 'Sales Voucher', label: 'Sales Voucher' },
    { value: 'Purchase Voucher', label: 'Purchase Voucher' },
    { value: 'Receipt Voucher', label: 'Receipt Voucher' },
    { value: 'Payment Voucher', label: 'Payment Voucher' },
    { value: 'Journal Voucher', label: 'Journal Voucher' },
    { value: 'Contra Voucher', label: 'Contra Voucher' },
];



const getDynamicYearOptions = (startYear = 2021) => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let i = startYear; i <= currentYear; i++) {
        options.push({ value: `${i}-${i + 1}`, label: `${i}-${i + 1}` });
    }
    return options;
};
const dynamicYearOptions = getDynamicYearOptions();

const months2026 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => `${m}-2026`);

const rsStyles = {
    control: b => ({ ...b, minHeight: 32, fontSize: 12, border: '1px solid #e2e8f0', boxShadow: 'none' }),
    menu: b => ({ ...b, zIndex: 9999, fontSize: 12 }),
    option: (b, s) => ({ ...b, background: s.isSelected ? '#2563eb' : s.isFocused ? '#eff6ff' : '#fff', color: s.isSelected ? '#fff' : '#1e293b' }),
};

/* ── echarts hook ───────────────────────────────────────────── */
const useChart = (ref, getOption, deps = []) => {
    useEffect(() => {
        const ec = window.echarts;
        if (!ec || !ref.current) return;
        let c = ec.getInstanceByDom(ref.current);
        if (!c) c = ec.init(ref.current, null, { renderer: 'svg' });
        c.setOption(getOption(), true);
        const ro = new ResizeObserver(() => c.resize());
        ro.observe(ref.current);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};

/* ── Bar option builder ─────────────────────────────────────── */
const pie = ({ data }) => ({
    backgroundColor: 'transparent',
    tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b', borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 11 }
    },
    legend: { bottom: 0, itemHeight: 8, textStyle: { color: '#64748b', fontSize: 10 } },
    series: [
        {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { 
                show: true,
                formatter: '{b}: {c}',
                color: '#475569',
                fontSize: 11,
                fontWeight: 600
            },
            labelLine: { show: true },
            data: data
        }
    ]
});

const bar = ({ cats, series }) => ({
    backgroundColor: 'transparent',
    tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b', borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 11 },
        axisPointer: { type: 'shadow' },
    },
    legend: series.length > 1
        ? { bottom: 0, itemHeight: 8, textStyle: { color: '#64748b', fontSize: 10 } }
        : { show: false },
    grid: { top: 24, bottom: series.length > 1 ? 36 : 28, left: 14, right: 14, containLabel: true },
    xAxis: {
        type: 'category', data: cats,
        axisLabel: { color: '#94a3b8', fontSize: 9, rotate: cats.length > 7 ? 30 : 0 },
        axisLine: { lineStyle: { color: '#e2e8f0' } }, axisTick: { show: false },
    },
    yAxis: {
        type: 'value',
        axisLabel: { color: '#94a3b8', fontSize: 9, formatter: v => v !== 0 ? (Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + 'K' : v) : '' },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLine: { show: false }, axisTick: { show: false },
    },
    series: series.map(s => ({
        name: s.name, type: 'bar', data: s.data, barMaxWidth: 48,
        itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: s.c1 }, { offset: 1, color: s.c2 }] },
        },
        label: {
            show: true, position: 'top', fontSize: 9, color: '#64748b',
            formatter: p => p.value !== 0 ? Number(p.value).toLocaleString('en-IN') : ''
        },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: s.c1 + '44' } },
    })),
});

/* ── Stat Card ──────────────────────────────────────────────── */
const Stat = ({ label, value, sub, c1, c2, icon, onClick }) => (
    <div
        onClick={onClick}
        style={{
            background: `linear-gradient(135deg,${c1},${c2})`,
            borderRadius: 16, padding: '22px 24px',
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: `0 8px 24px ${c1}44`,
            cursor: onClick ? 'pointer' : 'default',
        }}>
        <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>{value}</div>
            {sub && <div style={{ fontSize: 11, opacity: 0.75 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 36, opacity: 0.25, lineHeight: 1 }}>{icon}</div>
    </div>
);

/* ── Chart Card ─────────────────────────────────────────────── */
const Card = ({ title, star, action, children, accent = '#2563eb', exportData, chartRef }) => (
    <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 2px 20px rgba(15,23,42,0.06)',
        border: '1px solid #f1f5f9',
        marginBottom: 24, overflow: 'hidden',
    }}>
        <div style={{
            padding: '12px 18px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `3px solid ${accent}`,
            background: `linear-gradient(90deg,${accent}08,transparent)`,
        }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                {star && <span style={{ color: '#ef4444', fontSize: 10 }}>★</span>}
                {title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {action && <div style={{ minWidth: 180 }}>{action}</div>}
                {(chartRef || exportData) && <ExportMenu chartRef={chartRef} data={exportData} title={title} />}
            </div>
        </div>
        <div style={{ padding: '14px 18px' }}>{children}</div>
    </div>
);

/* ── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
    const navigate = useNavigate();
    const { userHeaderData } = usePermissions();
    const userPermissions = userHeaderData?.rights || [];
    const hasOverview = userPermissions.some(p => p.startsWith('Dashboard.Overview'));
    const hasAnalytics = userPermissions.some(p => p.startsWith('Dashboard.Analytics'));

    // Role-based visibility
    const userRole = userHeaderData?.role?.toLowerCase() || '';
    const isSuperAdmin = userRole === 'super admin' || userRole === 'super_admin';

    const [enqEng, setEnqEng] = useState(null);
    const [profEng, setProfEng] = useState(null);
    const [yearlyProfitYear, setYearlyProfitYear] = useState(null);
    const [salesProfitYear, setSalesProfitYear] = useState(null);
    const [paymentVoucherYear, setPaymentVoucherYear] = useState(null);
    const [vendorPaymentYear, setVendorPaymentYear] = useState(null);

    const [convertedData, setConvertedData] = useState(Array(12).fill(0));
    const [convertedCats, setConvertedCats] = useState(months2026);

    const [balanceGst, setBalanceGst] = useState(0);
    const [advancePending, setAdvancePending] = useState(0);
    const [furtherPending, setFurtherPending] = useState(0);
    const [vendorPendingTotal, setVendorPendingTotal] = useState(0);

    const [yearlyProfitCats, setYearlyProfitCats] = useState(['2026-2027']);
    const [yearlyProfitData, setYearlyProfitData] = useState([0]);

    const [voucherOptions, setVoucherOptions] = useState([]);
    const [totalEnquiries, setTotalEnquiries] = useState(0);
    const [totalJobcards, setTotalJobcards] = useState(0);
    const [followupCounts, setFollowupCounts] = useState({ Infollowup: 0, Overdue: 0, Today: 0, 'Under Process': 0 });
    const [salesContactCounts, setSalesContactCounts] = useState({ Infollowup: 0, Closed: 0, Converted: 0, Hold: 0 });

    // Single fetch for all default data on mount
    useEffect(() => {
        const fetchInitialLoad = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };

                // Run all initial fetches in parallel
                const pEnq = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/total-enquiries`, { headers }).then(r => r.json()).catch(e => ({ status: 'error', error: e }));
                const pJob = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/total-jobcards`, { headers }).then(r => r.json()).catch(e => ({ status: 'error', error: e }));
                const pFol = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/followup-counts`, { headers }).then(r => r.json()).catch(e => ({ status: 'error', error: e }));
                const pSal = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/salescontact-counts`, { headers }).then(r => r.json()).catch(e => ({ status: 'error', error: e }));
                const pInit = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/initial-load`, { headers }).then(r => r.json()).catch(e => ({ status: 'error', error: e }));

                const [enqJson, jobJson, folJson, salJson, json] = await Promise.all([pEnq, pJob, pFol, pSal, pInit]);

                if (enqJson.status === 'success') setTotalEnquiries(enqJson.data.total_enquiries);
                if (jobJson.status === 'success') setTotalJobcards(jobJson.data.total_jobcards);
                if (folJson.status === 'success') setFollowupCounts(folJson.data);
                if (salJson.status === 'success') setSalesContactCounts(salJson.data);

                if (json.status === 'success') {
                    const data = json.data;

                    // 1. net-gst-value
                    if (data.net_gst?.status === 'success') setBalanceGst(data.net_gst.data.net_gst_value);
                    // 2. advance-pending-value
                    if (data.advance_pending?.status === 'success') setAdvancePending(data.advance_pending.data.advance_pending_total);
                    // 3. further-pending-value
                    if (data.further_pending?.status === 'success') setFurtherPending(data.further_pending.data.further_pending_total);
                    // 11. vendor-pending-payment-total
                    if (data.vendor_pending_total?.status === 'success') setVendorPendingTotal(data.vendor_pending_total.data.vendor_pending_total);
                    // 4. contra-report-count
                    if (data.contra_report?.status === 'success') {
                        setContraCats(data.contra_report.data.map(d => d.month));
                        setContraReceived(data.contra_report.data.map(d => d.Received));
                        setContraGiven(data.contra_report.data.map(d => d.Given));
                    }
                    // 5. payment-voucher-types
                    if (data.voucher_types?.status === 'success') {
                        const options = [{ value: 'all', label: 'All Vouchers' }];
                        data.voucher_types.data.forEach((name, idx) => options.push({ value: idx + 1, label: name }));
                        setVoucherOptions(options);
                    }
                    // 6. voucher-count-by-month
                    if (data.voucher_count?.status === 'success') {
                        setVoucherCats(data.voucher_count.data.map(d => d.month));
                        setVoucherData(data.voucher_count.data.map(d => d.Amount));
                    }
                    // 7. overall-company-profit (default 5 years)
                    if (data.overall_profit?.status === 'success') {
                        // wait, overall_profit in backend doesn't do 5 years by default.
                        // I should just let the yearlyProfitYear hook fetch it if it's not provided,
                        // OR let the initial load give us the default data. 
                        // Ah! The original frontend did a Promise.all for 5 years!
                        // The backend initialLoad just calls overallCompanyProfit with no year.
                    }
                    // 8. yearly-sales-profit
                    if (data.yearly_sales_profit?.status === 'success') {
                        setSalesProfitCats(data.yearly_sales_profit.data.map(d => d.engineer_name));
                        setSalesProfitData(data.yearly_sales_profit.data.map(d => d.yearly_sales_profit));
                    }
                    // 9. converted-sales-enquiry
                    if (data.converted_sales?.status === 'success') {
                        setConvertedCats(data.converted_sales.data.map(d => d.month));
                        setConvertedData(data.converted_sales.data.map(d => d.count));
                    }
                    // 10. monthly-company-profit
                    if (data.monthly_profit?.status === 'success') {
                        setMonthlyProfitCats(data.monthly_profit.data.map(m => m.month));
                        setMonthlyProfitData(data.monthly_profit.data.map(m => m.monthly_profit));
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchInitialLoad();
    }, []);

    // Refs to track initial render so dropdown hooks don't fire on mount
    const isFirstRenderSalesProfit = useRef(true);
    const isFirstRenderYearlyProfit = useRef(true);
    const isFirstRenderConverted = useRef(true);
    const isFirstRenderMonthlyProfit = useRef(true);
    const isFirstRenderVoucher = useRef(true);

    const [salesProfitCats, setSalesProfitCats] = useState([]);
    const [salesProfitData, setSalesProfitData] = useState([]);

    useEffect(() => {
        if (isFirstRenderSalesProfit.current) {
            isFirstRenderSalesProfit.current = false;
            return;
        }
        const fetchSalesProfit = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/yearly-sales-profit`);
                const json = await res.json();
                if (json.status === 'success') {
                    let data = json.data;
                    if (salesProfitYear && salesProfitYear.value !== 'all') {
                        data = data.filter(d =>
                            d.engineer_name.toLowerCase().includes(salesProfitYear.label.toLowerCase()) ||
                            salesProfitYear.label.toLowerCase().includes(d.engineer_name.toLowerCase())
                        );
                    }
                    setSalesProfitCats(data.map(d => d.engineer_name));
                    setSalesProfitData(data.map(d => d.yearly_sales_profit));
                }
            } catch (err) { console.error(err); }
        };
        fetchSalesProfit();
    }, [salesProfitYear]);

    useEffect(() => {
        // We ALWAYS need to run the Promise.all for the 5 years on mount if we didn't get it from initial-load!
        // Actually, since initial-load only returns 1 year for overall-company-profit, we SHOULD run this on mount!
        const fetchYearlyProfit = async () => {
            try {
                if (yearlyProfitYear) {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/overall-company-profit?year_range=${yearlyProfitYear.value}`);
                    const json = await res.json();
                    if (json.status === 'success') {
                        setYearlyProfitCats([yearlyProfitYear.value]);
                        setYearlyProfitData([json.data.overall_company_profit]);
                    }
                } else {
                    const currentYear = new Date().getFullYear();
                    const years = [];
                    for (let i = 0; i < 5; i++) {
                        const y = currentYear - i;
                        years.unshift(`${y}-${y + 1}`);
                    }
                    const promises = years.map(yr =>
                        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/overall-company-profit?year_range=${yr}`).then(res => res.json())
                    );
                    const results = await Promise.all(promises);
                    const data = results.map(json => json.status === 'success' ? json.data.overall_company_profit : 0);
                    setYearlyProfitCats(years);
                    setYearlyProfitData(data);
                }
            } catch (err) { console.error(err); }
        };
        fetchYearlyProfit();
    }, [yearlyProfitYear]);

    useEffect(() => {
        if (isFirstRenderConverted.current) {
            isFirstRenderConverted.current = false;
            return;
        }
        const fetchConverted = async () => {
            let url = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/converted-sales-enquiry`;
            if (enqEng) url += `?engineer_id=${enqEng.value}`;
            try {
                const res = await fetch(url);
                const json = await res.json();
                if (json.status === 'success') {
                    setConvertedCats(json.data.map(d => d.month));
                    setConvertedData(json.data.map(d => d.count));
                }
            } catch (err) { console.error(err); }
        };
        fetchConverted();
    }, [enqEng]);

    const [monthlyProfitCats, setMonthlyProfitCats] = useState(months2026);
    const [monthlyProfitData, setMonthlyProfitData] = useState(Array(12).fill(0));

    useEffect(() => {
        if (isFirstRenderMonthlyProfit.current) {
            isFirstRenderMonthlyProfit.current = false;
            return;
        }
        const fetchMonthlyProfit = async () => {
            try {
                if (profEng && profEng.value !== 'all') {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/monthly-profit-by-engineers`);
                    const json = await res.json();
                    if (json.status === 'success') {
                        const engData = json.data.find(d =>
                            d.engineer_name.toLowerCase().includes(profEng.label.toLowerCase()) ||
                            profEng.label.toLowerCase().includes(d.engineer_name.toLowerCase())
                        );
                        if (engData) {
                            setMonthlyProfitCats(engData.monthly_data.map(m => m.month));
                            setMonthlyProfitData(engData.monthly_data.map(m => m.monthly_profit));
                        } else {
                            setMonthlyProfitCats(months2026);
                            setMonthlyProfitData(Array(12).fill(0));
                        }
                    }
                } else {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/monthly-company-profit`);
                    const json = await res.json();
                    if (json.status === 'success') {
                        setMonthlyProfitCats(json.data.map(m => m.month));
                        setMonthlyProfitData(json.data.map(m => m.monthly_profit));
                    }
                }
            } catch (err) { console.error(err); }
        };
        fetchMonthlyProfit();
    }, [profEng]);

    const [voucherCats, setVoucherCats] = useState(months2026);
    const [voucherData, setVoucherData] = useState(Array(12).fill(0));

    useEffect(() => {
        if (isFirstRenderVoucher.current) {
            isFirstRenderVoucher.current = false;
            return;
        }
        const fetchVoucherData = async () => {
            try {
                let url;
                if (paymentVoucherYear && paymentVoucherYear.value !== 'all') {
                    url = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/voucher-count-by-types-and-month?type=${paymentVoucherYear.value}`;
                } else {
                    url = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/voucher-count-by-month`;
                }
                const res = await fetch(url);
                const json = await res.json();
                if (json.status === 'success') {
                    setVoucherCats(json.data.map(d => d.month));
                    setVoucherData(json.data.map(d => d.Amount));
                }
            } catch (err) { console.error(err); }
        };
        fetchVoucherData();
    }, [paymentVoucherYear]);

    const [contraCats, setContraCats] = useState(months2026);
    const [contraReceived, setContraReceived] = useState(Array(12).fill(0));
    const [contraGiven, setContraGiven] = useState(Array(12).fill(0));
    const [vendorPendingCats, setVendorPendingCats] = useState([]);
    const [vendorPendingData, setVendorPendingData] = useState([]);
    const [dynamicVendorOptions, setDynamicVendorOptions] = useState([{ value: 'all', label: 'All Vendors' }]);

    useEffect(() => {
        const fetchVendorPending = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/pending-vendor-payment`);
                const json = await res.json();
                if (json.status === 'success') {
                    const fullData = json.data;

                    // Update dropdown options with all returned vendors
                    const options = [{ value: 'all', label: 'All Vendors' }];
                    fullData.forEach(d => {
                        options.push({ value: d.vendor_id, label: d.vendor_name });
                    });
                    setDynamicVendorOptions(options);

                    let displayData = fullData;
                    if (vendorPaymentYear && vendorPaymentYear.value !== 'all') {
                        displayData = fullData.filter(d =>
                            d.vendor_id === vendorPaymentYear.value ||
                            d.vendor_name.toLowerCase().includes(vendorPaymentYear.label.toLowerCase())
                        );
                    }
                    setVendorPendingCats(displayData.map(d => d.vendor_name));
                    setVendorPendingData(displayData.map(d => d.total_pending_amount));
                }
            } catch (err) { console.error(err); }
        };
        fetchVendorPending();
    }, [vendorPaymentYear]);

    const rY = useRef(null), rS = useRef(null), rE = useRef(null),
        rP = useRef(null), rV = useRef(null), rVP = useRef(null), rC = useRef(null), rF = useRef(null), rSC = useRef(null);

    // Dynamic formatting
    const isGstPositive = balanceGst >= 0;
    const formattedBalanceGst = (balanceGst < 0 ? '-' : '') + '₹' + Math.abs(balanceGst).toLocaleString('en-IN');
    const formattedAdvancePending = '₹' + (advancePending || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const formattedFurtherPending = '₹' + (furtherPending || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const formattedVendorPendingTotal = '₹' + (vendorPendingTotal || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

    useChart(rY, () => bar({
        cats: yearlyProfitCats,
        series: [{ name: 'Net Profit', data: yearlyProfitData, c1: '#10b981', c2: '#059669' }],
    }), [yearlyProfitCats, yearlyProfitData]);

    useChart(rS, () => bar({
        cats: salesProfitCats,
        series: [{ name: 'Profit (₹)', data: salesProfitData, c1: '#3b82f6', c2: '#2563eb' }],
    }), [salesProfitCats, salesProfitData]);

    useChart(rE, () => bar({
        cats: convertedCats,
        series: [{ name: 'Enquiries', data: convertedData, c1: '#8b5cf6', c2: '#7c3aed' }],
    }), [convertedCats, convertedData]);

    useChart(rP, () => bar({
        cats: monthlyProfitCats,
        series: [{ name: 'Profit (₹)', data: monthlyProfitData, c1: '#f59e0b', c2: '#b45309' }],
    }), [monthlyProfitCats, monthlyProfitData]);

    useChart(rV, () => bar({
        cats: voucherCats,
        series: [{ name: 'Amount (₹)', data: voucherData, c1: '#06b6d4', c2: '#0891b2' }],
    }), [voucherCats, voucherData]);

    useChart(rVP, () => bar({
        cats: vendorPendingCats,
        series: [{ name: 'Amount (₹)', data: vendorPendingData, c1: '#6366f1', c2: '#4f46e5' }],
    }), [vendorPendingCats, vendorPendingData]);

    useChart(rC, () => bar({
        cats: contraCats,
        series: [
            { name: 'Received', data: contraReceived, c1: '#3b82f6', c2: '#2563eb' },
            { name: 'Given', data: contraGiven, c1: '#8b5cf6', c2: '#7c3aed' },
        ]
    }), [contraCats, contraReceived, contraGiven]);

    useChart(rF, () => pie({
        data: [
            { value: followupCounts['Under Process'] || 0, name: 'Under Process', itemStyle: { color: '#94a3b8' } },
            { value: followupCounts['Infollowup'] || 0, name: 'In Followup', itemStyle: { color: '#3b82f6' } },
            { value: followupCounts['Today'] || 0, name: 'Today', itemStyle: { color: '#f59e0b' } },
            { value: followupCounts['Overdue'] || 0, name: 'Overdue', itemStyle: { color: '#ef4444' } }
        ]
    }), [followupCounts]);

    // Data for Sales Contact Status Custom Chart
    const totalSalesContacts = (salesContactCounts['Infollowup'] || 0) + (salesContactCounts['Closed'] || 0) + (salesContactCounts['Converted'] || 0) + (salesContactCounts['Hold'] || 0);
    const scData = [
        { id: 'in_followup', label: 'In Followup', value: salesContactCounts['Infollowup'] || 0, color: '#3b82f6', bg: '#eff6ff', icon: <PhoneCall weight="duotone" /> },
        { id: 'closed', label: 'Closed', value: salesContactCounts['Closed'] || 0, color: '#64748b', bg: '#f1f5f9', icon: <CheckCircle weight="duotone" /> },
        { id: 'converted', label: 'Converted', value: salesContactCounts['Converted'] || 0, color: '#10b981', bg: '#ecfdf5', icon: <TrendUp weight="duotone" /> },
        { id: 'hold', label: 'Hold', value: salesContactCounts['Hold'] || 0, color: '#f59e0b', bg: '#fff7ed', icon: <Hourglass weight="duotone" /> },
    ];

    return (
        <section className="content">
            <div className="container-fluid">

                {/* ══ Stat Cards (Super Admin Only) ══════════════════════════════════ */}
                {(hasOverview && isSuperAdmin) && (
                    <>
                        <div className="row" style={{ marginBottom: 24, rowGap: 16 }}>
                            <div className="col-md-4">
                                <Stat label="Balance GST" value={formattedBalanceGst}
                                    sub="Current outstanding" icon={<CurrencyInr weight="duotone" />}
                                    c1={isGstPositive ? "#10b981" : "#ef4444"}
                                    c2={isGstPositive ? "#059669" : "#b91c1c"} />
                            </div>
                            <div className="col-md-4">
                                <Stat label="Advance Collection Pending" value={formattedAdvancePending}
                                    sub={`${formattedAdvancePending} total`} icon={<Hourglass weight="duotone" />}
                                    c1="#f59e0b" c2="#b45309"
                                    onClick={() => navigate('/sales/advanced-receipt')} />
                            </div>
                            <div className="col-md-4">
                                <Stat label="Vendor Payment Outstanding" value={formattedVendorPendingTotal}
                                    sub="Pending vendor dues" icon={<Bank weight="duotone" />}
                                    c1="#2563eb" c2="#1e40af"
                                    onClick={() => navigate('/inventory/further-receipt')} />
                            </div>
                        </div>
                    </>
                )}

                {/* ══ Info Bar ════════════════════════════════════ */}
                {hasOverview && (
                    <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                        {[
                            ...(isSuperAdmin ? [
                                { label: 'Further Collection Pending', value: formattedFurtherPending, sub: `${formattedFurtherPending} total`, icon: <ClipboardText weight="duotone" />, c1: '#64748b', c2: '#334155', link: '/sales/further-receipt' },
                                { label: 'Receipt Collection Pending', value: '0', sub: 'No pending receipts', icon: <Receipt weight="duotone" />, c1: '#8b5cf6', c2: '#7c3aed', link: '/sales/further-receipt' }
                            ] : []),
                            { label: 'Total Enquiries', value: totalEnquiries.toLocaleString('en-IN'), sub: 'Total enquiries received', icon: <FileText weight="duotone" />, c1: '#06b6d4', c2: '#0891b2', link: '/enquiry' },
                            { label: 'Total Job Cards', value: totalJobcards.toLocaleString('en-IN'), sub: 'Converted enquiries', icon: <Wrench weight="duotone" />, c1: '#10b981', c2: '#059669', link: '/sales/job-card' },
                        ].map(({ label, value, sub, icon, c1, c2, link }) => (
                                <div key={label}
                                    onClick={() => { if (link) navigate(link); }}
                                    style={{
                                        flex: 1, minWidth: 180,
                                        background: `linear-gradient(135deg,${c1},${c2})`,
                                        borderRadius: 16, padding: '22px 24px',
                                        color: '#fff', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        boxShadow: `0 8px 24px ${c1}44`,
                                    }}>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>{label}</div>
                                        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>{value}</div>
                                        <div style={{ fontSize: 11, opacity: 0.75 }}>{sub}</div>
                                    </div>
                                    <div style={{ fontSize: 36, opacity: 0.25, lineHeight: 1 }}>{icon}</div>
                                </div>
                            ))}
                        </div>
                )}

                {/* ══ Row 1: Followup & Sales Contact (All Roles) ═════════ */}
                {hasAnalytics && (
                    <>
                        <div className="row">
                            <div className="col-md-6">
                                <Card title="Followup Status" accent="#3b82f6" chartRef={rF} exportData={Object.entries(followupCounts).map(([status, count]) => ({ Status: status, Count: count }))}>
                                    <div ref={rF} style={{ height: 320 }} />
                                </Card>
                            </div>
                            <div className="col-md-6">
                                <Card title="Sales Contact Status" accent="#8b5cf6" chartRef={rSC} exportData={scData.map(d => ({ Status: d.label, Count: d.value }))}>
                                    <div ref={rSC} style={{ height: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, padding: '0 20px', background: '#fff' }}>
                                        {scData.map(item => {
                                            const pctNum = totalSalesContacts ? (item.value / totalSalesContacts) * 100 : 0;
                                            return (
                                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 90, fontSize: 13, fontWeight: 600, color: '#475569' }}>
                                                        {item.label}
                                                    </div>
                                                    <div style={{ flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', backgroundColor: item.color, width: `${pctNum}%`, borderRadius: 4 }}></div>
                                                    </div>
                                                    <div style={{ width: 40, textAlign: 'right', fontSize: 15, fontWeight: 700, color: item.color }}>
                                                        {item.value.toLocaleString()}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* ══ Super Admin Only Analytics ═════════ */}
                        {isSuperAdmin && (
                            <>
                                {/* ══ Row 2: Yearly Profit + Sales Profit ═════════ */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <Card title="Sales Yearly Profit" accent="#10b981" chartRef={rY}
                                            action={<Select options={dynamicYearOptions} value={yearlyProfitYear} onChange={setYearlyProfitYear}
                                                placeholder="Choose a Year" isClearable styles={rsStyles} />}>
                                            <div ref={rY} style={{ height: 250 }} />
                                        </Card>
                                    </div>
                                    <div className="col-md-6">
                                        <Card title="Sales Profit" star accent="#3b82f6" chartRef={rS}
                                            action={<Select options={engineerOptions} value={salesProfitYear} onChange={setSalesProfitYear}
                                                placeholder="Choose an Engineer" isClearable styles={rsStyles} />}>
                                            <div ref={rS} style={{ height: 250 }} />
                                        </Card>
                                    </div>
                                </div>

                                {/* ══ Row 3: Converted Enquiry + Eng Profit ═══════ */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <Card title="Converted Sales Enquiry" star accent="#8b5cf6" chartRef={rE}
                                            action={<Select options={engineerOptions} value={enqEng} onChange={setEnqEng}
                                                placeholder="Choose a Engineer" isClearable styles={rsStyles} />}>
                                            <div ref={rE} style={{ height: 250 }} />
                                        </Card>
                                    </div>
                                    <div className="col-md-6">
                                        <Card title="Sales Engineer Monthly Profit" star accent="#f59e0b" chartRef={rP}
                                            action={<Select options={engineerOptions} value={profEng} onChange={setProfEng}
                                                placeholder="Choose a Engineer" isClearable styles={rsStyles} />}>
                                            <div ref={rP} style={{ height: 250 }} />
                                        </Card>
                                    </div>
                                </div>

                                {/* ══ Row 4: Payment Voucher + Vendor Pending ══════ */}
                                <div className="row">
                                    <div className="col-md-6">
                                        <Card title="Payment Voucher" star accent="#06b6d4" chartRef={rV}
                                            action={<Select options={voucherOptions} value={paymentVoucherYear} onChange={setPaymentVoucherYear}
                                                placeholder="Choose a Voucher" isClearable styles={rsStyles} />}>
                                            <div ref={rV} style={{ height: 250 }} />
                                        </Card>
                                    </div>
                                    <div className="col-md-6">
                                        <Card title="Vendor Payment Pending" star accent="#6366f1" chartRef={rVP}
                                            action={<Select options={dynamicVendorOptions} value={vendorPaymentYear} onChange={setVendorPaymentYear}
                                                placeholder="Choose a Vendor" isClearable styles={rsStyles} />}>
                                            <div ref={rVP} style={{ height: 250 }} />
                                        </Card>
                                    </div>
                                </div>

                                {/* ══ Row 5: Contra Report full width ══════════════ */}
                                <div className="row">
                                    <div className="col-md-12">
                                        <Card title="Contra Report" star accent="#3b82f6" chartRef={rC}>
                                            <div ref={rC} style={{ height: 250 }} />
                                        </Card>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

            </div>
        </section>
    );
};

export default Dashboard;
