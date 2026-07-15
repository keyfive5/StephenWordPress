import { FiPlus, FiType, FiX } from "react-icons/fi";

const styles = {
    section: {
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
    },
    sectionHeader: {
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
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#ffffff",
    },
    title: {
        margin: 0,
        fontSize: "1rem",
        fontWeight: 600,
        color: "#0f172a",
    },
    primaryButton: {
        width: "100%",
        padding: "0.9rem 1rem",
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#ffffff",
        fontWeight: 500,
        borderRadius: "0.75rem",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
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
        top: "1rem",
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
        padding: "0.75rem 1.5rem",
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
    modalBody: {
        padding: "0.75rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
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
    input: {
        width: "100%",
        padding: "0.5rem 0.75rem",
        fontSize: "0.875rem",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        color: "#0f172a",
        outline: "none",
        boxSizing: "border-box",
    },
    fieldGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "1rem",
    },
    colorRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },
    colorInput: {
        width: "2rem",
        height: "2rem",
        cursor: "pointer",
        borderRadius: "0.75rem",
        border: "2px solid #e2e8f0",
        padding: "0.2rem",
        backgroundColor: "#ffffff",
    },
    colorValue: {
        fontSize: "0.875rem",
        color: "#475569",
        fontFamily: "monospace",
    },
    footer: {
        display: "flex",
        gap: "0.75rem",
        padding: "1.5rem 2rem",
        borderTop: "1px solid #f1f5f9",
    },
    secondaryButton: {
        width: "100%",
        padding: "0.5rem 0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        backgroundColor: "#ffffff",
        color: "#334155",
        fontWeight: 500,
        cursor: "pointer",
    },
};

const TextControls = ({
    showTextModal,
    setShowTextModal,
    tVal,
    setTVal,
    tFont,
    setTFont,
    tSize,
    setTSize,
    tColor,
    setTColor,
    fonts,
    addText,
}) => {
    return (
        <>
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.iconBox}>
                        <FiType size={14} />
                    </div>
                    <h3 style={styles.title}>Add Text</h3>
                </div>
                <button onClick={() => setShowTextModal(true)} style={styles.primaryButton}>
                    <FiPlus size={18} />
                    Create New Text
                </button>
                <p style={styles.helper}>Click to add custom typography to your design</p>
            </div>

            {showTextModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ ...styles.iconBox, width: "2rem", height: "2rem" }}>
                                    <FiType />
                                </div>
                                <h3 style={{ ...styles.title, fontSize: "0.95rem" }}>Add Text</h3>
                            </div>
                            <button
                                onClick={() => setShowTextModal(false)}
                                style={styles.closeButton}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <div>
                                <label style={styles.label}>Your Text</label>
                                <input
                                    style={styles.input}
                                    placeholder="Type something..."
                                    value={tVal}
                                    onChange={(e) => setTVal(e.target.value)}
                                />
                            </div>

                            <div style={styles.fieldGrid}>
                                <div>
                                    <label style={styles.label}>Font</label>
                                    <select
                                        style={styles.input}
                                        value={tFont}
                                        onChange={(e) => setTFont(e.target.value)}
                                    >
                                        {fonts.slice(0, 10).map((font) => (
                                            <option
                                                key={font}
                                                value={font}
                                                style={{ fontFamily: font }}
                                            >
                                                {font}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.label}>Size</label>
                                    <input
                                        style={styles.input}
                                        type="number"
                                        min="0"
                                        max="220"
                                        value={tSize}
                                        onChange={(e) =>
                                            setTSize(parseInt(e.target.value || "0", 10))
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={styles.label}>Color</label>
                                <div style={styles.colorRow}>
                                    <input
                                        style={styles.colorInput}
                                        type="color"
                                        value={tColor}
                                        onChange={(e) => setTColor(e.target.value)}
                                    />
                                    <span style={styles.colorValue}>{tColor}</span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.footer}>
                            <button
                                onClick={() => setShowTextModal(false)}
                                style={styles.secondaryButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    addText();
                                    setShowTextModal(false);
                                }}
                                style={styles.primaryButton}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TextControls;
