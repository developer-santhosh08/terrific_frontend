import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';
import Select from 'react-select';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import SubmitPopup from '../../components/Popup/SubmitPopup.jsx';
import { apiFetch } from '../../lib/api.js';

const UserRightsAdd = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoader();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        status: 'Active',
        employee_id: null,
        mobile_number: '',
        address: '',
        designation: '',
        department: '',
        join_date: '',
        date_of_birth: ''
    });

    const [roles, setRoles] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const confirmPasswordRef = useRef(null);

    useEffect(() => {
        if (confirmPasswordRef.current) {
            if (formData.password_confirmation && formData.password !== formData.password_confirmation) {
                confirmPasswordRef.current.setCustomValidity("Passwords do not match");
            } else {
                confirmPasswordRef.current.setCustomValidity("");
            }
        }
    }, [formData.password, formData.password_confirmation]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const rolesRes = await apiFetch('/roles/users/admin/roles');
                if (rolesRes?.json?.data) {
                    setRoles(rolesRes.json.data.map(r => ({ value: r.name, label: r.display_name })));
                }

                const empRes = await apiFetch('/roles/users/admin/employees');
                if (empRes?.json?.data) {
                    setEmployees(empRes.json.data.map(emp => ({
                        value: emp.id,
                        label: emp.name,
                        employeeData: emp
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setLoading]);

    const handleEmployeeChange = (selectedOption) => {
        setSelectedEmployee(selectedOption);
        if (selectedOption) {
            const emp = selectedOption.employeeData;
            setFormData(prev => ({
                ...prev,
                employee_id: emp.id || null,
                name: emp.name || '',
                mobile_number: emp.mobile_number || '',
                address: emp.address || '',
                designation: emp.designation || '',
                department: emp.department || '',
                join_date: emp.join_date || '',
                date_of_birth: emp.date_of_birth || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                employee_id: null,
                name: '',
                mobile_number: '',
                address: '',
                designation: '',
                department: '',
                join_date: '',
                date_of_birth: ''
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            return;
        }
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                role: formData.role,
                status: formData.status === 'Active' ? 1 : 0,
                employee_id: formData.employee_id,
                mobile_number: formData.mobile_number,
                address: formData.address,
                designation: formData.designation,
                department: formData.department,
                join_date: formData.join_date,
                date_of_birth: formData.date_of_birth
            };

            const response = await apiFetch('/roles/users/admin/users/create', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response && response.json && response.json.status) {
                setShowSubmitPopup(false);
                navigate('/user-rights');
            } else {
                console.error("Create failed", response?.json);
                setShowSubmitPopup(false);
            }
        } catch (error) {
            console.error("Failed to create user", error);
            setShowSubmitPopup(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/user-rights');
    };

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Create User</h3>
                        <button className="btn-header-back" onClick={() => navigate('/user-rights')}> Back
                        </button>
                    </div>
                    <div className="card-body" style={{ padding: '40px' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                {/* Row 1: Employee Select */}
                                <div className="col-12 mb-4">
                                    <div className="form-group" style={{ maxWidth: '400px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                                            Select Employee (Optional)
                                        </label>
                                        <Select
                                            options={employees}
                                            value={selectedEmployee}
                                            onChange={handleEmployeeChange}
                                            placeholder="Search & Select Employee..."
                                            isClearable
                                            classNamePrefix="react-select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    padding: '2px',
                                                    borderRadius: '8px',
                                                    borderColor: '#e2e8f0'
                                                })
                                            }}
                                        />
                                        <small className="text-muted d-block mt-1">Selecting an employee will auto-fill their details.</small>
                                    </div>
                                </div>
                                <div className="col-12 mt-0 mb-3"><hr style={{ opacity: 0.1 }} /></div>

                                {/* Row 2: Name & Email */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Email <span className="text-danger">*</span></label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Password <span className="text-danger">*</span> <small className="text-muted">(8 chars only)</small></label>
                                        <div className="position-relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control"
                                                name="password"
                                                placeholder="*****"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                minLength="8"
                                                maxLength="8"
                                                style={{ paddingRight: '40px' }}
                                            />
                                            <button
                                                className="btn btn-link p-0 text-muted"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    zIndex: 10,
                                                    border: 'none',
                                                    background: 'transparent',
                                                    outline: 'none',
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Confirm Password <span className="text-danger">*</span></label>
                                        <div className="position-relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="form-control"
                                                name="password_confirmation"
                                                placeholder="*****"
                                                value={formData.password_confirmation}
                                                onChange={handleChange}
                                                required
                                                minLength="8"
                                                maxLength="8"
                                                ref={confirmPasswordRef}
                                                style={{ paddingRight: '40px' }}
                                            />
                                            <button
                                                className="btn btn-link p-0 text-muted"
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    zIndex: 10,
                                                    border: 'none',
                                                    background: 'transparent',
                                                    outline: 'none',
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Role <span className="text-danger">*</span></label>
                                        <Select
                                            options={roles}
                                            value={roles.find(r => r.value === formData.role)}
                                            onChange={(selected) => setFormData(prev => ({ ...prev, role: selected.value }))}
                                            placeholder="Select Role"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label>Status <span className="text-danger">*</span></label>
                                        <Select
                                            options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
                                            value={{ value: formData.status, label: formData.status }}
                                            onChange={(selected) => setFormData(prev => ({ ...prev, status: selected.value }))}
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hidden profile fields populated from employee selection */}
                            <input type="hidden" name="mobile_number" value={formData.mobile_number} />
                            <input type="hidden" name="address" value={formData.address} />
                            <input type="hidden" name="designation" value={formData.designation} />
                            <input type="hidden" name="department" value={formData.department} />
                            <input type="hidden" name="join_date" value={formData.join_date} />
                            <input type="hidden" name="date_of_birth" value={formData.date_of_birth} />

                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup isOpen={showSubmitPopup} onClose={() => setShowSubmitPopup(false)} onConfirm={handleConfirmSubmit} />
        </section>
    );
};

export default UserRightsAdd;
