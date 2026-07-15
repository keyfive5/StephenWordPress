import { BsStars } from "react-icons/bs";
import { FiX } from "react-icons/fi";

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
        background: "linear-gradient(135deg, #9333ea, #ec4899)",
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
        background: "linear-gradient(135deg, #9333ea, #ec4899)",
        color: "#ffffff",
        fontWeight: 500,
        borderRadius: "0.75rem",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        boxShadow: "0 10px 20px rgba(147, 51, 234, 0.18)",
        cursor: "pointer",
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
        maxWidth: "42rem",
        maxHeight: "80vh",
        backgroundColor: "#ffffff",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 25px 60px rgba(15, 23, 42, 0.22)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
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
    body: {
        padding: "0.75rem",
        overflowY: "auto",
        flex: 1,
        maxHeight: "17rem",
    },
    bodyInner: {
        position: "relative",
        minHeight: "100px",
    },
    loadingOverlay: {
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 10,
        borderRadius: "0.75rem",
    },
    spinner: {
        width: "2.5rem",
        height: "2.5rem",
        border: "4px solid #f3e8ff",
        borderTop: "4px solid #9333ea",
        borderRadius: "999px",
        animation: "spin 1s linear infinite",
    },
    loadingText: {
        marginTop: "0.75rem",
        fontSize: "0.875rem",
        color: "#475569",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "0.5rem",
    },
    item: {
        position: "relative",
        cursor: "pointer",
    },
    image: {
        width: "100%",
        aspectRatio: "1 / 1",
        objectFit: "contain",
        borderRadius: "0.75rem",
        border: "2px solid #e2e8f0",
        backgroundColor: "#ffffff",
        padding: "0.5rem",
        boxSizing: "border-box",
    },
    imageOverlay: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderRadius: "0.75rem",
    },
};

const ClipArtControls = ({
    showClipartModal,
    setShowClipartModal,
    clipArts,
    insertClipArt,
    isLoadingClipart,
    setIsLoadingClipart,
    setLoadedCount,
}) => {
    return (
        <>
            <div style={styles.section}>
                <div style={styles.header}>
                    <div style={styles.iconBox}>
                        <BsStars size={14} />
                    </div>
                    <h3 style={styles.title}>Clip Art Library</h3>
                </div>

                <button
                    style={styles.primaryButton}
                    onClick={() => {
                        setShowClipartModal(true);
                        setIsLoadingClipart(true);
                        setLoadedCount(0);
                    }}
                >
                    <BsStars size={18} />
                    Browse Clip Art
                </button>
            </div>

            {showClipartModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ ...styles.iconBox, width: "2rem", height: "2rem" }}>
                                    <BsStars />
                                </div>
                                <h3 style={{ ...styles.title, fontSize: "1.125rem" }}>
                                    Clip Art Library
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowClipartModal(false)}
                                style={styles.closeButton}
                            >
                                <FiX />
                            </button>
                        </div>

                        <div style={styles.body}>
                            <div style={styles.bodyInner}>
                                {isLoadingClipart && (
                                    <div style={styles.loadingOverlay}>
                                        <div style={styles.spinner} />
                                        <p style={styles.loadingText}>Loading clip art...</p>
                                    </div>
                                )}

                                <div style={styles.grid}>
                                    {clipArts.map((name) => (
                                        <div
                                            key={name}
                                            style={styles.item}
                                            onClick={() => {
                                                setIsLoadingClipart(true);
                                                insertClipArt(name);
                                                setTimeout(() => {
                                                    setShowClipartModal(false);
                                                    setIsLoadingClipart(false);
                                                }, 400);
                                            }}
                                        >
                                            <img
                                                src={`/new-clip-art/${name}`}
                                                alt={name}
                                                style={{
                                                    ...styles.image,
                                                    opacity: isLoadingClipart ? 0.3 : 1,
                                                }}
                                                onLoad={() => {
                                                    setLoadedCount((prev) => {
                                                        const next = prev + 1;
                                                        if (next === clipArts.length) {
                                                            setIsLoadingClipart(false);
                                                        }
                                                        return next;
                                                    });
                                                }}
                                            />
                                            <div style={styles.imageOverlay} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClipArtControls;
