import CanvasPanel from "./customizer-components/CanvasPanel";
import HeaderBar from "./customizer-components/HeaderBar";
import LeftPanel from "./customizer-components/LeftPanel";
import PreviewModal from "./customizer-components/PreviewModal";

const CustomizerUI = ({
    tab,
    setTab,
    items,
    setItems,
    selectedId,
    setSelectedId,
    selectedItem,
    bg,
    setBg,
    showTextModal,
    setShowTextModal,
    showClipartModal,
    setShowClipartModal,
    showQRModal,
    setShowQRModal,
    showPreviewModal,
    setShowPreviewModal,
    tVal,
    setTVal,
    tFont,
    setTFont,
    tSize,
    setTSize,
    tColor,
    setTColor,
    fonts,
    gallery,
    addImage,
    insertFromGallery,
    clipArts,
    insertClipArt,
    isLoadingClipart,
    setIsLoadingClipart,
    setLoadedCount,
    qrText,
    setQRText,
    generateQRCode,
    canvasSize,
    stageRef,
    trRef,
    containerRef,
    previewStageRef,
    addText,
    generatePreview,
    bringForward,
    sendBackward,
    bringToFront,
    onEmptyClick,
    typeLabel,
    customizationData,
    Node,
    PreviewStage,
    setSelectedMaterial,
    setNotes,
}) => {
    const handleClear = () => {
        setItems([]);
        setSelectedId(null);
        setBg("#ffffff");
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)"
            }}
        >
            <HeaderBar generatePreview={generatePreview} onClear={handleClear} />

            <div
                style={{
                    maxWidth: "80rem",
                    marginLeft: "auto",
                    marginRight: "auto",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    paddingTop: "2rem",
                    paddingBottom: "2rem"
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "2rem"
                    }}
                >
                    <LeftPanel
                        tab={tab}
                        setTab={setTab}
                        items={items}
                        setItems={setItems}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        selectedItem={selectedItem}
                        bg={bg}
                        setBg={setBg}
                        showTextModal={showTextModal}
                        setShowTextModal={setShowTextModal}
                        showClipartModal={showClipartModal}
                        setShowClipartModal={setShowClipartModal}
                        showQRModal={showQRModal}
                        setShowQRModal={setShowQRModal}
                        tVal={tVal}
                        setTVal={setTVal}
                        tFont={tFont}
                        setTFont={setTFont}
                        tSize={tSize}
                        setTSize={setTSize}
                        tColor={tColor}
                        setTColor={setTColor}
                        fonts={fonts}
                        gallery={gallery}
                        addImage={addImage}
                        insertFromGallery={insertFromGallery}
                        clipArts={clipArts}
                        insertClipArt={insertClipArt}
                        isLoadingClipart={isLoadingClipart}
                        setIsLoadingClipart={setIsLoadingClipart}
                        setLoadedCount={setLoadedCount}
                        qrText={qrText}
                        setQRText={setQRText}
                        generateQRCode={generateQRCode}
                        addText={addText}
                        bringForward={bringForward}
                        sendBackward={sendBackward}
                        bringToFront={bringToFront}
                        typeLabel={typeLabel}
                    />

                    <CanvasPanel
                        bg={bg}
                        items={items}
                        canvasSize={canvasSize}
                        stageRef={stageRef}
                        trRef={trRef}
                        containerRef={containerRef}
                        onEmptyClick={onEmptyClick}
                        Node={Node}
                    />
                </div>

                <PreviewModal
                    showPreviewModal={showPreviewModal}
                    setShowPreviewModal={setShowPreviewModal}
                    previewStageRef={previewStageRef}
                    PreviewStage={PreviewStage}
                    customizationData={customizationData}
                    canvasSize={canvasSize}
                    items={items}
                    setSelectedMaterial={setSelectedMaterial}
                    setNotes={setNotes}
                />
            </div>
        </div>
    );
};

export default CustomizerUI;
