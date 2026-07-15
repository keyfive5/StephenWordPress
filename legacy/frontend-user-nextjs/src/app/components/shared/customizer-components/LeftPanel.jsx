import BackgroundControls from "./BackgroundControls";
import ClipArtControls from "./ClipArtControls";
import ImageControls from "./ImageControls";
import LayersPanel from "./LayersPanel";
import QRControls from "./QRControls";
import SelectedItemControls from "./SelectedItemControls";
import TabNavigation from "./TabNavigation";
import TextControls from "./TextControls";

const styles = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
    },
    panel: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        borderRadius: "1rem",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        padding: "1.5rem",
    },
};

const LeftPanel = (props) => {
    const {
        tab,
        setTab,
        showTextModal,
        setShowTextModal,
        tVal,
        setTVal,
        tFont,
        setTFont,
        tSize,
        setTSize,
        tColor,
        setTColor,
        fonts,
        addText,
        gallery,
        addImage,
        insertFromGallery,
        showClipartModal,
        setShowClipartModal,
        clipArts,
        insertClipArt,
        isLoadingClipart,
        setIsLoadingClipart,
        setLoadedCount,
        bg,
        setBg,
        showQRModal,
        setShowQRModal,
        qrText,
        setQRText,
        generateQRCode,
        items,
        selectedId,
        setSelectedId,
        bringForward,
        sendBackward,
        typeLabel,
        selectedItem,
        bringToFront,
        setItems,
    } = props;

    return (
        <div style={styles.wrapper}>
            <TabNavigation tab={tab} setTab={setTab} />

            <div style={styles.panel}>
                {tab === "text" && (
                    <TextControls
                        showTextModal={showTextModal}
                        setShowTextModal={setShowTextModal}
                        tVal={tVal}
                        setTVal={setTVal}
                        tFont={tFont}
                        setTFont={setTFont}
                        tSize={tSize}
                        setTSize={setTSize}
                        tColor={tColor}
                        setTColor={setTColor}
                        fonts={fonts}
                        addText={addText}
                    />
                )}

                {tab === "images" && (
                    <ImageControls
                        gallery={gallery}
                        addImage={addImage}
                        insertFromGallery={insertFromGallery}
                    />
                )}

                {tab === "clipart" && (
                    <ClipArtControls
                        showClipartModal={showClipartModal}
                        setShowClipartModal={setShowClipartModal}
                        clipArts={clipArts}
                        insertClipArt={insertClipArt}
                        isLoadingClipart={isLoadingClipart}
                        setIsLoadingClipart={setIsLoadingClipart}
                        setLoadedCount={setLoadedCount}
                    />
                )}

                {tab === "background" && <BackgroundControls bg={bg} setBg={setBg} />}

                {tab === "qr" && (
                    <QRControls
                        showQRModal={showQRModal}
                        setShowQRModal={setShowQRModal}
                        qrText={qrText}
                        setQRText={setQRText}
                        generateQRCode={generateQRCode}
                    />
                )}

                {tab === "layers" && (
                    <LayersPanel
                        items={items}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        bringForward={bringForward}
                        sendBackward={sendBackward}
                        typeLabel={typeLabel}
                    />
                )}

                <SelectedItemControls
                    selectedItem={selectedItem}
                    bringToFront={bringToFront}
                    setItems={setItems}
                    setSelectedId={setSelectedId}
                />
            </div>
        </div>
    );
};

export default LeftPanel;
