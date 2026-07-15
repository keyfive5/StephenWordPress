import { FiEye, FiShoppingCart, FiX } from "react-icons/fi";
import { getProductPricing, resolvePriceForCurrency } from '@/utils/pricing';

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1.25rem",
    },
    modal: {
        width: "90%",
        maxWidth: "64rem",
        maxHeight: "90vh",
        backgroundColor: "#ffffff",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 25px 60px rgba(15, 23, 42, 0.22)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 1.5rem",
        borderBottom: "1px solid #f1f5f9",
    },
    titleWrap: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },
    iconBox: {
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        color: "#ffffff",
    },
    title: {
        margin: 0,
        fontSize: "1.125rem",
        fontWeight: 600,
        color: "#0f172a",
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
        padding: "0.25rem",
        overflow: "auto",
        flex: 1,
    },
    footer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0.75rem 1.25rem",
        borderTop: "1px solid #f1f5f9",
    },
    addToCartButton: {
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        border: "none",
        background: "linear-gradient(135deg, #16a34a, #10b981)",
        color: "#ffffff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        boxShadow: "0 10px 20px rgba(22, 163, 74, 0.18)",
    },
};

const PreviewModal = ({
    showPreviewModal,
    setShowPreviewModal,
    previewStageRef,
    PreviewStage,
    customizationData,
    canvasSize,
    items,
    setSelectedMaterial,
    setNotes,
}) => {
    if (!showPreviewModal) {
        return null;
    }

    const closeModal = () => {
        setShowPreviewModal(false);
        setSelectedMaterial("");
        setNotes("");
    };

    const handleAddToCart = async () => {
        if (!previewStageRef.current) {
            return;
        }

        const thumbnailDataUrl = previewStageRef.current.toDataURL({
            mimeType: "image/png",
            pixelRatio: 0.5,
        });

        const productPricing = getProductPricing(customizationData || {});
        const selectedCurrency = customizationData?.selectedCurrency || productPricing.currency || 'USD';
        const fallbackPrice = resolvePriceForCurrency(productPricing, selectedCurrency);

        const checkoutData = {
            design: {
                id: customizationData?.templateId || Date.now(),
                name: "QR Code Social Media - Template 1",
                thumbnail: thumbnailDataUrl,
                dimensions: `${canvasSize.w} x ${canvasSize.h}`,
                price: fallbackPrice,
                currency: selectedCurrency,
                quantity: 1,
                customization: {
                    dimensions: `${canvasSize.w} x ${canvasSize.h}`,
                    material: customizationData?.selectedOptions?.material || "Standard",
                    options: items.map((item) => item.type).join(", "),
                },
                variant: customizationData.variant,
                pricing: {
                    basePrice: productPricing.basePrice,
                    USD: productPricing.usdPrice,
                    CAD: productPricing.cadPrice,
                    currency: selectedCurrency,
                },
            },
            couponCode: "",
            editedImage: "",
        };

        console.log("checkoutData on /customize", checkoutData);
        sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData));
        window.location.href = "/checkout";
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <div style={styles.titleWrap}>
                        <div style={styles.iconBox}>
                            <FiEye />
                        </div>
                        <h3 style={styles.title}>Preview</h3>
                    </div>
                    <button style={styles.closeButton} onClick={closeModal}>
                        <FiX />
                    </button>
                </div>

                <div style={styles.body}>
                    <PreviewStage />
                </div>

                <div style={styles.footer}>
                    <button onClick={handleAddToCart} style={styles.addToCartButton}>
                        <FiShoppingCart />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
