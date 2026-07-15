import { BsStars } from "react-icons/bs";
import { FiEye, FiTrash2 } from "react-icons/fi";

const styles = {
    wrapper: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        position: "sticky",
        top: 0,
        zIndex: 50,
    },
    container: {
        maxWidth: "80rem",
        margin: "0 auto",
        padding: "1rem 1.5rem",
    },
    row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
    },
    brand: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },
    brandIcon: {
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.18)",
        color: "#ffffff",
    },
    title: {
        margin: 0,
        fontSize: "1.25rem",
        fontWeight: 600,
        color: "#0f172a",
    },
    actions: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
    },
    button: {
        padding: "0.5rem 1rem",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "0.5rem",
        color: "#334155",
        fontWeight: 500,
        fontSize: "0.875rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
        cursor: "pointer",
    },
};

const HeaderBar = ({ generatePreview, onClear }) => {
    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.row}>
                    <div style={styles.brand}>
                        <div style={styles.brandIcon}>
                            <BsStars size={18} />
                        </div>
                        <h1 style={styles.title}>Edit your design here</h1>
                    </div>

                    <div style={styles.actions}>
                        <button onClick={generatePreview} style={styles.button}>
                            <FiEye size={18} />
                            Preview
                        </button>
                        <button onClick={onClear} style={styles.button}>
                            <FiTrash2 size={18} />
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderBar;
