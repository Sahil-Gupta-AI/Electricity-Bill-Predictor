import "../styles/home.css";
import "../styles/profile.css";
import { useState } from "react";
import { Menu, ChevronDown, User, Mail, Phone, MapPin, Zap, Hash, Shield, Edit2, Save } from "lucide-react";
import Sidebar_Menu from "./Sidebar_Menu";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [form, setForm] = useState({
        phone: "+91 98765 43210",
        address: "Mumbai, Maharashtra",
        provider: "MSEDCL",
        meterNumber: "MH-2045-87632",
        plan: "Residential LT-1",
        connectionType: "Single Phase",
    });

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSave() {
        setEditMode(false);
    }

    function handleLogout() {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("fallbackHistory");
        navigate("/login");
    }

    return (
        <div className="layout">
            <Sidebar_Menu collapsed={collapsed} setCollapsed={setCollapsed} />
            {!collapsed && (
                <div className="mobile-sidebar-backdrop" onClick={() => setCollapsed(true)} />
            )}
            <div className="main-content">
                <header className="top-navbar">
                    <div className="navbar">
                        <div className="menu" onClick={() => setCollapsed(!collapsed)}>
                            <Menu />
                        </div>
                        <div className="profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                            <div className="avatar">{user?.initials}</div>
                            {user?.name}
                            <ChevronDown />
                            {showProfileMenu && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-item logout" onClick={handleLogout}>Logout</div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="content">
                    <h2>Profile</h2>

                    <div className="pf-grid">
                        <div className="pf-left">
                            <div className="pf-avatar-card">
                                <div className="pf-big-avatar">{user?.initials}</div>
                                <h3 className="pf-name">{user?.name}</h3>
                                <p className="pf-email">{user?.email}</p>
                                <span className="pf-role-badge">Residential User</span>
                                <div className="pf-stats-row">
                                    <div className="pf-stat">
                                        <p className="pf-stat-val">12</p>
                                        <p className="pf-stat-lbl">Predictions</p>
                                    </div>
                                    <div className="pf-stat-divider" />
                                    <div className="pf-stat">
                                        <p className="pf-stat-val">2026</p>
                                        <p className="pf-stat-lbl">Member Since</p>
                                    </div>
                                    <div className="pf-stat-divider" />
                                    <div className="pf-stat">
                                        <p className="pf-stat-val">₹4.2K</p>
                                        <p className="pf-stat-lbl">Avg Bill</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pf-right">
                            <div className="pf-section-card">
                                <div className="pf-section-header">
                                    <div className="pf-section-title">
                                        <User size={18} color="#6D4AFF" />
                                        <h4>Personal Information</h4>
                                    </div>
                                    <button
                                        className={`pf-edit-btn ${editMode ? "save" : ""}`}
                                        onClick={() => editMode ? handleSave() : setEditMode(true)}>
                                        {editMode ? <><Save size={15} /> Save</> : <><Edit2 size={15} /> Edit</>}
                                    </button>
                                </div>

                                <div className="pf-fields">
                                    <div className="pf-field">
                                        <label><User size={14} /> Full Name</label>
                                        <input value={user?.name || ""} disabled className="pf-input disabled" />
                                    </div>
                                    <div className="pf-field">
                                        <label><Mail size={14} /> Email Address</label>
                                        <input value={user?.email || ""} disabled className="pf-input disabled" />
                                    </div>
                                    <div className="pf-field">
                                        <label><Phone size={14} /> Phone Number</label>
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className={`pf-input ${!editMode ? "disabled" : ""}`} />
                                    </div>
                                    <div className="pf-field">
                                        <label><MapPin size={14} /> Address</label>
                                        <input
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className={`pf-input ${!editMode ? "disabled" : ""}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="pf-section-card">
                                <div className="pf-section-header">
                                    <div className="pf-section-title">
                                        <Zap size={18} color="#6D4AFF" />
                                        <h4>Electricity Details</h4>
                                    </div>
                                    <div className="pf-verified-badge">
                                        <Shield size={13} />
                                        Verified
                                    </div>
                                </div>

                                <div className="pf-fields">
                                    <div className="pf-field">
                                        <label><Zap size={14} /> Provider</label>
                                        <input
                                            name="provider"
                                            value={form.provider}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className={`pf-input ${!editMode ? "disabled" : ""}`} />
                                    </div>
                                    <div className="pf-field">
                                        <label><Hash size={14} /> Meter Number</label>
                                        <input
                                            name="meterNumber"
                                            value={form.meterNumber}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className={`pf-input ${!editMode ? "disabled" : ""}`} />
                                    </div>
                                    <div className="pf-field">
                                        <label><Shield size={14} /> Tariff Plan</label>
                                        <input
                                            name="plan"
                                            value={form.plan}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className={`pf-input ${!editMode ? "disabled" : ""}`} />
                                    </div>
                                    <div className="pf-field">
                                        <label><Zap size={14} /> Connection Type</label>
                                        <input
                                            name="connectionType"
                                            value={form.connectionType}
                                            onChange={handleChange}
                                            disabled={!editMode}
                                            className={`pf-input ${!editMode ? "disabled" : ""}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
