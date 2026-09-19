import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import {
    Info,
    Browser,
    EnvelopeSimple,
    Gear,
    Image as ImageIcon,
    Drop,
    PaperPlaneRight,
    SlidersHorizontal,
    FloppyDisk,
    Eye,
    EyeSlash,
    CloudArrowUp
} from '@phosphor-icons/react';
import SavePopup from '../../components/Popup/SavePopup.jsx';
import Select from 'react-select';

const timezoneOptions = [
    { value: '(GMT+05:30) Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata' },
    { value: '(GMT+00:00) Europe/London', label: '(GMT+00:00) Europe/London' },
    { value: '(GMT-05:00) America/New_York', label: '(GMT-05:00) America/New_York' }
];

const CompanyProfile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [showSavePopup, setShowSavePopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [companyName, setCompanyName] = useState('Terrific Technologies');
    const [contactEmail, setContactEmail] = useState('terrific@gmail.com');
    const [phoneNumber, setPhoneNumber] = useState('9944680677');
    const [companyAddress, setCompanyAddress] = useState('62/1, Chitralaya Nagar, Nallur, Tamil Nadu, Tiruppur-641606');

    const [primaryColor, setPrimaryColor] = useState('#319760');
    const [secondaryColor, setSecondaryColor] = useState('#3498DB');

    const [senderName, setSenderName] = useState('Terrific Technologies');
    const [smtpEmail, setSmtpEmail] = useState('terrific@gmail.com');
    const [smtpPassword, setSmtpPassword] = useState('Tsst@7787');
    const [showPassword, setShowPassword] = useState(false);

    const [timezone, setTimezone] = useState('(GMT+05:30) Asia/Kolkata');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');

    const [logoPreview, setLogoPreview] = useState('/assets/images/logos.webp');
    const [faviconPreview, setFaviconPreview] = useState('/assets/images/fav-icon.png');
    const [faviconError, setFaviconError] = useState(false);

    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
            setLogoFile(file);
        }
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFaviconPreview(URL.createObjectURL(file));
            setFaviconError(false);
            setFaviconFile(file);
        }
    };

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('erp_token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/company`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                const result = await response.json();
                if (result && result.data) {
                    const d = result.data;
                    if (d.company_name) setCompanyName(d.company_name);
                    if (d.contact_email) setContactEmail(d.contact_email);
                    if (d.phone_number) setPhoneNumber(d.phone_number);
                    if (d.company_address) setCompanyAddress(d.company_address);
                    if (d.primary_color) {
                        setPrimaryColor(d.primary_color);
                        document.documentElement.style.setProperty('--primary-color', d.primary_color);
                        document.documentElement.style.setProperty('--primary-bg', `linear-gradient(135deg, ${d.primary_color}, ${d.primary_color}dd)`);
                    }
                    if (d.secondary_color) {
                        setSecondaryColor(d.secondary_color);
                        document.documentElement.style.setProperty('--secondary-color', d.secondary_color);
                        document.documentElement.style.setProperty('--secondary-bg', d.secondary_color + '15');
                    }
                    if (d.sender_name) setSenderName(d.sender_name);
                    if (d.smtp_email) setSmtpEmail(d.smtp_email);
                    if (d.smtp_password) setSmtpPassword(d.smtp_password);
                    if (d.timezone) setTimezone(d.timezone);
                    if (d.linkedin_url) setLinkedinUrl(d.linkedin_url);
                    if (d.twitter_url) setTwitterUrl(d.twitter_url);
                    if (d.facebook_url) setFacebookUrl(d.facebook_url);

                    const makeUrl = (path) => {
                            if (path.startsWith('http')) return path;
                            const base = import.meta.env.VITE_API_BASE_URL;
                            return `${base}/api/file?path=${encodeURIComponent(path)}`;
                        };

                    const lg = d.main_logo || d.company_logo || d.logo;
                    if (lg) {
                        setLogoPreview(makeUrl(lg));
                        setLogoError(false);
                    }

                    const fv = d.company_favicon || d.favicon;
                    if (fv) {
                        setFaviconPreview(makeUrl(fv));
                        setFaviconError(false);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch company profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanyData();
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        setShowSavePopup(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('erp_token');
            const formData = new FormData();

            formData.append('company_name', companyName);
            formData.append('contact_email', contactEmail);
            formData.append('phone_number', phoneNumber);
            formData.append('company_address', companyAddress);
            formData.append('primary_color', primaryColor);
            formData.append('secondary_color', secondaryColor);
            formData.append('sender_name', senderName);
            formData.append('smtp_email', smtpEmail);
            formData.append('smtp_password', smtpPassword);
            formData.append('timezone', timezone);
            formData.append('linkedin_url', linkedinUrl);
            formData.append('twitter_url', twitterUrl);
            formData.append('facebook_url', facebookUrl);
            if (logoFile) {
                formData.append('main_logo', logoFile);
                formData.append('company_logo', logoFile);
            }
            if (faviconFile) {
                formData.append('favicon', faviconFile);
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/company`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                // Dispatch event so Header can re-fetch updated logos/colors
                window.dispatchEvent(new Event('companyProfileUpdated'));

                // Re-fetch locally so the UI updates
                const fetchRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/company`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (fetchRes.ok) {
                    const fetchData = await fetchRes.json();
                    if (fetchData && fetchData.data) {
                        const d = fetchData.data;
                        const makeUrl = (path) => {
                            if (path.startsWith('http')) return path;
                            const base = import.meta.env.VITE_API_BASE_URL;
                            return `${base}/api/file?path=${encodeURIComponent(path)}`;
                        };
                        const lg = d.main_logo || d.company_logo || d.logo;
                        if (lg) {
                            setLogoPreview(makeUrl(lg));
                            setLogoError(false);
                        }
                        const fv = d.company_favicon || d.favicon;
                        if (fv) {
                            setFaviconPreview(makeUrl(fv));
                            setFaviconError(false);
                        }
                    }
                }
            }
            console.log("Save result:", result);
        } catch (error) {
            console.error("Failed to save company profile:", error);
        } finally {
            setIsSaving(false);
            setShowSavePopup(false);
        }
    };

    const blockHeaderStyle = {
        padding: '20px 24px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#fff',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
    };

    const blockIconContainerStyle = (bgColor, color) => ({
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
    });

    const blockTitleStyle = {
        fontSize: '15px',
        fontWeight: '700',
        color: '#0f172a',
        margin: 0,
        letterSpacing: '-0.3px'
    };

    const cardStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        border: '1px solid #f4f4f4',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column'
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader />
            </div>
        );
    }

    return (
        <section className="content">
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header with-border d-flex justify-content-between align-items-center">
                        <h3 className="card-title">Global Settings</h3>
                        <div>
                            <button type="submit" form="company-profile-form" className="btn-save me-2">
                                Save
                            </button>
                            <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
                                Back
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form id="company-profile-form" onSubmit={handleSave}>
                            {/* Tabs Navigation */}
                            <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', borderBottom: '1px solid #ddd', paddingBottom: '1px' }}>
                                <TabButton id="general" icon={<Info size={18} weight={activeTab === 'general' ? "fill" : "duotone"} />} label="General Details" active={activeTab === 'general'} onClick={setActiveTab} />
                                <TabButton id="branding" icon={<Browser size={18} weight={activeTab === 'branding' ? "fill" : "duotone"} />} label="Branding & Theme" active={activeTab === 'branding'} onClick={setActiveTab} />
                                <TabButton id="email" icon={<EnvelopeSimple size={18} weight={activeTab === 'email' ? "fill" : "duotone"} />} label="Email Settings" active={activeTab === 'email'} onClick={setActiveTab} />
                                <TabButton id="advanced" icon={<Gear size={18} weight={activeTab === 'advanced' ? "fill" : "duotone"} />} label="Advanced & Others" active={activeTab === 'advanced'} onClick={setActiveTab} />
                            </div>

                            {/* Tab Contents */}
                            <div>
                                {/* General Details Tab */}
                                {activeTab === 'general' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        {/* General Details Form */}
                                        <div style={cardStyle}>
                                            <div style={blockHeaderStyle}>
                                                <div style={blockIconContainerStyle('rgba(43, 157, 144, 0.1)', '#2b9d90')}>
                                                    <Info size={18} weight="duotone" />
                                                </div>
                                                <h5 style={blockTitleStyle}>General Details</h5>
                                            </div>
                                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                <div className="row g-4">
                                                    <div className="col-12 col-md-6">
                                                        <div className="form-group">
                                                            <label>Company Name</label>
                                                            <input type="text" className="form-control" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <div className="form-group">
                                                            <label>Contact Email</label>
                                                            <input type="email" className="form-control" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <div className="form-group">
                                                            <label>Phone Number</label>
                                                            <input type="tel" className="form-control" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} pattern="\d{10}" maxLength="10" title="Please enter exactly 10 digits" required />
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="form-group">
                                                            <label>Company Address</label>
                                                            <textarea
                                                                className="form-control"
                                                                value={companyAddress}
                                                                onChange={e => setCompanyAddress(e.target.value)}
                                                                style={{ minHeight: '150px', resize: 'vertical' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Preview */}
                                        <div style={cardStyle}>
                                            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                                                <h5 style={blockTitleStyle}>Quick Preview</h5>
                                            </div>
                                            <div style={{ padding: '24px' }}>
                                                <div style={{ backgroundColor: '#f8fafc', borderRadius: '4px', padding: '24px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                                                        Generated Invoice Header
                                                    </div>
                                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
                                                        {companyName || 'Your Company Name'}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '8px' }}>
                                                        {companyAddress || 'Your Company Address'}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                                                        {contactEmail || 'your@email.com'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Branding & Theme Tab */}
                                {activeTab === 'branding' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        {/* Logos & Icons */}
                                        <div style={cardStyle}>
                                            <div style={blockHeaderStyle}>
                                                <div style={blockIconContainerStyle('rgba(59, 130, 246, 0.1)', '#3b82f6')}>
                                                    <ImageIcon size={18} weight="duotone" />
                                                </div>
                                                <h5 style={blockTitleStyle}>Logos & Icons</h5>
                                            </div>
                                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                                <style>{`
                                                .upload-preview {
                                                    position: relative;
                                                    cursor: pointer;
                                                    border: 2px dashed #cbd5e1;
                                                    transition: all 0.2s;
                                                    overflow: hidden;
                                                    background-color: #f8fafc;
                                                }
                                                .upload-preview:hover {
                                                    border-color: #2b9d90;
                                                }
                                                .upload-overlay {
                                                    position: absolute;
                                                    inset: 0;
                                                    background: rgba(0,0,0,0.5);
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: center;
                                                    color: white;
                                                    opacity: 0;
                                                    transition: opacity 0.2s;
                                                }
                                                .upload-preview:hover .upload-overlay {
                                                    opacity: 1;
                                                }
                                                .btn-upload-impressive {
                                                    display: inline-flex;
                                                    align-items: center;
                                                    gap: 6px;
                                                    padding: 6px 16px;
                                                    font-size: 13px;
                                                    font-weight: 600;
                                                    color: #2b9d90;
                                                    background-color: rgba(43, 157, 144, 0.1);
                                                    border: 1px solid rgba(43, 157, 144, 0.2);
                                                    border-radius: 6px;
                                                    cursor: pointer;
                                                    transition: all 0.2s ease;
                                                }
                                                .btn-upload-impressive:hover {
                                                    background-color: #2b9d90;
                                                    color: #ffffff;
                                                    box-shadow: 0 4px 12px rgba(43, 157, 144, 0.25);
                                                    transform: translateY(-1px);
                                                }
                                                .btn-upload-impressive:active {
                                                    transform: translateY(0);
                                                    box-shadow: none;
                                                }
                                            `}</style>

                                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                    <label htmlFor="logo-upload" className="upload-preview" style={{ width: '126px', height: '126px', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                                                        <img src={logoPreview} alt="Main Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                        <div className="upload-overlay">
                                                            <CloudArrowUp size={24} weight="bold" />
                                                        </div>
                                                    </label>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>Main Application Logo</div>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Recommended size: 200x50px. Format: PNG, SVG with transparent background.</div>
                                                        <label htmlFor="logo-upload" className="btn-upload-impressive" style={{ margin: 0 }}>
                                                            <CloudArrowUp size={16} weight="bold" /> Upload New
                                                        </label>
                                                        <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                    <label htmlFor="favicon-upload" className="upload-preview" style={{ width: '126px', height: '126px', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                                                        {faviconError ? (
                                                            <div style={{ color: '#cbd5e1' }}><i className="bi bi-image" style={{ fontSize: '24px' }}></i></div>
                                                        ) : (
                                                            <img src={faviconPreview} alt="Favicon" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={() => setFaviconError(true)} />
                                                        )}
                                                        <div className="upload-overlay">
                                                            <CloudArrowUp size={24} weight="bold" />
                                                        </div>
                                                    </label>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>Favicon (Browser Tab Icon)</div>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Recommended size: 32x32px. Format: ICO or PNG.</div>
                                                        <label htmlFor="favicon-upload" className="btn-upload-impressive" style={{ margin: 0 }}>
                                                            <CloudArrowUp size={16} weight="bold" /> Upload New
                                                        </label>
                                                        <input type="file" id="favicon-upload" accept="image/*" onChange={handleFaviconChange} style={{ display: 'none' }} />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Theme Colors */}
                                        <div style={cardStyle}>
                                            <div style={blockHeaderStyle}>
                                                <div style={blockIconContainerStyle('rgba(249, 115, 22, 0.1)', '#f97316')}>
                                                    <Drop size={18} weight="duotone" />
                                                </div>
                                                <h5 style={blockTitleStyle}>Theme Colors</h5>
                                            </div>
                                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <div className="row g-4">
                                                    <div className="col-12 col-md-6">
                                                        <div className="form-group">
                                                            <label>Primary Color (Background)</label>
                                                            <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', width: '100%', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                                                                <label style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', position: 'relative' }}>
                                                                    <input
                                                                        type="color"
                                                                        value={primaryColor}
                                                                        onChange={e => {
                                                                            setPrimaryColor(e.target.value);
                                                                            document.documentElement.style.setProperty('--primary-color', e.target.value);
                                                                            document.documentElement.style.setProperty('--primary-bg', `linear-gradient(135deg, ${e.target.value}, ${e.target.value}dd)`);
                                                                        }}
                                                                        style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                                                                    />
                                                                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: primaryColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={primaryColor}
                                                                    onChange={e => {
                                                                        setPrimaryColor(e.target.value);
                                                                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                                                            document.documentElement.style.setProperty('--primary-color', e.target.value);
                                                                            document.documentElement.style.setProperty('--primary-bg', `linear-gradient(135deg, ${e.target.value}, ${e.target.value}dd)`);
                                                                        }
                                                                    }}
                                                                    style={{ border: 'none', outline: 'none', fontWeight: '700', color: '#334155', flex: 1, background: 'transparent' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <div className="form-group">
                                                            <label>Secondary Color (Menues)</label>
                                                            <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', width: '100%', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                                                                <label style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', position: 'relative' }}>
                                                                    <input
                                                                        type="color"
                                                                        value={secondaryColor}
                                                                        onChange={e => {
                                                                            setSecondaryColor(e.target.value);
                                                                            document.documentElement.style.setProperty('--secondary-color', e.target.value);
                                                                            document.documentElement.style.setProperty('--secondary-bg', e.target.value + '15');
                                                                        }}
                                                                        style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                                                                    />
                                                                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: secondaryColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={secondaryColor}
                                                                    onChange={e => {
                                                                        setSecondaryColor(e.target.value);
                                                                        document.documentElement.style.setProperty('--secondary-color', e.target.value);
                                                                        document.documentElement.style.setProperty('--secondary-bg', e.target.value + '15');
                                                                    }}
                                                                    style={{ border: 'none', outline: 'none', fontWeight: '700', color: '#334155', flex: 1, background: 'transparent' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label>Live Button Preview</label>
                                                    <div style={{ display: 'flex', gap: '12px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '4px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                                                        <button style={{ padding: '8px 16px', borderRadius: '4px', backgroundColor: primaryColor, color: '#fff', border: 'none', cursor: 'pointer' }}>Primary Action</button>
                                                        <button style={{ padding: '8px 16px', borderRadius: '4px', backgroundColor: `${secondaryColor}15`, color: secondaryColor, border: 'none', cursor: 'pointer' }}>Secondary Action</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Email Settings Tab */}
                                {activeTab === 'email' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div style={cardStyle}>
                                            <div style={{ ...blockHeaderStyle, justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={blockIconContainerStyle('rgba(168, 85, 247, 0.1)', '#a855f7')}>
                                                        <PaperPlaneRight size={18} weight="duotone" />
                                                    </div>
                                                    <h5 style={blockTitleStyle}>SMTP & Email Configuration</h5>
                                                </div>
                                                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                                                    CONNECTED
                                                </div>
                                            </div>
                                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                <div className="row g-4">
                                                    <div className="col-12 col-md-6">
                                                        <div className="form-group">
                                                            <label>Sender Name</label>
                                                            <input type="text" className="form-control" value={senderName} onChange={e => setSenderName(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <div className="form-group">
                                                            <label>Email Address</label>
                                                            <input type="email" className="form-control" value={smtpEmail} onChange={e => setSmtpEmail(e.target.value)} required />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <div className="form-group">
                                                            <label>Password</label>
                                                            <div className="position-relative">
                                                                <input
                                                                    type={showPassword ? "text" : "password"}
                                                                    className="form-control"
                                                                    value={smtpPassword}
                                                                    onChange={e => setSmtpPassword(e.target.value)}
                                                                    style={{ paddingRight: '40px' }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="btn btn-link p-0 text-muted"
                                                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', cursor: 'pointer', zIndex: 10 }}
                                                                >
                                                                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Advanced & Others Tab */}
                                {activeTab === 'advanced' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div style={cardStyle}>
                                            <div style={blockHeaderStyle}>
                                                <div style={blockIconContainerStyle('rgba(99, 102, 241, 0.1)', '#6366f1')}>
                                                    <SlidersHorizontal size={18} weight="duotone" />
                                                </div>
                                                <h5 style={blockTitleStyle}>Localization & Socials</h5>
                                            </div>
                                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                <div className="form-group">
                                                    <label>Default Timezone</label>
                                                    <Select
                                                        options={timezoneOptions}
                                                        value={timezoneOptions.find(t => t.value === timezone)}
                                                        onChange={selected => setTimezone(selected.value)}
                                                        className="react-select-container"
                                                        classNamePrefix="react-select"
                                                        styles={{
                                                            control: (base) => ({ ...base, minHeight: '42px', minWidth: '300px' }),
                                                            menu: (base) => ({ ...base, zIndex: 9999, minWidth: 'max-content' })
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label>Social Media Links</label>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <i className="bi bi-linkedin" style={{ fontSize: '18px' }}></i>
                                                            </div>
                                                            <input type="text" className="form-control" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="LinkedIn URL" />
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <i className="bi bi-twitter" style={{ fontSize: '18px' }}></i>
                                                            </div>
                                                            <input type="text" className="form-control" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} placeholder="Twitter URL" />
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#3b5998', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <i className="bi bi-facebook" style={{ fontSize: '18px' }}></i>
                                                            </div>
                                                            <input type="text" className="form-control" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} placeholder="Facebook URL" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <SavePopup
                isOpen={showSavePopup}
                onClose={() => setShowSavePopup(false)}
                onConfirm={handleConfirmSubmit}
            />
        </section>
    );
};

const TabButton = ({ id, icon, label, active, onClick }) => {
    return (
        <button
            type="button"
            onClick={() => onClick(id)}
            style={{
                background: 'none',
                border: 'none',
                padding: '0 0 12px 0',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: active ? '700' : '600',
                color: active ? '#2b9d90' : '#64748b',
                cursor: 'pointer',
                borderBottom: active ? '3px solid #2b9d90' : '3px solid transparent',
                transition: 'all 0.2s',
                position: 'relative',
                top: '2px'
            }}
        >
            <span style={{ display: 'flex', alignItems: 'center', color: active ? '#2b9d90' : '#94a3b8' }}>
                {icon}
            </span>
            {label}
        </button>
    );
};

export default CompanyProfile;
