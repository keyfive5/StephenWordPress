import { Stage, Layer, Rect, Transformer } from "react-konva";
import { FiGrid } from "react-icons/fi";

const styles = {
    panel: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        borderRadius: "1rem",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        padding: "1.5rem",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.25rem",
    },
    titleWrap: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
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
    canvasArea: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "300px",
        background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
        borderRadius: "0.75rem",
        padding: "1.5rem",
    },
};

const CanvasPanel = ({
    bg,
    items,
    canvasSize,
    stageRef,
    trRef,
    containerRef,
    onEmptyClick,
    Node,
}) => {
    return (
        <div style={styles.panel}>
            <div style={styles.header}>
                <div style={styles.titleWrap}>
                    <div style={styles.iconBox}>
                        <FiGrid size={14} />
                    </div>
                    <h3 style={styles.title}>Design Canvas</h3>
                </div>
            </div>

            <div style={styles.canvasArea}>
                <div
                    style={{
                        overflow: "hidden",
                        backgroundColor: "#ffffff",
                        margin: "0 auto",
                        borderRadius: "0.5rem",
                        boxShadow: "0 20px 30px rgba(15, 23, 42, 0.12)",
                        boxSizing: "border-box",
                        width: canvasSize.w,
                        height: canvasSize.h,
                        position: "relative",
                    }}
                    ref={containerRef}
                >
                    <Stage
                        ref={stageRef}
                        width={canvasSize.w}
                        height={canvasSize.h}
                        onMouseDown={onEmptyClick}
                        onTouchStart={onEmptyClick}
                    >
                        <Layer listening={false}>
                            <Rect
                                x={0}
                                y={0}
                                stroke="#94a3b8"
                                strokeWidth={1.5}
                                width={canvasSize.w}
                                height={canvasSize.h}
                                fill={bg}
                            />
                        </Layer>
                        <Layer>
                            {items.map((item) => (
                                <Node key={item.id} item={item} />
                            ))}
                            <Transformer
                                ref={trRef}
                                rotateEnabled
                                anchorSize={8}
                                rotationAnchorOffset={2}
                                anchorCornerRadius={4}
                                borderStroke="#3b82f6"
                                anchorStroke="#3b82f6"
                                anchorFill="#ffffff"
                                borderDash={[4, 2]}
                            />
                        </Layer>
                    </Stage>
                </div>
            </div>
        </div>
    );
};

export default CanvasPanel;
