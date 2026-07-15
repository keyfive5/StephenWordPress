import { FiArrowDown, FiArrowUp, FiLayers, FiMove } from "react-icons/fi";

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
        background: "linear-gradient(135deg, #4f46e5, #2563eb)",
        color: "#ffffff",
    },
    title: {
        margin: 0,
        fontSize: "1rem",
        fontWeight: 600,
        color: "#0f172a",
    },
    empty: {
        textAlign: "center",
        padding: "2rem 0",
    },
    emptyText: {
        margin: "0.5rem 0 0",
        fontSize: "0.875rem",
        color: "#64748b",
    },
    helperText: {
        margin: "0.25rem 0 0",
        fontSize: "0.75rem",
        color: "#94a3b8",
    },
    reorderNote: {
        margin: 0,
        fontSize: "0.75rem",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
    },
    list: {
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxHeight: "280px",
        overflowY: "auto",
        paddingRight: "0.25rem",
    },
    itemRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem",
        borderRadius: "0.75rem",
        cursor: "pointer",
        border: "2px solid transparent",
        transition: "all 0.2s ease",
    },
    itemInfo: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flex: 1,
        minWidth: 0,
    },
    thumbBox: {
        flexShrink: 0,
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    thumbText: {
        fontSize: "0.75rem",
        fontWeight: 700,
        color: "#475569",
    },
    thumbImage: {
        width: "1.5rem",
        height: "1.5rem",
        objectFit: "contain",
    },
    itemCopy: {
        flex: 1,
        minWidth: 0,
    },
    itemTitle: {
        margin: 0,
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "#0f172a",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    itemMeta: {
        margin: 0,
        fontSize: "0.75rem",
        color: "#64748b",
    },
    actionGroup: {
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        marginLeft: "0.5rem",
    },
    iconButton: {
        width: "1.75rem",
        height: "1.75rem",
        borderRadius: "0.5rem",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        color: "#475569",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
};

const LayersPanel = ({
    items,
    selectedId,
    setSelectedId,
    bringForward,
    sendBackward,
    typeLabel,
}) => {
    return (
        <div style={styles.section}>
            <div style={styles.header}>
                <div style={styles.iconBox}>
                    <FiLayers size={14} />
                </div>
                <h3 style={styles.title}>Layers</h3>
            </div>

            {items.length === 0 ? (
                <div style={styles.empty}>
                    <FiLayers size={40} color="#cbd5e1" />
                    <p style={styles.emptyText}>No layers yet</p>
                    <p style={styles.helperText}>Add text or images to get started</p>
                </div>
            ) : (
                <>
                    <p style={styles.reorderNote}>
                        <FiMove size={14} />
                        Drag to reorder - Top = Front
                    </p>
                    <ul style={styles.list}>
                        {[...items].reverse().map((item, index) => {
                            let label = typeLabel[item.type] || item.type;
                            if (item.type === "image") {
                                label = `${item.layeringtype || item.type}`;
                            }

                            return (
                                <li
                                    key={item.id}
                                    style={{
                                        ...styles.itemRow,
                                        backgroundColor:
                                            selectedId === item.id ? "rgba(239, 246, 255, 0.8)" : "#f8fafc",
                                        borderColor:
                                            selectedId === item.id ? "#2563eb" : "transparent",
                                        boxShadow:
                                            selectedId === item.id
                                                ? "0 1px 3px rgba(15, 23, 42, 0.08)"
                                                : "none",
                                    }}
                                    onClick={() => setSelectedId(item.id)}
                                >
                                    <div style={styles.itemInfo}>
                                        <div style={styles.thumbBox}>
                                            {item.type === "image" && item.image ? (
                                                <img
                                                    src={item.image.src}
                                                    alt=""
                                                    style={styles.thumbImage}
                                                />
                                            ) : (
                                                <span style={styles.thumbText}>T</span>
                                            )}
                                        </div>
                                        <div style={styles.itemCopy}>
                                            <p style={styles.itemTitle}>
                                                {label}
                                                {item.text &&
                                                    `: "${item.text.length > 15
                                                        ? `${item.text.slice(0, 15)}...`
                                                        : item.text}"`}
                                            </p>
                                            <p style={styles.itemMeta}>
                                                Layer {items.length - index}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={styles.actionGroup}>
                                        <button
                                            style={styles.iconButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                bringForward(item.id);
                                            }}
                                        >
                                            <FiArrowUp size={12} />
                                        </button>
                                        <button
                                            style={styles.iconButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                sendBackward(item.id);
                                            }}
                                        >
                                            <FiArrowDown size={12} />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
};

export default LayersPanel;
