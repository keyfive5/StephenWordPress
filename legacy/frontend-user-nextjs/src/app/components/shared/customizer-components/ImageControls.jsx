import { FiImage, FiUpload } from "react-icons/fi";

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
        background: "linear-gradient(135deg, #059669, #0d9488)",
        color: "#ffffff",
    },
    title: {
        margin: 0,
        fontSize: "1rem",
        fontWeight: 600,
        color: "#0f172a",
    },
    uploadWrap: {
        position: "relative",
        display: "block",
    },
    fileInput: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        cursor: "pointer",
    },
    uploadBox: {
        width: "100%",
        padding: "2.5rem 1rem",
        border: "2px dashed #e2e8f0",
        borderRadius: "0.75rem",
        backgroundColor: "rgba(248, 250, 252, 0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        boxSizing: "border-box",
    },
    uploadText: {
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "#475569",
    },
    uploadHint: {
        fontSize: "0.75rem",
        color: "#94a3b8",
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
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "0.5rem",
    },
    thumbWrap: {
        position: "relative",
        cursor: "pointer",
    },
    thumb: {
        width: "100%",
        aspectRatio: "1 / 1",
        objectFit: "cover",
        borderRadius: "0.5rem",
        border: "2px solid transparent",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        borderRadius: "0.5rem",
        backgroundColor: "rgba(0, 0, 0, 0.02)",
    },
};

const ImageControls = ({ gallery, addImage, insertFromGallery }) => {
    return (
        <div style={styles.section}>
            <div style={styles.header}>
                <div style={styles.iconBox}>
                    <FiImage size={14} />
                </div>
                <h3 style={styles.title}>Upload Images</h3>
            </div>

            <label style={styles.uploadWrap}>
                <input
                    style={styles.fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        if (e.target.files?.length) {
                            addImage(e.target.files);
                        }
                    }}
                />
                <div style={styles.uploadBox}>
                    <FiUpload size={32} color="#94a3b8" />
                    <span style={styles.uploadText}>Click to upload</span>
                    <span style={styles.uploadHint}>PNG, JPG, GIF, WEBP</span>
                </div>
            </label>

            {gallery.length > 0 && (
                <div>
                    <label style={styles.label}>Your Uploads</label>
                    <div style={styles.grid}>
                        {gallery.map((image, idx) => (
                            <div
                                key={idx}
                                style={styles.thumbWrap}
                                onClick={() => insertFromGallery(image)}
                            >
                                <img src={image.preview} alt="preview" style={styles.thumb} />
                                <div style={styles.overlay} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageControls;
