import { useLoader } from '../../../../context/LoaderContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import SubmitPopup from '../../../../components/Popup/SubmitPopup.jsx';
import WarningPopup from '../../../../components/Popup/WarningPopup.jsx';
import { apiFetch } from '../../../../lib/api';

const ContraPersonAdd = () => {
    const { setLoading } = useLoader();

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile_number: '',
        address_line1: '',
        address_line2: '',
        address_line3: '',
        city: '',
        state: '',
        pin_code: '',
        status: 1,
    });
    const [showSubmitPopup, setShowSubmitPopup] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [stateOptions, setStateOptions] = useState([]);
    const [statesLoading, setStatesLoading] = useState(false);
    const [cityOptions, setCityOptions] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);

    // Fetch states on mount
    useEffect(() => {
        const fetchStates = async () => {
            setStatesLoading(true);
            try {
                const result = await apiFetch(`/master/geolocation?type=state&country_id=1`);
                if (!result) return;
                const { res, json } = result;
                if (json.status && Array.isArray(json.data)) {
                    setStateOptions(json.data.map(s => ({ value: s.name, label: s.name, id: s.id })));
                }
            } catch (err) {
                // silently fall back to empty list
            } finally {
                setStatesLoading(false);
            }
        };
        fetchStates();
    }, []);

    // Derive the selected state's ID from stateOptions + formData.state
    const currentStateId = stateOptions.find(o => o.value === formData.state)?.id ?? null;

    // Fetch cities whenever the selected state changes
    useEffect(() => {
        if (!currentStateId) { setCityOptions([]); return; }
        const fetchCities = async () => {
            setCitiesLoading(true);
            try {
                const result = await apiFetch(`/master/geolocation?type=city&state_id=${currentStateId}`);
                if (!result) return;
                const { res, json } = result;
                if (json.status && Array.isArray(json.data)) {
                    setCityOptions(json.data.map(c => ({ value: c.name, label: c.name })));
                }
            } catch (err) {
                // silently fall back
            } finally {
                setCitiesLoading(false);
            }
        };
        fetchCities();
    }, [currentStateId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, option) => {
        setFormData(prev => ({ ...prev, [name]: option ? option.value : '' }));
    };

    const [showWarningPopup, setShowWarningPopup] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const requiredFields = [];
        if (!formData.name) requiredFields.push("Name");
        if (!formData.email) requiredFields.push("Email");
        if (!formData.mobile_number) requiredFields.push("Mobile Number");
        if (!formData.address_line1) requiredFields.push("Address Line 1");
        if (!formData.state) requiredFields.push("State");
        if (!formData.city) requiredFields.push("City");
        if (formData.status === null || formData.status === undefined || formData.status === '') requiredFields.push("Status");

        if (requiredFields.length > 0) {
            setWarningMessage(`Please fill the following required fields:\n${requiredFields.join(', ')}`);
            setShowWarningPopup(true);
            return;
        }

        setApiError('');
        setShowSubmitPopup(true);
    };

    const handleConfirmSubmit = async () => {
        setSubmitting(true);
        setApiError('');
        try {
            const result = await apiFetch(`/master/contra-master`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!result) return;
            const { res, json } = result;
            if (json.status) {
                navigate('/power-master/contra/contra-person');
            } else {
                setApiError(json.message || 'Failed to create contra person.');
            }
        } catch (err) {
            setApiError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
            setShowSubmitPopup(false);
        }
    };

    const statusOptions = [
        { value: 1, label: 'Active' },
        { value: 0, label: 'Inactive' },
    ];



    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Add Contra Person</h3>
                        <button className="btn-header-back" onClick={() => navigate('/power-master/contra/contra-person')}>
                            Back
                        </button>
                    </div>
                    <div className="card-body">
                        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Email <span className="text-danger">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Mobile Number <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="mobile_number"
                                        className="form-control"
                                        placeholder="Mobile Number"
                                        value={formData.mobile_number}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 1 <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="address_line1"
                                        className="form-control"
                                        placeholder="Address Line 1"
                                        value={formData.address_line1}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 2</label>
                                    <input
                                        type="text"
                                        name="address_line2"
                                        className="form-control"
                                        placeholder="Address Line 2"
                                        value={formData.address_line2}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Address Line 3</label>
                                    <input
                                        type="text"
                                        name="address_line3"
                                        className="form-control"
                                        placeholder="Address Line 3"
                                        value={formData.address_line3}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>State <span className="text-danger">*</span></label>
                                    <Select
                                        options={stateOptions}
                                        placeholder={statesLoading ? 'Loading...' : 'Select State'}
                                        isLoading={statesLoading}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        value={formData.state ? { value: formData.state, label: formData.state } : null}
                                        onChange={(opt) => {
                                            setFormData(prev => ({ ...prev, state: opt ? opt.value : '', city: '' }));
                                        }}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>City <span className="text-danger">*</span></label>
                                    <Select
                                        options={cityOptions}
                                        placeholder={citiesLoading ? 'Loading...' : formData.state ? 'Select City' : 'Select state first'}
                                        isLoading={citiesLoading}
                                        isDisabled={!formData.state}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        value={formData.city ? { value: formData.city, label: formData.city } : null}
                                        onChange={(opt) => handleSelectChange('city', opt)}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Pin Code</label>
                                    <input
                                        type="text"
                                        name="pin_code"
                                        className="form-control"
                                        placeholder="Pin Code"
                                        value={formData.pin_code}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-12 col-md-3 form-group mb-3">
                                    <label>Status <span className="text-danger">*</span></label>
                                    <Select
                                        options={statusOptions}
                                        placeholder="Select Status"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        value={statusOptions.find(o => o.value === formData.status) || null}
                                        onChange={(opt) => handleSelectChange('status', opt)}
                                    />
                                </div>
                            </div>
                            <hr />
                            <div className="form-actions mt-3 d-flex justify-content-between gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => navigate('/power-master/contra/contra-person')}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-save" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <SubmitPopup
                isOpen={showSubmitPopup}
                onClose={() => setShowSubmitPopup(false)}
                onConfirm={handleConfirmSubmit}
            />
            <WarningPopup
                isOpen={showWarningPopup}
                onClose={() => setShowWarningPopup(false)}
                message={warningMessage}
            />
        </section>
    );
};

export default ContraPersonAdd;
