import { BsStars } from "react-icons/bs";
import { FiDroplet, FiImage, FiLayers, FiType } from "react-icons/fi";
import { IoQrCodeOutline } from "react-icons/io5";

const tabs = [
    { id: "text", icon: FiType, label: "Text" },
    { id: "images", icon: FiImage, label: "Media" },
    { id: "clipart", icon: BsStars, label: "Clip Art" },
    { id: "background", icon: FiDroplet, label: "Bg" },
    { id: "layers", icon: FiLayers, label: "Layers" },
    { id: "qr", icon: IoQrCodeOutline, label: "QR" },
];

const styles = {
    wrapper: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        borderRadius: "1rem",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        padding: "0.5rem",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "0.25rem",
    },
    buttonBase: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.75rem 0.5rem",
        borderRadius: "0.75rem",
        fontWeight: 500,
        fontSize: "0.8rem",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
};

const TabNavigation = ({ tab, setTab }) => {
    return (
        <div style={styles.wrapper}>
            <div style={styles.grid}>
                {tabs.map(({ id, icon: Icon, label }) => {
                    const active = tab === id;

                    return (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            style={{
                                ...styles.buttonBase,
                                background: active
                                    ? "linear-gradient(135deg, #2563eb, #4f46e5)"
                                    : "transparent",
                                color: active ? "#ffffff" : "#475569",
                                boxShadow: active
                                    ? "0 10px 20px rgba(37, 99, 235, 0.2)"
                                    : "none",
                                transform: active ? "scale(1.03)" : "scale(1)",
                            }}
                        >
                            <Icon
                                size={18}
                                style={{
                                    marginBottom: "0.25rem",
                                    color: active ? "#ffffff" : "#64748b",
                                }}
                            />
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TabNavigation;
