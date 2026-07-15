import { FiArrowUp, FiImage, FiMove, FiTrash2, FiType } from "react-icons/fi";

const styles = {
    wrapper: {
        borderTop: "1px solid #f1f5f9",
        paddingTop: "1.25rem",
        marginTop: "1.25rem",
    },
    label: {
        display: "block",
        marginBottom: "0.75rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "#64748b",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    },
    placeholder: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem",
        backgroundColor: "#f8fafc",
        borderRadius: "0.75rem",
    },
    placeholderIcon: {
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        backgroundColor: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
    },
    placeholderText: {
        margin: 0,
        fontSize: "0.875rem",
        color: "#475569",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    card: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem",
        backgroundColor: "#f8fafc",
        borderRadius: "0.75rem",
    },
    iconBox: {
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#475569",
    },
    title: {
        margin: 0,
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "#0f172a",
    },
    meta: {
        margin: 0,
        fontSize: "0.75rem",
        color: "#64748b",
    },
    actions: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "0.5rem",
    },
    neutralButton: {
        padding: "0.5rem 0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "0.5rem",
        backgroundColor: "#ffffff",
        color: "#334155",
        fontWeight: 500,
        fontSize: "0.875rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
    },
    dangerButton: {
        padding: "0.5rem 0.75rem",
        border: "1px solid #fecaca",
        borderRadius: "0.5rem",
        backgroundColor: "#fef2f2",
        color: "#dc2626",
        fontWeight: 500,
        fontSize: "0.875rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
    },
};

const SelectedItemControls = ({
    selectedItem,
    bringToFront,
    setItems,
    setSelectedId,
}) => {
    return (
        <div style={styles.wrapper}>
            <label style={styles.label}>Selected Item</label>
            {!selectedItem ? (
                <div style={styles.placeholder}>
                    <div style={styles.placeholderIcon}>
                        <FiMove />
                    </div>
                    <p style={styles.placeholderText}>Click on an element to select it</p>
                </div>
            ) : (
                <div style={styles.content}>
                    <div style={styles.card}>
                        <div style={styles.iconBox}>
                            {selectedItem.type === "image" ? <FiImage /> : <FiType />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={styles.title}>
                                {selectedItem.type === "text" ? selectedItem.text : "Image"}
                            </p>
                            <p style={styles.meta}>
                                {selectedItem.type === "text"
                                    ? selectedItem.fontFamily
                                    : `${selectedItem.width}x${selectedItem.height}`}
                            </p>
                        </div>
                    </div>
                    <div style={styles.actions}>
                        <button
                            style={styles.neutralButton}
                            onClick={() => bringToFront(selectedItem.id)}
                        >
                            <FiArrowUp />
                            Front
                        </button>
                        <button
                            style={styles.dangerButton}
                            onClick={() => {
                                setItems((prev) =>
                                    prev.filter((item) => item.id !== selectedItem.id)
                                );
                                setSelectedId(null);
                            }}
                        >
                            <FiTrash2 />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectedItemControls;
