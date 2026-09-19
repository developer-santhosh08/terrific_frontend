import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import UpdatePopup from '../../../../components/Popup/UpdatePopup.jsx';


const EmployeeTypeEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [employeeType, setEmployeeType] = useState('');
    const [status, setStatus] = useState(null);
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const { loading, setLoading } = useLoader();
    const [apiError, setApiError] = useState('');

    const statusOptions = [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' }
    ];

    useEffect(() => {
        const fetchEmployeeType = async () => {
            try {
                const token = sessionStorage.getItem('erp_token');
                const __apiRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-type/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const result = await __apiRes.json();
                if (result.status && result.data) {
                    const item = Array.isArray(result.data) ? result.data[0] : result.data;
                    if (item) {
                        setEmployeeType(item.name || '');
                        const statusVal = item.status === 1 ? '1' : (item.status === 0 ? '0' : '1');
                        const selectedStatus = statusOptions.find(opt => opt.value === statusVal) || statusOptions[0];
                        setStatus(selectedStatus);
                    }
                }
            } catch (error) {
                console.error('Error fetching employee type:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeeType();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, setLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setApiError('');
        const newErrors = {};
        if (!employeeType.trim()) newErrors.employeeType = 'The employee type field is required.';
        if (Object.keys(newErrors).length > 0) { 
            // In a real app we might setErrors(newErrors), but we are just blocking submit
            return; 
        }
        setShowUpdatePopup(true);
    };

    const handleConfirmUpdate = async () => {
        setLoading(true);
        try {
            const payload = {
                name: employeeType,
                status: status.value
            };

            const token = sessionStorage.getItem('erp_token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/master/employee-type/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result?.status) {
                navigate('/power-master/employee/employee-type');
            } else {
                const detail = result?.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result?.message;
                setApiError(detail || 'Failed to update employee type.');
                setShowUpdatePopup(false);
            }
        } catch (error) {
            console.error('Error updating employee type:', error);
            setApiError('Network error. Please try again.');
            setShowUpdatePopup(false);
        } finally {
            setLoading(false);
        }
    };


    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Edit Employee Type</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/employee/employee-type')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        {loading ? (
                            <div className="text-center tw-py-4 tw-text-slate-500">Loading...</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-12 col-md-3 form-group">
                                        <label>Employee Type <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" value={employeeType} onChange={(e) => setEmployeeType(e.target.value)} placeholder="Enter Employee Type" />
                                    </div>
                                    <div className="col-12 col-md-3 form-group">
                                        <label>Status</label>
                                        <Select 
                                            options={statusOptions}
                                            value={status}
                                            onChange={setStatus}
                                            placeholder="Status"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <hr />
                                <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/power-master/employee/employee-type')}>Cancel</button>
                                    <button type="submit" className="btn-save" disabled={loading}>
                                        {loading ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <UpdatePopup isOpen={showUpdatePopup} onClose={() => setShowUpdatePopup(false)} onConfirm={handleConfirmUpdate} />

        </section>
    );
};
export default EmployeeTypeEdit;
