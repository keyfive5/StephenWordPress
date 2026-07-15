import { FiDroplet } from "react-icons/fi";

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
        background: "linear-gradient(135deg, #d97706, #ea580c)",
        color: "#ffffff",
    },
    title: {
        margin: 0,
        fontSize: "1rem",
        fontWeight: 600,
        color: "#0f172a",
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
    row: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },
    colorInput: {
        width: "3rem",
        height: "3rem",
        cursor: "pointer",
        borderRadius: "0.75rem",
        border: "2px solid #e2e8f0",
        padding: "0.2rem",
        backgroundColor: "#ffffff",
    },
    value: {
        fontSize: "0.875rem",
        color: "#475569",
        fontFamily: "monospace",
    },
    button: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        backgroundColor: "#ffffff",
        color: "#334155",
        fontWeight: 500,
        fontSize: "0.875rem",
        cursor: "pointer",
    },
};

const BackgroundControls = ({ bg, setBg }) => {
    return (
        <div style={styles.section}>
            <div style={styles.header}>
                <div style={styles.iconBox}>
                    <FiDroplet size={14} />
                </div>
                <h3 style={styles.title}>Background</h3>
            </div>

            <div>
                <label style={styles.label}>Color</label>
                <div style={styles.row}>
                    <input
                        style={styles.colorInput}
                        type="color"
                        value={bg}
                        onChange={(e) => setBg(e.target.value)}
                    />
                    <span style={styles.value}>{bg}</span>
                </div>
            </div>

            <button onClick={() => setBg("transparent")} style={styles.button}>
                Transparent Background
            </button>
        </div>
    );
};

export default BackgroundControls;
