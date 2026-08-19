import "../styles/home.css";
import "../styles/uploadbill.css";
import { useState, useRef, useMemo } from "react";
import {
    Menu, ChevronDown, Upload, Camera, Image, Clipboard,
    CheckCircle, FileText, AlertCircle, Download, RefreshCw,
    Globe, Phone, User, CreditCard, Plug, Calendar, BadgeCheck,
    Banknote, Wallet, Zap, Loader2
} from "lucide-react";
import Sidebar_Menu from "./Sidebar_Menu";
import { useNavigate } from "react-router-dom";
import tataPowerLogo from "../assets/tata-power-logo.png";
import msedclLogo from "../assets/MSEDCL-logo.png";
import adaniLogo from "../assets/Adani-logo.png";
import torrentLogo from "../assets/torrent-power-logo.png";

const COMPANY_LOGOS = {
    "tata": tataPowerLogo,
    "msedcl": msedclLogo,
    "adani": adaniLogo,
    "torrent": torrentLogo,
};

function getCompanyLogo(name) {
    if (!name || name === "—") return null;
    const lower = name.toLowerCase();
    for (const key in COMPANY_LOGOS) {
        if (lower.includes(key)) return COMPANY_LOGOS[key];
    }
    return null;
}

export default function UploadBill() {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState("upload");
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [extracted, setExtracted] = useState(null);
    const [error, setError] = useState(null);
    const fileRef = useRef();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    function handleLogout() {
        localStorage.removeItem("user");
        navigate("/login");
    }

    async function processFile(f) {
        if (!f) return;
        const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(f.type)) {
            setError("Unsupported file type. Please upload PDF, JPG, or PNG.");
            return;
        }
        setFile(f);
        setProcessing(true);
        setExtracted(null);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", f);

            const token = localStorage.getItem("token");
            const headers = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch("/api/extract", {
                method: "POST",
                body: formData,
                headers: headers,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || data.error || data.message || "Extraction failed");
            }

            setExtracted(data);
            setProcessing(false);
        } catch (err) {
            console.error("OCR error:", err);
            let msg = err.message || "Could not extract bill details. Try a clearer image.";
            if (msg.toLowerCase().includes("token") || msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("auth")) {
                msg = "Session expired. Please log out and log back in to refresh your session.";
            }
            setError(msg);
            setProcessing(false);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        processFile(e.dataTransfer.files[0]);
    }

    function handleFileInput(e) {
        processFile(e.target.files[0]);
    }

    function handleReExtract() {
        setExtracted(null);
        setFile(null);
        setProcessing(false);
        setError(null);
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
                    <h2>Upload Your Bill &amp; View Details</h2>
                    <p className="ub-subtitle">Upload your electricity bill PDF or image to extract and view important details.</p>

                    <div className="ub-tabs">
                        <button className={`ub-tab ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>
                            Upload &amp; Extract
                        </button>
                        <button className={`ub-tab ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>
                            Extracted Details
                        </button>
                    </div>

                    {activeTab === "upload" && (
                        <div className="ub-body">
                            <div className="ub-left">
                                <div
                                    className={`ub-dropzone ${dragOver ? "dragover" : ""} ${processing ? "processing" : ""} ${extracted ? "done" : ""} ${error ? "err" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => !processing && !extracted && fileRef.current.click()}>
                                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={handleFileInput} />

                                    {!file && !processing && !error && (
                                        <>
                                            <div className="ub-drop-icon"><Upload size={40} color="#6D4AFF" /></div>
                                            <p className="ub-drop-title">Drag &amp; drop your bill here</p>
                                            <p className="ub-drop-sub">Supports PDF, JPG, PNG (Max 10MB)</p>
                                            <p className="ub-drop-or">or</p>
                                            <button className="ub-choose-btn" onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>
                                                Choose File
                                            </button>
                                            <p className="ub-formats">Supports PDF, JPG, PNG</p>
                                        </>
                                    )}

                                    {processing && (
                                        <div className="ub-processing">
                                            <Loader2 size={44} color="#6D4AFF" className="ub-spin-icon" />
                                            <p>Reading bill with OCR...</p>
                                            <p className="ub-file-name">{file?.name}</p>
                                        </div>
                                    )}

                                    {extracted && !processing && (
                                        <div className="ub-success">
                                            <CheckCircle size={44} color="#16A34A" />
                                            <p className="ub-success-title">Extraction Successful!</p>
                                            <p className="ub-file-name">{file?.name}</p>
                                        </div>
                                    )}

                                    {error && !processing && (
                                        <div className="ub-error-state">
                                            <AlertCircle size={44} color="#ef4444" />
                                            <p className="ub-error-title">Extraction Failed</p>
                                            <p className="ub-file-name">{error}</p>
                                            <button className="ub-choose-btn" style={{ marginTop: "12px" }} onClick={(e) => { e.stopPropagation(); handleReExtract(); fileRef.current.click(); }}>
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="ub-other-ways">
                                    <p className="ub-other-title">Other ways to upload</p>
                                    <div className="ub-other-list">
                                        <div className="ub-other-item" onClick={() => fileRef.current.click()}>
                                            <div className="ub-other-icon"><Camera size={20} color="#6D4AFF" /></div>
                                            <div>
                                                <p className="ub-other-name">Take a Photo</p>
                                                <p className="ub-other-desc">Use camera to capture bill</p>
                                            </div>
                                        </div>
                                        <div className="ub-other-item" onClick={() => fileRef.current.click()}>
                                            <div className="ub-other-icon"><Image size={20} color="#6D4AFF" /></div>
                                            <div>
                                                <p className="ub-other-name">Upload from Gallery</p>
                                                <p className="ub-other-desc">Choose from your device</p>
                                            </div>
                                        </div>
                                        <div className="ub-other-item">
                                            <div className="ub-other-icon"><Clipboard size={20} color="#6D4AFF" /></div>
                                            <div>
                                                <p className="ub-other-name">Paste from Clipboard</p>
                                                <p className="ub-other-desc">Paste image from clipboard</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ub-right">
                                <div className="ub-info-card">
                                    <h4 className="ub-info-title">How it works?</h4>
                                    <div className="ub-steps">
                                        {[
                                            "Upload your electricity bill (PDF or image)",
                                            "OCR engine reads all text from the bill",
                                            "Fields like units, amount & dates are auto-extracted",
                                            "Review the data and use it to predict your next bill",
                                        ].map((step, i) => (
                                            <div key={i} className="ub-step">
                                                <div className="ub-step-num">{i + 1}</div>
                                                <p>{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="ub-info-card">
                                    <div className="ub-formats-header">
                                        <FileText size={18} color="#6D4AFF" />
                                        <h4>Supported Formats</h4>
                                    </div>
                                    <div className="ub-format-tags">
                                        {["PDF", "JPG", "PNG"].map(f => (
                                            <span key={f} className="ub-format-tag">{f}</span>
                                        ))}
                                    </div>
                                    <p className="ub-max-size">Max file size: 10MB</p>
                                </div>

                                <div className="ub-info-card ub-note-card">
                                    <div className="ub-formats-header">
                                        <AlertCircle size={18} color="#f59e0b" />
                                        <h4>Note</h4>
                                    </div>
                                    <p className="ub-note-text">
                                        Make sure the bill is clear and all details are visible for best results. Blurry or low-resolution images may reduce accuracy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "upload" && extracted && (
                        <div className="ub-extracted-section">
                            <ExtractedHeader extracted={extracted} file={file} onReExtract={handleReExtract} />
                            <ExtractedContent data={extracted} />
                        </div>
                    )}

                    {activeTab === "details" && (
                        <div className="ub-extracted-section">
                            {extracted ? (
                                <>
                                    <ExtractedHeader extracted={extracted} file={file} onReExtract={handleReExtract} />
                                    <ExtractedContent data={extracted} />
                                </>
                            ) : (
                                <div className="ub-no-data">
                                    <Upload size={48} color="#c4b5fd" />
                                    <p>Upload a bill first to see extracted details</p>
                                    <button className="ub-choose-btn" onClick={() => setActiveTab("upload")}>Go to Upload</button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function ExtractedHeader({ file, onReExtract }) {
    return (
        <div className="ub-extracted-header">
            <div className="ub-extracted-title-row">
                <h3>Extracted Bill Details</h3>
                <span className="ub-success-badge"><CheckCircle size={13} /> Success</span>
            </div>
            <div className="ub-header-actions">
                <span className="ub-filename-chip"><FileText size={13} /> {file?.name}</span>
                <button className="ub-reextract-btn" onClick={onReExtract}><RefreshCw size={14} /> Re-extract</button>
            </div>
        </div>
    );
}

function ExtractedContent({ data: d }) {
    const logo = getCompanyLogo(d.company?.name);
    const navigate = useNavigate();

    const paymentUrl = useMemo(() => {
        if (!d.company?.name || d.company?.name === "—") return null;
        const companyName = d.company.name.toLowerCase();
        
        const PAYMENT_URLS = {
            mahavitaran: "https://otheronlinepayment.mahadiscom.in/OtherReceipts/onlinePayment.jsp",
            adani: "https://www.adanielectricity.com/pay-your-bill/online-payments",
            best: "https://www.bestundertaking.net/",
            torrent: "https://connect.torrentpower.com/tplcp/preloginpaynow",
            tata: "https://pgi.billdesk.com/pgidsk/pgmerc/tatapwr/TATAPWRDetails.jsp"
        };
        
        for (const key in PAYMENT_URLS) {
            if (companyName.includes(key)) return PAYMENT_URLS[key];
        }
        
        if (
            companyName.includes("msedcl") || 
            companyName.includes("mahavitaran") || 
            companyName.includes("महावितरण") || 
            companyName.includes("mahadiscom")
        ) {
            return PAYMENT_URLS.mahavitaran;
        }
        
        return null;
    }, [d.company?.name]);

    const totalAmountDisplay = useMemo(() => {
        if (d.summary?.total && d.summary?.total !== "—") return d.summary.total;
        if (d.usage?.currAmount && d.usage?.currAmount !== "—") return d.usage.currAmount;

        const parseVal = (v) => {
            if (!v || v === "—") return 0;
            const match = String(v).match(/[\d,.]+/);
            if (!match) return 0;
            return parseFloat(match[0].replace(/,/g, "")) || 0;
        };

        const sum =
            parseVal(d.summary?.energy) +
            parseVal(d.summary?.fixed) +
            parseVal(d.summary?.fac) +
            parseVal(d.summary?.wheeling) +
            parseVal(d.summary?.duty) +
            parseVal(d.summary?.other);

        if (sum > 0) return `₹${sum.toFixed(2)}`;
        return "—";
    }, [d]);

    function handleGoToPredict() {
        navigate("/predictbill", { state: { billDetails: d } });
    }

    return (
        <>
            <div className="ub-company-card">
                <h4>Company Information</h4>
                <div className="ub-company-body">
                    <div className="ub-company-left">
                        <div className="ub-company-logo">
                            {logo
                                ? <img src={logo} alt={d.company.name} className="ub-company-logo-img" />
                                : <Zap size={28} color="#6D4AFF" />
                            }
                        </div>
                        <div>
                            <p className="ub-company-name">{d.company?.name}</p>
                            {d.company?.cin !== "—" && <p className="ub-company-detail">CIN: {d.company.cin}</p>}
                            {d.company?.website !== "—" && <p className="ub-company-detail ub-detail-row"><Globe size={13} /> {d.company.website}</p>}
                            {d.company?.toll !== "—" && <p className="ub-company-detail ub-detail-row"><Phone size={13} /> {d.company.toll} (Toll Free)</p>}
                        </div>
                    </div>
                    {d.company?.office !== "—" && (
                        <div className="ub-company-right">
                            <p className="ub-company-label">Registered Office</p>
                            <p className="ub-company-detail">{d.company.office}</p>
                        </div>
                    )}
                    {d.company?.gstin !== "—" && (
                        <div>
                            <p className="ub-company-label">GSTIN</p>
                            <p className="ub-company-detail">{d.company.gstin}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="ub-consumer-grid">
                {[
                    { label: "Consumer Name",    value: d.consumer?.name,           icon: <User size={13} /> },
                    { label: "Consumer ID",      value: d.consumer?.id,             icon: <CreditCard size={13} /> },
                    { label: "Connection No.",   value: d.consumer?.connection,     icon: <Plug size={13} /> },
                    { label: "Bill Date",        value: d.consumer?.billDate,       icon: <Calendar size={13} /> },
                    { label: "Due Date",         value: d.consumer?.dueDate,        icon: <Calendar size={13} /> },
                    { label: "Tariff Category",  value: d.consumer?.tariffCategory, icon: <Zap size={13} /> },
                    { label: "Bill Status",      value: d.usage?.status,            icon: <BadgeCheck size={13} />, highlight: true },
                ].map((item, i) => (
                    <div key={i} className="ub-consumer-cell">
                        <p className="ub-cell-label ub-detail-row">{item.icon} {item.label}</p>
                        <p className={`ub-cell-value ${item.highlight ? "paid" : ""}`}>{item.value || "—"}</p>
                    </div>
                ))}
            </div>

            <div className="ub-usage-grid">
                {[
                    { label: "Previous Month Units", value: d.usage?.prevUnits,  icon: <Zap size={13} /> },
                    { label: "Previous Amount",      value: d.usage?.prevAmount, icon: <Banknote size={13} /> },
                    { label: "Current Month Units",  value: d.usage?.currUnits,  icon: <Zap size={13} /> },
                    { label: "Current Amount",       value: d.usage?.currAmount, icon: <Wallet size={13} /> },
                ].map((item, i) => (
                    <div key={i} className="ub-usage-cell">
                        <p className="ub-cell-label ub-detail-row">{item.icon} {item.label}</p>
                        <p className="ub-cell-value">{item.value || "—"}</p>
                    </div>
                ))}
            </div>

            {d.history && d.history.length > 0 && (
                <div className="ub-history-card" style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
                    marginBottom: "24px",
                    border: "1px solid #f3f4f6"
                }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Banknote size={16} color="#6D4AFF" /> Billing &amp; Payment History ({d.history.length} Months)
                    </h4>
                    <p style={{ fontSize: "12.5px", color: "#6b7280", marginBottom: "16px" }}>Extracted historical payments from the bill</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
                        {d.history.map((h, i) => (
                            <div key={i} style={{
                                backgroundColor: "#f9fafb",
                                borderRadius: "8px",
                                padding: "10px 14px",
                                border: "1px solid #e5e7eb",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px"
                            }}>
                                <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>{h.date}</span>
                                <span style={{ fontSize: "16px", color: "#111827", fontWeight: "700" }}>
                                    {h.amount && h.amount !== "—" ? h.amount : h.units}
                                </span>
                                {h.amount && h.amount !== "—" && h.units && h.units !== "—" && (
                                    <span style={{ fontSize: "11px", color: "#6b7280" }}>{h.units}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="ub-bottom-grid">
                <div className="ub-slab-card">
                    <h4>Slab Wise Unit Charges</h4>
                    <p className="ub-slab-sub">Range based tariff structure</p>
                    <table className="ub-slab-table">
                        <thead>
                            <tr>
                                <th>Slab Range (Units)</th>
                                <th>Unit Charge (₹/Unit)</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(d.slabs || []).map((s, i) => (
                                <tr key={i}>
                                    <td>{s.range}</td>
                                    <td>{s.rate}</td>
                                    <td>{s.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="ub-slab-note">* Above rates are indicative and may vary as per your electricity provider.</p>
                </div>

                <div className="ub-summary-card">
                    <h4>Bill Summary</h4>
                    <div className="ub-summary-rows">
                        <div className="ub-summary-row"><span>Energy Charges</span><span>{d.summary?.energy || "₹0.00"}</span></div>
                        <div className="ub-summary-row"><span>Fixed Charge</span><span>{d.summary?.fixed || "₹0.00"}</span></div>
                        <div className="ub-summary-row"><span>Fuel Adjustment (FAC)</span><span>{d.summary?.fac || "₹0.00"}</span></div>
                        <div className="ub-summary-row"><span>Wheeling Charge</span><span>{d.summary?.wheeling || "₹0.00"}</span></div>
                        <div className="ub-summary-row"><span>Electricity Duty</span><span>{d.summary?.duty || "₹0.00"}</span></div>
                        <div className="ub-summary-row"><span>Other Charges</span><span>{d.summary?.other || "₹0.00"}</span></div>
                        <div className="ub-summary-total">
                            <span>Total Amount</span>
                            <span>{totalAmountDisplay}</span>
                        </div>
                    </div>
                    {paymentUrl && (
                        <a 
                            href={paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ub-pay-btn"
                        >
                            <CreditCard size={16} /> Pay Bill Online
                        </a>
                    )}
                    <button className="ub-download-btn"><Download size={16} /> Download Extracted Data</button>
                    <button className="ub-predict-action-btn" onClick={handleGoToPredict} style={{
                        marginTop: "12px",
                        backgroundColor: "#6D4AFF",
                        color: "white",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: "pointer",
                        width: "100%"
                    }}>
                        <Zap size={16} /> Predict Next Month Bill
                    </button>
                </div>
            </div>
        </>
    );
}
