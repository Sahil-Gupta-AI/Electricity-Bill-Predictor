import "../styles/home.css";
import "../styles/tips.css";
import { useState } from "react";
import { Menu, ChevronDown, Snowflake, Lightbulb, PlugZap, Sun, Droplets, Wind, Thermometer, MonitorSmartphone } from "lucide-react";
import Sidebar_Menu from "./Sidebar_Menu";
import { useNavigate } from "react-router-dom";

const allTips = [
    {
        id: 1,
        category: "Cooling",
        icon: <Snowflake size={28} />,
        color: "#3b82f6",
        bg: "#EFF6FF",
        title: "Set AC to 24°C",
        desc: "Every degree below 24°C increases energy consumption by 6%. Setting your AC to 24°C is the sweet spot for comfort and savings.",
        saving: "₹300/month",
        difficulty: "Easy",
    },
    {
        id: 2,
        category: "Lighting",
        icon: <Lightbulb size={28} />,
        color: "#f59e0b",
        bg: "#FFFBEB",
        title: "Switch to LED Bulbs",
        desc: "LED bulbs use up to 80% less energy than incandescent bulbs and last 25x longer. Replace all bulbs in high-use rooms first.",
        saving: "₹150/month",
        difficulty: "Easy",
    },
    {
        id: 3,
        category: "Appliances",
        icon: <PlugZap size={28} />,
        color: "#8b5cf6",
        bg: "#F5F3FF",
        title: "Unplug Idle Devices",
        desc: "Devices in standby mode still consume power — called 'phantom load'. Unplug chargers, TVs, and microwaves when not in use.",
        saving: "₹200/month",
        difficulty: "Easy",
    },
    {
        id: 4,
        category: "Solar",
        icon: <Sun size={28} />,
        color: "#f59e0b",
        bg: "#FEF9C3",
        title: "Install Solar Panels",
        desc: "Rooftop solar can reduce your bill by 70–90%. With government subsidies, the payback period is 3–5 years in India.",
        saving: "₹3000/month",
        difficulty: "Hard",
    },
    {
        id: 5,
        category: "Appliances",
        icon: <Droplets size={28} />,
        color: "#06b6d4",
        bg: "#ECFEFF",
        title: "Use Full Loads in Washer",
        desc: "Washing machines consume the same energy for a half or full load. Always wait for a full load to maximize efficiency.",
        saving: "₹80/month",
        difficulty: "Easy",
    },
    {
        id: 6,
        category: "Cooling",
        icon: <Wind size={28} />,
        color: "#2ebc7f",
        bg: "#ECFDF5",
        title: "Use Ceiling Fans with AC",
        desc: "Running ceiling fans with your AC allows you to raise the thermostat by 2–4°C without reducing comfort, saving significant energy.",
        saving: "₹180/month",
        difficulty: "Easy",
    },
    {
        id: 7,
        category: "Appliances",
        icon: <Thermometer size={28} />,
        color: "#ef4444",
        bg: "#FEF2F2",
        title: "Set Geyser to 55°C",
        desc: "Water heaters set above 60°C waste energy. 55°C is hot enough for hygiene and comfort while cutting heating costs.",
        saving: "₹120/month",
        difficulty: "Easy",
    },
    {
        id: 8,
        category: "Lighting",
        icon: <MonitorSmartphone size={28} />,
        color: "#6D4AFF",
        bg: "#F5F3FF",
        title: "Enable Auto-Brightness",
        desc: "Enable auto-brightness on all screens and set monitors/TVs to medium brightness. Screens at full brightness use 40% more power.",
        saving: "₹50/month",
        difficulty: "Easy",
    },
];

const categories = ["All", "Cooling", "Lighting", "Appliances", "Solar"];

const difficultyColor = { Easy: { bg: "#DCFCE7", color: "#16A34A" }, Hard: { bg: "#FEE2E2", color: "#DC2626" } };

export default function Tips() {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const filtered = activeTab === "All" ? allTips : allTips.filter(t => t.category === activeTab);
    const totalSaving = allTips.reduce((s, t) => s + parseInt(t.saving.replace(/[₹/month,]/g, "")), 0);

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
                    <h2>Tips & Suggestions</h2>

                    <div className="tips-hero">
                        <div className="tips-hero-text">
                            <h3>You could save up to</h3>
                            <p className="tips-hero-amount">₹{totalSaving.toLocaleString()}<span>/month</span></p>
                            <p className="tips-hero-sub">by following all {allTips.length} tips below</p>
                        </div>
                        <div className="tips-hero-icon">
                            <Lightbulb size={64} color="#6D4AFF" />
                        </div>
                    </div>

                    <div className="tips-tabs">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`tips-tab ${activeTab === cat ? "active" : ""}`}
                                onClick={() => setActiveTab(cat)}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="tips-grid">
                        {filtered.map(tip => (
                            <div key={tip.id} className="tip-card">
                                <div className="tip-card-header">
                                    <div className="tip-card-icon" style={{ background: tip.bg, color: tip.color }}>
                                        {tip.icon}
                                    </div>
                                    <div className="tip-card-meta">
                                        <span className="tip-category">{tip.category}</span>
                                        <span
                                            className="tip-difficulty"
                                            style={{ background: difficultyColor[tip.difficulty].bg, color: difficultyColor[tip.difficulty].color }}>
                                            {tip.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="tip-card-title">{tip.title}</h4>
                                <p className="tip-card-desc">{tip.desc}</p>
                                <div className="tip-card-saving">
                                    <span>Estimated saving:</span>
                                    <strong style={{ color: "#16A34A" }}>{tip.saving}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
