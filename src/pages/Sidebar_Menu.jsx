import { Link, useLocation } from "react-router-dom";
import "../styles/Sidebar_Menu.css";
import { House, Book, ListVideo, FileUser, Lightbulb, UserPen, UploadCloud } from "lucide-react";

const navItems = [
    { to: "/home", icon: <House />, label: "Dashboard" },
    { to: "/predictbill", icon: <Book />, label: "Predict Bills" },
    { to: "/billhistory", icon: <ListVideo />, label: "Bill History" },
    { to: "/consumptionhistory", icon: <FileUser />, label: "Consumption History" },
    { to: "/tips", icon: <Lightbulb />, label: "Tips & Suggestions" },
    { to: "/uploadbill", icon: <UploadCloud />, label: "Upload Bill" },
    { to: "/profile", icon: <UserPen />, label: "Profile" },
];

export default function Sidebar_Menu({ collapsed, setCollapsed }) {
    const location = useLocation();

    return (
        <aside className={`Sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <img className={`logo-pic ${collapsed ? "logo-hidden" : ""}`} src="./logo.png" />
            </div>
            <ul>
                {navItems.map(({ to, icon, label }) => (
                    <li key={to}>
                        <Link
                            to={to}
                            className={`sidebar-link ${location.pathname === to ? "active" : ""}`}>
                            <span className="logo-button">{icon}</span>
                            <span>{label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
