import { FiX } from "react-icons/fi";
import { IoQrCodeOutline } from "react-icons/io5";

const styles = {
    section: {
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid #f1f5f9",
    },
    iconBox: {
        width: "1.75rem",
        height: "1.75rem",
        borderRadius: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #334155, #0f172a)",
        color: "#ffffff",
    },
    title: {
        margin: 0,
        fontSize: "1rem",
        fontWeight: 600,
        color: "#0f172a",
    },
    button: {
        width: "100%",
        padding: "0.9rem 1rem",
        background: "linear-gradient(135deg, #334155, #0f172a)",
        color: "#ffffff",
        fontWeight: 500,
        borderRadius: "0.75rem",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        boxShadow: "0 10px 20px rgba(15, 23, 42, 0.18)",
        cursor: "pointer",
    },
    helper: {
        margin: 0,
        fontSize: "0.75rem",
        color: "#64748b",
        textAlign: "center",
    },
    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: "1rem",
    },
    modal: {
        width: "100%",
        maxWidth: "28rem",
        backgroundColor: "#ffffff",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 25px 60px rgba(15, 23, 42, 0.22)",
        overflow: "hidden",
    },
    modalHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.5rem",
        borderBottom: "1px solid #f1f5f9",
    },
    closeButton: {
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        border: "none",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    body: {
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    label: {
        display: "block",
        marginBottom: "0.5rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#64748b",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    },
    textarea: {
        width: "100%",
        padding: "0.75rem 1rem",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        color: "#0f172a",
        boxSizing: "border-box",
        resize: "none",
        outline: "none",
    },
    footer: {
        display: "flex",
        gap: "0.75rem",
        padding: "1.5rem",
        borderTop: "1px solid #f1f5f9",
    },
    secondaryButton: {
        flex: 1,
        padding: "0.75rem 1rem",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        backgroundColor: "#ffffff",
        color: "#334155",
        fontWeight: 500,
        cursor: "pointer",
    },
};

const QRControls = ({
    showQRModal,
    setShowQRModal,
    qrText,
    setQRText,
    generateQRCode,
}) => {
    const closeModal = () => {
        setShowQRModal(false);
        setQRText("");
    };

    return (
        <>
            <div style={styles.section}>
                <div style={styles.header}>
                    <div style={styles.iconBox}>
                        <IoQrCodeOutline size={14} />
                    </div>
                    <h3 style={styles.title}>QR Code</h3>
                </div>

                <button style={styles.button} onClick={() => setShowQRModal(true)}>
                    <IoQrCodeOutline size={18} />
                    Generate QR Code
                </button>
                <p style={styles.helper}>
                    Create QR codes for URLs, text, or any content
                </p>
            </div>

            {showQRModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ ...styles.iconBox, width: "2rem", height: "2rem" }}>
                                    <IoQrCodeOutline />
                                </div>
                                <h3 style={{ ...styles.title, fontSize: "1.125rem" }}>
                                    Generate QR Code
                                </h3>
                            </div>
                            <button onClick={closeModal} style={styles.closeButton}>
                                <FiX />
                            </button>
                        </div>

                        <div style={styles.body}>
                            <div>
                                <label style={styles.label}>Content</label>
                                <textarea
                                    style={styles.textarea}
                                    placeholder="Enter URL, text, or any content..."
                                    value={qrText}
                                    onChange={(e) => setQRText(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div style={styles.footer}>
                            <button onClick={closeModal} style={styles.secondaryButton}>
                                Cancel
                            </button>
                            <button
                                style={{
                                    ...styles.button,
                                    flex: 1,
                                    boxShadow: !qrText.trim()
                                        ? "none"
                                        : "0 10px 20px rgba(15, 23, 42, 0.18)",
                                    background: !qrText.trim()
                                        ? "#f1f5f9"
                                        : "linear-gradient(135deg, #334155, #0f172a)",
                                    color: !qrText.trim() ? "#94a3b8" : "#ffffff",
                                    cursor: !qrText.trim() ? "not-allowed" : "pointer",
                                }}
                                onClick={() => generateQRCode(qrText)}
                                disabled={!qrText.trim()}
                            >
                                <IoQrCodeOutline size={18} />
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QRControls;
