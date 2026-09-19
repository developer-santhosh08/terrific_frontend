import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../components/Popup/SubmitPopup';
import { useLoader } from '../../../context/LoaderContext';

const rsStyles = {
    control: (provided) => ({ ...provided, background: '#fff', minHeight: '36px' }),
    menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const PaymentVoucherAdd = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitPopupOpen, setIsSubmitPopupOpen] = useState(false);

    const [voucherTypeOptions, setVoucherTypeOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [paymentModeOptions, setPaymentModeOptions] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('erp_token');
                const headers = {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                };
                
                const [typesRes, empRes, paymentModeRes, accountRes, jobcardRes, vendorRes, customerRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/types`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/employee`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/payment-mode`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/accuntholdername`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/jobcard-numbers`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/vendor`, { headers }).catch(() => null),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/dropdown/customer`, { headers }).catch(() => null)
                ]);
                
                if (typesRes) {
                    const typesJson = await typesRes.json();
                    if (typesJson.status === 'success' && Array.isArray(typesJson.data)) {
                        setVoucherTypeOptions(typesJson.data.map((item, index) => ({ value: index + 1, label: item })));
                    }
                }
                
                if (empRes) {
                    const empJson = await empRes.json();
                    const empData = Array.isArray(empJson) ? empJson : (empJson?.data || []);
                    setEmployeeOptions(empData.map(e => ({
                        value: e.id,
                        label: e.name,
                        salary: e.salary,
                        salary_advance: e.salary_advance,
                        working_days: e.working_days,
                        leave_days: e.leave_days,
                        ot_days: e.ot_days
                    })));
                }

                if (paymentModeRes) {
                    const modeJson = await paymentModeRes.json();
                    const modeData = Array.isArray(modeJson) ? modeJson : (modeJson?.data || []);
                    setPaymentModeOptions(modeData.map(m => ({ value: m.id, label: m.name })));
                }

                if (accountRes) {
                    const accJson = await accountRes.json();
                    const accData = Array.isArray(accJson) ? accJson : (accJson?.data || []);
                    setAccountHolderOptions(accData.map(a => ({ value: a.id, label: a.holder_name || a.name || a.account_name || a.label || '' })));
                }

                if (jobcardRes) {
                    const jcJson = await jobcardRes.json();
                    const jcData = Array.isArray(jcJson) ? jcJson : (jcJson?.data || []);
                    setJobcardOptions(jcData.map(j => ({ value: j.id, label: j.jobcard_number || j.jobcard_no || j.name || j.number || j.label || '' })));
                }

                try {
                    const budgetRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/budget-details`, { headers });
                    const budgetJson = await budgetRes.json();
                    const budgetData = Array.isArray(budgetJson) ? budgetJson : (budgetJson?.data || []);
                    setBudgetOptions(budgetData.map(b => ({ value: b.id, label: b.finance_year || b.name || `Budget ${b.id}` })));
                } catch (e) {}

                if (vendorRes) {
                    const venJson = await vendorRes.json();
                    const venData = Array.isArray(venJson) ? venJson : (venJson?.data || []);
                    setVendorOptions(venData.map(v => ({ value: v.id, label: v.name })));
                }

                if (customerRes) {
                    const custJson = await customerRes.json();
                    const custData = Array.isArray(custJson) ? custJson : (custJson?.data || []);
                    setCustomerOptions(custData.map(c => ({ value: c.id, label: c.name })));
                }
            } catch (err) {
                console.error('Error fetching dropdowns:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDropdowns();
    }, []);
    
    const [accountHolderOptions, setAccountHolderOptions] = useState([]);
    const [jobcardOptions, setJobcardOptions] = useState([]);
    const [budgetOptions, setBudgetOptions] = useState([]);
    const yesNo = [ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ];

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [voucherType, setVoucherType] = useState(null);
    const [budgetName, setBudgetName] = useState(null);
    const [employee, setEmployee] = useState(null);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [vendor, setVendor] = useState(null);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [ifJobcard, setIfJobcard] = useState(null);
    const [jobcardChecked, setJobcardChecked] = useState(false);
    const [selectedJobcard, setSelectedJobcard] = useState(null);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [supplier, setSupplier] = useState(null);
    const [advanceTo, setAdvanceTo] = useState(null);
    
    const advanceToOptions = [
        { value: 'Vendor', label: 'Vendor' },
        { value: 'Employee', label: 'Employee' }
    ];
    
    const [transferType, setTransferType] = useState(null);
    const transferTypeOptions = [
        { value: 'withdraw', label: 'Withdraw' },
        { value: 'deposit', label: 'Deposit' }
    ];
    const [depositWithdrawAccount, setDepositWithdrawAccount] = useState(null);

    const [transactionType, setTransactionType] = useState('Debit');
    const txnOptions = [
        { value: 'Debit', label: 'Debit' },
        { value: 'Credit', label: 'Credit' }
    ];
    const [paymentMode, setPaymentMode] = useState(null);
    const [accountHolder, setAccountHolder] = useState(null);
    const [balanceBudget, setBalanceBudget] = useState('0.00');
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [suspense, setSuspense] = useState(null);
    const [remark, setRemark] = useState('');
    
    // Salary fields
    const [salaryAmount, setSalaryAmount] = useState('');
    const [salaryAdvance, setSalaryAdvance] = useState('');
    const [workingDays, setWorkingDays] = useState('');
    const [leaveDays, setLeaveDays] = useState('');
    const [otDays, setOtDays] = useState('');
    const [alreadyDeductedLeaves, setAlreadyDeductedLeaves] = useState('');
    const [incentiveAmount, setIncentiveAmount] = useState('');
    const [petrolAmount, setPetrolAmount] = useState('');

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitPopupOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitPopupOpen(false);
        setIsSubmitting(true);
        setLoading(true);
        const payload = {
            document_date: date,
            payment_voucher_type: voucherType ? voucherType.value : null,
            budget_id: budgetName ? budgetName.value : null,
            transaction_type: transactionType === 'Debit' ? 1 : 2,
            payment_mode: paymentMode ? paymentMode.value : null,
            bank_account_details_id: accountHolder ? accountHolder.value : null,
            amount: Number(amount) || 0,
            name: name,
            suspense_status: suspense && suspense.value === 'yes' ? 1 : 0,
            remarks: remark,
            jobcard_status: jobcardChecked ? 1 : 0,
            project_id: jobcardChecked && selectedJobcard ? selectedJobcard.value : null,
            balance: Number(balanceBudget) || 0,
            deposit_bank_id: depositWithdrawAccount ? depositWithdrawAccount.value : 0,
            transfer_type: transferType ? (transferType.value === 'withdraw' ? 1 : 2) : 0,
            advance_to: advanceTo?.value === 'Vendor' ? 1 : (advanceTo?.value === 'Employee' ? 2 : 0),
            vendor_id: (voucherType?.label?.toLowerCase().includes('advance') && advanceTo?.value !== 'Vendor') ? 0 : (vendor ? vendor.value : 0),
            supplier_id: (voucherType?.label?.toLowerCase().includes('advance') && advanceTo?.value !== 'Supplier') ? 0 : (supplier ? supplier.value : 0),
            customer_id: customer ? customer.value : 0,
            employee_id: (voucherType?.label?.toLowerCase().includes('advance') && advanceTo?.value !== 'Employee') ? 0 : (employee ? employee.value : 0),
            salary_amount: Number(salaryAmount) || 0,
            salary_advance: Number(salaryAdvance) || 0,
            working_days: Number(workingDays) || 0,
            leave_days: Number(leaveDays) || 0,
            already_deducted_leaves: Number(alreadyDeductedLeaves) || 0,
            ot_days: Number(otDays) || 0,
            incentive_amount: Number(incentiveAmount) || 0,
            petrol_amount: Number(petrolAmount) || 0
        };

        try {
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bankprocess/payment-voucher`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.status === 'success' || json.status === true) {
                navigate('/bank-process/payment-voucher');
            } else {
                console.error('Failed to create payment voucher:', json);
                alert(json.message || 'Failed to create payment voucher');
            }
        } catch (err) {
            console.error('Error creating payment voucher:', err);
            alert('An error occurred while creating payment voucher.');
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const projectLikeVouchers = ['project', 'machinery', 'machinary', 'company material', 'emi', 'loan', 'intrest', 'interest', 'expense', 'tpc', 'transport', 'logistics', 'itc input gst', 'md1 personal', 'md2 personal'];
    const isProjectLike = voucherType?.label && projectLikeVouchers.some(v => voucherType.label.toLowerCase().includes(v));

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Payment Voucher</h3>
                        <button className="btn-header-back" onClick={() => navigate('/bank-process/payment-voucher')}> Back</button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleFormSubmit}>
                            <div className="row">
                                <div className="col-md-3 form-group">
                                    <label>Date</label>
                                    <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Payment Voucher Type <span className="text-danger">*</span></label>
                                    <Select options={voucherTypeOptions} styles={rsStyles} value={voucherType} onChange={setVoucherType} placeholder="Select Voucher Type" />
                                </div>
                                {voucherType?.label?.toLowerCase().includes('advance') && (
                                    <div className="col-md-3 form-group">
                                        <label>Advance To <span className="text-danger">*</span></label>
                                        <Select options={advanceToOptions} styles={rsStyles} value={advanceTo} onChange={setAdvanceTo} placeholder="Select" />
                                    </div>
                                )}
                                {voucherType?.label?.toLowerCase().includes('customer') && (
                                    <div className="col-md-3 form-group">
                                        <label>Customer Name <span className="text-danger">*</span></label>
                                        <Select options={customerOptions} styles={rsStyles} value={customer} onChange={setCustomer} placeholder="Select Customer" />
                                    </div>
                                )}
                                {!(voucherType?.label?.toLowerCase().includes('salary') || voucherType?.label?.toLowerCase().includes('vendor') || voucherType?.label?.toLowerCase().includes('customer') || voucherType?.label?.toLowerCase().includes('advance') || voucherType?.label?.toLowerCase().includes('deposit') || isProjectLike) && (
                                    <div className="col-md-3 form-group">
                                        <label>Budget Name <span className="text-danger">*</span></label>
                                        <Select options={budgetOptions} styles={rsStyles} value={budgetName} onChange={setBudgetName} placeholder="Select Budget" />
                                    </div>
                                )}
                                {!(voucherType?.label?.toLowerCase().includes('vendor') || voucherType?.label?.toLowerCase().includes('customer') || (voucherType?.label?.toLowerCase().includes('advance') && advanceTo?.value !== 'Employee') || voucherType?.label?.toLowerCase().includes('deposit') || isProjectLike) && (
                                    <div className="col-md-3 form-group">
                                        <label>Employee Name <span className="text-danger">*</span></label>
                                        <Select options={employeeOptions} styles={rsStyles} value={employee} onChange={(opt) => {
                                            setEmployee(opt);
                                            if (opt) {
                                                setSalaryAmount(opt.salary || '');
                                                setSalaryAdvance(opt.salary_advance || '');
                                                setWorkingDays(opt.working_days || '');
                                                setLeaveDays(opt.leave_days || '');
                                                setOtDays(opt.ot_days || '');
                                            }
                                        }} placeholder="Select Employee" />
                                    </div>
                                )}
                                {(voucherType?.label?.toLowerCase().includes('vendor') || (voucherType?.label?.toLowerCase().includes('advance') && advanceTo?.value === 'Vendor')) && (
                                    <div className="col-md-3 form-group">
                                        <label>Vendor Name <span className="text-danger">*</span></label>
                                        <Select options={vendorOptions} styles={rsStyles} value={vendor} onChange={setVendor} placeholder="Select Vendor" />
                                    </div>
                                )}
                                
                                {voucherType?.label?.toLowerCase().includes('deposit') && (
                                    <>
                                        <div className="col-md-3 form-group">
                                            <label>Transfer Type <span className="text-danger">*</span></label>
                                            <Select options={transferTypeOptions} styles={rsStyles} value={transferType} onChange={setTransferType} placeholder="Select" />
                                        </div>
                                    </>
                                )}
                                {(voucherType?.label?.toLowerCase().includes('deposit') || isProjectLike) && (
                                    <div className="col-md-3 form-group">
                                        <label>Deposit / Withdraw Account <span className="text-danger">*</span></label>
                                        <Select options={accountHolderOptions} styles={rsStyles} value={depositWithdrawAccount} onChange={setDepositWithdrawAccount} placeholder="Select Account" />
                                    </div>
                                )}
                                {isProjectLike && (
                                    <div className="col-md-3 form-group">
                                        <label>Name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                )}


                                <div className="col-md-3 form-group">
                                    <label>Transaction Type</label>
                                    <Select options={txnOptions} styles={rsStyles} value={txnOptions.find(o=>o.value===transactionType)} onChange={opt => setTransactionType(opt ? opt.value : '')} placeholder="Select" />
                                </div>
                                 <div className="col-md-3 form-group">
                                    <label>Payment Mode</label>
                                    <Select options={paymentModeOptions} styles={rsStyles} value={paymentMode} onChange={setPaymentMode} placeholder="Select Mode" />
                                </div>
                                <div className="col-md-3 form-group">
                                    <label>Account Holder Name <span className="text-danger">*</span></label>
                                    <Select options={accountHolderOptions} styles={rsStyles} value={accountHolder} onChange={setAccountHolder} placeholder="Choose Account Holder" />
                                </div>
                                {!(voucherType?.label?.toLowerCase().includes('salary') || voucherType?.label?.toLowerCase().includes('vendor') || voucherType?.label?.toLowerCase().includes('customer') || voucherType?.label?.toLowerCase().includes('advance') || voucherType?.label?.toLowerCase().includes('deposit') || isProjectLike) && (
                                     <div className="col-md-3 form-group">
                                        <label>Balance Budget Amount</label>
                                        <input type="text"  className="form-control" value={balanceBudget} />
                                    </div>
                                )}


                                
                                {voucherType?.label?.toLowerCase().includes('salary') && (
                                    <>
                                        <div className="col-md-3 form-group">
                                            <label>Salary Amount</label>
                                            <input type="number" className="form-control" value={salaryAmount} onChange={e => setSalaryAmount(e.target.value)} />
                                        </div>
                                        <div className="col-md-3 form-group">
                                            <label>Salary Advance</label>
                                            <input type="number" className="form-control" value={salaryAdvance} onChange={e => setSalaryAdvance(e.target.value)} />
                                        </div>
                                        <div className="col-md-3 form-group">
                                            <label>Working Days</label>
                                            <input type="number" className="form-control" value={workingDays} onChange={e => setWorkingDays(e.target.value)} />
                                        </div>
                                        <div className="col-md-3 form-group">
                                            <label>Leave Days</label>
                                            <input type="number" className="form-control" value={leaveDays} onChange={e => setLeaveDays(e.target.value)} />
                                        </div>
                                        <div className="col-md-3 form-group">
                                            <label>OT Days</label>
                                            <input type="number" className="form-control" value={otDays} onChange={e => setOtDays(e.target.value)} />
                                        </div>
                                        <div className="col-md-3 form-group">
                                            <label>Already Deducted Leaves</label>
                                            <input type="number" className="form-control" value={alreadyDeductedLeaves} onChange={e => setAlreadyDeductedLeaves(e.target.value)} />
                                        </div>
                                        <div className="col-md-3 form-group">
                                            <label>Incentive Amount</label>
                                            <input type="number" className="form-control" value={incentiveAmount} onChange={e => setIncentiveAmount(e.target.value)} />
                                        </div>
                                        <div className="col-md-3 form-group">
                                            <label>Petrol Amount</label>
                                            <input type="number" className="form-control" value={petrolAmount} onChange={e => setPetrolAmount(e.target.value)} />
                                        </div>
                                    </>
                                )}

                                <div className="col-md-3 form-group">
                                    <label>Amount <span className="text-danger">*</span></label>
                                    <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} />
                                </div>
                                {!(voucherType?.label?.toLowerCase().includes('salary') || voucherType?.label?.toLowerCase().includes('vendor') || voucherType?.label?.toLowerCase().includes('customer') || voucherType?.label?.toLowerCase().includes('advance') || voucherType?.label?.toLowerCase().includes('deposit') || isProjectLike) && (
                                    <div className="col-md-3 form-group">
                                        <label>Suspense</label>
                                        <Select options={yesNo} styles={rsStyles} value={suspense} onChange={setSuspense} placeholder="Select" />
                                    </div>
                                )}
                                <div className="col-md-3 form-group">
                                    <label>Remark</label>
                                    <input type="text" className="form-control" value={remark} onChange={e => setRemark(e.target.value)} />
                                </div>
                            </div>

                         

                            <div className="tw-mt-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="ifJobcardAdd" checked={jobcardChecked} onChange={e => setJobcardChecked(e.target.checked)} />
                                    <label className="form-check-label" htmlFor="ifJobcardAdd">If Jobcard</label>
                                </div>
                                {jobcardChecked && (
                                    <div className="tw-mt-2" style={{ maxWidth: 360 }}>
                                        <label>Jobcard Number</label>
                                        <Select options={jobcardOptions} styles={rsStyles} value={selectedJobcard} onChange={setSelectedJobcard} placeholder="Select Jobcard" />
                                    </div>
                                )}
                            </div>

                            <div className="form-actions mt-3 d-flex justify-content-between">
                                <button type="button" className="btn-cancel" onClick={() => navigate('/bank-process/payment-voucher')} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Voucher'}</button>
                            </div>
                        </form>
                        <SubmitPopup 
                            isOpen={isSubmitPopupOpen} 
                            onClose={() => setIsSubmitPopupOpen(false)} 
                            onConfirm={handleConfirmSubmit} 
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PaymentVoucherAdd;
