import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { PrinterIcon } from '@phosphor-icons/react';
import { useLoader } from '../../../context/LoaderContext';
import { usePermissions } from '../../../context/PermissionContext';

const DailyWise = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const { hasPermission } = usePermissions();
    
    const [voucherOptions, setVoucherOptions] = useState([]);
    const [voucherType, setVoucherType] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchTypes = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/types`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const json = await res.json();
                
                let data = [];
                if (Array.isArray(json)) data = json;
                else if (json && json.data) {
                    if (Array.isArray(json.data)) data = json.data;
                    else if (Array.isArray(json.data.data)) data = json.data.data;
                }
                
                const opts = data.map(item => {
                    if (typeof item === 'string') {
                        return { value: item, label: item };
                    }
                    return {
                        value: item.id || item.payment_voucher_type || item.type_name || item.name,
                        label: item.payment_voucher_type || item.type_name || item.name || `Type ${item.id}`
                    };
                });
                setVoucherOptions(opts);
                if (opts.length > 0) {
                    setVoucherType(opts[0]);
                }
            } catch (err) {
                console.error('Error fetching voucher types:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTypes();
    }, []);

    const handleCancel = () => {
        setVoucherType(voucherOptions.length > 0 ? voucherOptions[0] : null);
        setFromDate('');
        setToDate('');
    };

    const handlePrint = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/payment-voucher/daywise-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    voucher_type: voucherType ? voucherType.value : '',
                    from_date: fromDate ? fromDate.split('-').reverse().join('-') : '',
                    to_date: toDate ? toDate.split('-').reverse().join('-') : ''
                })
            });
            const json = await res.json();
            
            navigate('/print/daywise-report', { 
                state: { 
                    reportData: json, 
                    fromDate: fromDate ? fromDate.split('-').reverse().join('-') : '', 
                    toDate: toDate ? toDate.split('-').reverse().join('-') : '' 
                } 
            });
            
        } catch (err) {
            console.error('Error fetching report:', err);
            alert('Failed to fetch report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card tw-mb-4">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Daywise Expense Report</h3>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handlePrint}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Voucher Type</label>
                                    <Select
                                        options={voucherOptions}
                                        value={voucherType}
                                        onChange={opt => setVoucherType(opt)}
                                        styles={{ control: (p) => ({ ...p, background: '#fff', minHeight: '36px' }), menu: (p) => ({ ...p, zIndex: 9999 }) }}
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>From Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fromDate}
                                        onChange={e => setFromDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>To Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={toDate}
                                        onChange={e => setToDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-actions mt-3 d-flex justify-content-between">
                                <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                                {hasPermission('Bank Process.Daywise Report.Print') && (
                                    <button type="submit" className="btn-save tw-flex tw-items-center tw-gap-1">
                                        <PrinterIcon weight="bold" /> Print
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DailyWise;
