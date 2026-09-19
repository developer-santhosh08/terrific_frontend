import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoader } from '../../context/LoaderContext';
import { apiFetch } from '../../lib/api.js';
import { 
    HouseIcon, 
    UserIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    MapPinIcon, 
    BriefcaseIcon, 
    BuildingsIcon, 
    CalendarIcon, 
    CakeIcon, 
    CheckCircleIcon,
    UploadSimpleIcon,
    LockKeyIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
    WarningIcon
} from '@phosphor-icons/react';

const Profile = () => {
    const { setLoading } = useLoader();
    const [userProfile, setUserProfile] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const response = await apiFetch('/roles/users/me');
                if (response?.json) {
                    setUserProfile(response.json.data || response.json);
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [setLoading]);

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            setUpdateMessage({ type: 'error', text: 'All fields are required.' });
            return;
        }
        if (newPassword.length < 8) {
            setUpdateMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setUpdateMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setIsUpdating(true);
        setUpdateMessage({ type: '', text: '' });

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
            const token = sessionStorage.getItem('erp_token');
            const res = await fetch(`${API_BASE}/api/roles/users/profile/update-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword
                })
            });

            let json;
            try {
                json = await res.json();
            } catch (err) {
                setUpdateMessage({ type: 'error', text: 'Server error. Please try again later.' });
                return;
            }

            if (res.ok) {
                setUpdateMessage({ type: 'success', text: json.message || 'Password updated successfully.' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setUpdateMessage({ type: 'error', text: json.message || 'Failed to update password.' });
            }
        } catch (error) {
            console.error('Password update error:', error);
            setUpdateMessage({ type: 'error', text: 'An error occurred while updating password.' });
        } finally {
            setIsUpdating(false);
        }
    };

    // Profile photo upload state
    const [profileImage, setProfileImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [photoUpdateMessage, setPhotoUpdateMessage] = useState({ type: '', text: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        if (file && (file.type.startsWith('image/'))) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
            setSelectedFile(file);
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedFile) return;

        setIsSaving(true);
        setPhotoUpdateMessage({ type: '', text: '' });

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
            const token = sessionStorage.getItem('erp_token');
            
            const formData = new FormData();
            formData.append('photo', selectedFile);

            const res = await fetch(`${API_BASE}/api/roles/users/profile/update-photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                console.log('Photo updated successfully');
                window.dispatchEvent(new Event('profileUpdated'));
                setSelectedFile(null); // Reset after successful upload
                setPhotoUpdateMessage({ type: 'success', text: 'Profile photo updated successfully!' });
                setTimeout(() => setPhotoUpdateMessage({ type: '', text: '' }), 5000);
            } else {
                console.error('Failed to update photo');
                setPhotoUpdateMessage({ type: 'error', text: 'Failed to update profile photo.' });
            }
        } catch (error) {
            console.error('Photo upload error:', error);
            setPhotoUpdateMessage({ type: 'error', text: 'An error occurred during upload.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e) => {
        handleFile(e.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    // Wait for data to load
    if (!userProfile) return null;

    // Shared input style
    const inputStyle = {
        width: '100%',
        padding: '14px 44px 14px 16px',
        borderRadius: '12px',
        border: '1px solid rgba(34, 193, 195, 0.15)',
        backgroundColor: 'rgba(34, 193, 195, 0.02)',
        fontSize: '14px',
        color: '#1e293b',
        outline: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        
    };

    // Info Tile Component for neat grid display
    const InfoTile = ({ icon, label, value }) => (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'default'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(34, 193, 195, 0.12)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px -4px rgba(0,0,0,0.02)';
        }}>
            <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(34, 193, 195, 0.08)',
                color: 'var(--primary-color, #22C1C3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {label}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
                    {value}
                </div>
            </div>
        </div>
    );

    return (
        <div className="tw-p-4 md:tw-p-8 tw-relative tw-overflow-hidden" style={{ 
            backgroundColor: '#f4f7f6', 
            minHeight: '100vh', 
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Dynamic Background Glows */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(34,193,195,0.08) 0%, rgba(34,193,195,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(34,193,195,0.06) 0%, rgba(34,193,195,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Page Header */}
            <div className="tw-mb-6 md:tw-mb-8 tw-relative tw-z-10 tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-end tw-gap-4">
                <div>
                    <h4 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                        User Profile
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '6px 14px', borderRadius: '20px',  }}>
                            <HouseIcon size={16} style={{ marginRight: '8px', color: 'var(--primary-color, #22C1C3)' }} weight="duotone" />
                            <Link to="/" style={{ color: 'var(--primary-color, #22C1C3)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '600' }}>Dashboard</Link>
                            <span style={{ margin: '0 10px', color: '#cbd5e1' }}>/</span>
                            <span style={{ color: '#64748b' }}>Profile</span>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    style={{ 
                        padding: '12px 28px', 
                        backgroundColor: '#475569', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontSize: '15px', 
                        fontWeight: '700', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        transition: 'all 0.2s',
                        
                    }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#334155'; e.target.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = '#475569'; e.target.style.transform = 'translateY(0)'; }}
                    onMouseDown={(e) => { e.target.style.transform = 'translateY(1px)'; }}
                    onMouseUp={(e) => { e.target.style.transform = 'translateY(-2px)'; }}
                >
                    <i className="bi bi-arrow-left" style={{ fontSize: '18px' }}></i>
                    Back
                </button>
            </div>

            <div className="tw-flex tw-flex-wrap tw-gap-6 md:tw-gap-8 tw-relative tw-z-10">
                
                {/* Left Column */}
                <div className="tw-flex-1 tw-basis-full lg:tw-basis-[360px] lg:tw-max-w-[440px] tw-flex tw-flex-col tw-gap-6 md:tw-gap-8">
                    
                    {/* User Info Glass Card */}
                    <div style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                        backdropFilter: 'blur(16px)',
                        borderRadius: '24px', 
                        border: '1px solid rgba(255,255,255,0.5)', 
                         
                        overflow: 'hidden' 
                    }}>
                        {/* Banner Image Area */}
                        <div style={{ 
                            height: '180px', 
                            background: 'var(--primary-bg, linear-gradient(135deg, var(--primary-color, #22C1C3), var(--primary-color, #1aa8aa)))', 
                            position: 'relative',
                            padding: '30px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start'
                        }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', borderRadius: '20px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.3)' }}>
                                <ShieldCheckIcon size={16} color="#fff" style={{ marginRight: '6px', display: 'block' }} />
                                <span style={{ color: '#fff', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', lineHeight: 1, paddingTop: '2px' }}>{userProfile.role_name || 'USER'}</span>
                            </div>
                            
                            {/* Floating Profile Picture */}
                            <div 
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    bottom: '-55px',
                                    transform: 'translateX(-50%)',
                                    width: '110px',
                                    height: '110px',
                                    borderRadius: '50%',
                                    border: '6px solid #f4f7f6',
                                    backgroundColor: '#fff',
                                    
                                    zIndex: 2,
                                    cursor: 'pointer'
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                                    <img src={profileImage || userProfile.profile_photo_url || "/assets/images/avatar/3.jpg"} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isDragging ? 0.5 : 1 }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '4px', textAlign: 'center' }}>
                                        <UploadSimpleIcon size={16} color="#fff" />
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                        </div>

                        {/* User Details */}
                        <div style={{ padding: '70px 30px 30px', textAlign: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <h5 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                                    {userProfile.name || 'User'}
                                </h5>
                                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '16px' }}>
                                    {userProfile.email}
                                </div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: userProfile.status === 1 ? 'rgba(34, 193, 195, 0.1)' : 'rgba(220, 53, 69, 0.1)', color: userProfile.status === 1 ? 'var(--primary-color, #22C1C3)' : '#dc3545', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    <CheckCircleIcon size={16} weight="bold" style={{ marginRight: '6px' }} />
                                    {userProfile.status === 1 ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats/Badges */}
                        <div style={{ padding: '24px 30px', backgroundColor: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginTop: '4px' }}>{userProfile.department || '-'}</div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: 'rgba(226, 232, 240, 0.8)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginTop: '4px' }}>{userProfile.designation || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings Card */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid rgba(226, 232, 240, 0.8)',  }}>
                        <div style={{ padding: '24px 30px', borderBottom: '1px solid rgba(226, 232, 240, 0.6)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(34, 193, 195, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LockKeyIcon size={18} color="var(--primary-color, #22C1C3)" weight="duotone" />
                            </div>
                            <h5 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Security</h5>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', paddingLeft: '4px' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showNewPassword ? "text" : "password"} 
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color, #22C1C3)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(34, 193, 195, 0.15)'; }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}
                                    >
                                        {showNewPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                                    </button>
                                </div>
                                {newPassword.length > 0 && newPassword.length < 8 && (
                                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <WarningIcon size={14} weight="bold" />
                                        Password must be at least 8 characters
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', paddingLeft: '4px' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={inputStyle}
                                        onFocus={(e) => { e.target.style.borderColor = 'var(--primary-color, #22C1C3)'; }}
                                        onBlur={(e) => { e.target.style.borderColor = 'rgba(34, 193, 195, 0.15)'; }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}
                                    >
                                        {showConfirmPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                                    </button>
                                </div>
                            </div>

                            {updateMessage.text && (
                                <div style={{ 
                                    padding: '12px 16px', 
                                    marginBottom: '20px', 
                                    borderRadius: '10px', 
                                    fontSize: '13px', 
                                    fontWeight: '600',
                                    backgroundColor: updateMessage.type === 'success' ? 'rgba(32, 201, 151, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                    color: updateMessage.type === 'success' ? '#20c997' : '#ef4444',
                                    border: `1px solid ${updateMessage.type === 'success' ? 'rgba(32, 201, 151, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}>
                                    {updateMessage.text}
                                </div>
                            )}

                            <button 
                                onClick={handleUpdatePassword}
                                disabled={isUpdating}
                                style={{ 
                                    width: '100%', 
                                    padding: '16px', 
                                    backgroundColor: isUpdating ? '#94a3b8' : 'var(--primary-color, #22C1C3)', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    fontSize: '15px', 
                                    fontWeight: '700', 
                                    cursor: isUpdating ? 'not-allowed' : 'pointer', 
                                    transition: 'all 0.2s', 
                                    
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => { if (!isUpdating) { e.target.style.backgroundColor = 'var(--primary-color, #1aa8aa)'; e.target.style.transform = 'translateY(-2px)'; } }}
                                onMouseLeave={(e) => { if (!isUpdating) { e.target.style.backgroundColor = 'var(--primary-color, #22C1C3)'; e.target.style.transform = 'translateY(0)'; } }}
                                onMouseDown={(e) => { if (!isUpdating) { e.target.style.transform = 'translateY(1px)'; } }}
                                onMouseUp={(e) => { if (!isUpdating) { e.target.style.transform = 'translateY(-2px)'; } }}
                            >
                                {isUpdating ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="tw-flex-1 tw-basis-full lg:tw-basis-[500px] tw-flex tw-flex-col tw-gap-6 md:tw-gap-8">
                    
                    {/* Personal Information Overview Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <h5 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 -8px 0', letterSpacing: '-0.5px', paddingLeft: '4px' }}>Overview</h5>
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
                            <InfoTile icon={<UserIcon size={24} weight="duotone" />} label="Username" value={userProfile.name || '-'} />
                            <InfoTile icon={<EnvelopeIcon size={24} weight="duotone" />} label="Email Address" value={userProfile.email || '-'} />
                            <InfoTile icon={<PhoneIcon size={24} weight="duotone" />} label="Mobile Number" value={userProfile.mobile_number || '-'} />
                            <InfoTile icon={<MapPinIcon size={24} weight="duotone" />} label="Address" value={userProfile.address || '-'} />
                            <InfoTile icon={<BriefcaseIcon size={24} weight="duotone" />} label="Designation" value={userProfile.designation || '-'} />
                            <InfoTile icon={<BuildingsIcon size={24} weight="duotone" />} label="Department" value={userProfile.department || '-'} />
                            <InfoTile icon={<CalendarIcon size={24} weight="duotone" />} label="Join Date" value={userProfile.join_date || '-'} />
                        </div>
                    </div>

                    {/* Profile Picture Upload Area */}
                    <div style={{ marginTop: '16px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid rgba(226, 232, 240, 0.8)',  }}>
                        <div style={{ padding: '24px 30px', borderBottom: '1px solid rgba(226, 232, 240, 0.6)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(34, 193, 195, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserIcon size={18} color="var(--primary-color, #22C1C3)" weight="duotone" />
                            </div>
                            <h5 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Profile Photo</h5>
                        </div>
                        <div style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            
                            {/* Upload Dropzone */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/png, image/jpeg, image/gif" 
                                style={{ display: 'none' }} 
                            />
                            <div style={{
                                width: '100%',
                                maxWidth: '500px',
                                border: isDragging ? '2px dashed rgba(34, 193, 195, 0.8)' : '2px dashed rgba(34, 193, 195, 0.3)',
                                borderRadius: '20px',
                                padding: '40px 20px',
                                backgroundColor: isDragging ? 'rgba(34, 193, 195, 0.08)' : 'rgba(34, 193, 195, 0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                transform: isDragging ? 'scale(1.02)' : 'scale(1)'
                            }}
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onMouseEnter={(e) => { if(!isDragging) { e.currentTarget.style.backgroundColor = 'rgba(34, 193, 195, 0.05)'; e.currentTarget.style.borderColor = 'rgba(34, 193, 195, 0.6)'; } }}
                            onMouseLeave={(e) => { if(!isDragging) { e.currentTarget.style.backgroundColor = 'rgba(34, 193, 195, 0.02)'; e.currentTarget.style.borderColor = 'rgba(34, 193, 195, 0.3)'; } }}
                            >
                                {profileImage ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '110px', height: '110px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #fff',  marginBottom: '20px' }}>
                                            <img src={profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary-color, #22C1C3)', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', padding: '8px 20px', borderRadius: '30px',  }}>
                                            <UploadSimpleIcon size={18} weight="bold" />
                                            Change Photo
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '16px 0 0 0', textAlign: 'center' }}>or drag and drop a new image here</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#fff',  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--primary-color, #22C1C3)' }}>
                                            <UploadSimpleIcon size={32} weight="duotone" />
                                        </div>
                                        <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>Click to upload</h4>
                                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', textAlign: 'center' }}>or drag and drop your image here</p>
                                        
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', backgroundColor: '#fff', padding: '6px 16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                            JPG, PNG, GIF up to 2MB
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {photoUpdateMessage.text && (
                        <div style={{ 
                            padding: '12px 16px', 
                            marginTop: '16px', 
                            borderRadius: '10px', 
                            fontSize: '13px', 
                            fontWeight: '600',
                            backgroundColor: photoUpdateMessage.type === 'success' ? 'rgba(32, 201, 151, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: photoUpdateMessage.type === 'success' ? '#20c997' : '#ef4444',
                            border: `1px solid ${photoUpdateMessage.type === 'success' ? 'rgba(32, 201, 151, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            {photoUpdateMessage.text}
                        </div>
                    )}

                    {/* Save Button Container */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button 
                            onClick={handleSaveChanges}
                            disabled={isSaving || !selectedFile}
                            style={{ 
                            padding: '14px 32px', 
                            backgroundColor: (isSaving || !selectedFile) ? '#94a3b8' : 'var(--primary-color, #22C1C3)', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontSize: '15px', 
                            fontWeight: '700', 
                            cursor: (isSaving || !selectedFile) ? 'not-allowed' : 'pointer', 
                            transition: 'all 0.2s', 
                            
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                            onMouseEnter={(e) => { if(!isSaving && selectedFile) { e.target.style.backgroundColor = 'var(--primary-color, #1aa8aa)'; e.target.style.transform = 'translateY(-2px)'; } }}
                            onMouseLeave={(e) => { if(!isSaving && selectedFile) { e.target.style.backgroundColor = 'var(--primary-color, #22C1C3)'; e.target.style.transform = 'translateY(0)'; } }}
                            onMouseDown={(e) => { if(!isSaving && selectedFile) { e.target.style.transform = 'translateY(1px)'; } }}
                            onMouseUp={(e) => { if(!isSaving && selectedFile) { e.target.style.transform = 'translateY(-2px)'; } }}
                        >
                            <i className="bi bi-floppy" style={{ fontSize: '18px' }}></i>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
