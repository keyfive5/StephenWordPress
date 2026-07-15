// app/customize/page.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage, Layer, Group, Rect, Text as KText, TextPath, Image as KImage,
  Transformer
} from "react-konva";
import PostAPI from "./PostAPI";
import Head from 'next/head'

import { writePsd } from 'ag-psd';
import CustomizerUI from './CustomizerUI.jsx'

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export default function Editor() {
  // ==================== STATE ====================
  const [customizationData, setCustomizationData] = useState(null);

  // Refs
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const previewStageRef = useRef(null);
  const previewsRef = useRef([]);

  // UI State
  const [showTextModal, setShowTextModal] = useState(false);
  const [showClipartModal, setShowClipartModal] = useState(false);
  const [isLoadingClipart, setIsLoadingClipart] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrText, setQRText] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState("text");
  const [bg, setBg] = useState("#ffffff");
  const [gallery, setGallery] = useState([]);

  // Canvas items
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const selectedItem = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);
  const [fontsUsed, setFontsUsed] = useState([]);

  // 🔥 DIRECT FROM JSON - These will be set from the passed data
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [designPosition, setDesignPosition] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0
  });

  // Product image - FULL SIZE
  const [productImage, setProductImage] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [fullImageDimensions, setFullImageDimensions] = useState({ width: 0, height: 0 });

  // ==================== LOAD DATA ====================
  useEffect(() => {
    const storedData = sessionStorage.getItem('customizeProductData');
    if (true) {
      try {
        const parsedData = JSON.parse('{"id":"69eca265b58b6db42477e46c","categoryId":"6975ffc8945e91e057003ef8","subCategoryId":"69eca1c4b84c16139e0a63a1","image":"https://res.cloudinary.com/proxmaircloud/image/upload/v1777115749/products/bbrroj8wxbfnwbfzhqi3.png","templateName":"Test","pricing":{"unitPrice":1,"totalPrice":100,"currency":"USD"},"templateDragSize":{"xCordination":50,"yCordination":50,"width":150,"height":150},"originalSize":{"originalwidthOfImage":600,"originalHeightOfImage":240},"variant":{"material":"Gloss","size":"2x2","shape":"Circle","quality":100,"price":"100"},"timestamp":"2026-05-01T18:12:26.384Z"}');
        setCustomizationData(parsedData);
        console.log('✅ Loaded customization data:', parsedData);
      } catch (error) {
        console.error('Failed to parse customization data:', error);
      }
    }
  }, []);

  // ==================== APPLY DATA DIRECTLY FROM JSON ====================
  useEffect(() => {
    if (customizationData) {
      // const { templateDragSize, imageSize, product } = customizationData;
      console.log('customizationData ee', customizationData)

      setProductInfo(customizationData);

      // 🔥 1. Set rendered image size (what user saw when dragging)
      if (customizationData) {
        setRenderedSize({
          width: customizationData.originalSize.originalwidthOfImage,
          height: customizationData.originalSize.originalHeightOfImage
        });
      }

      // 🔥 2. Set canvas size and position DIRECTLY from templateDragSize
      if (customizationData.templateDragSize) {
        const dragSize = customizationData.templateDragSize;
        setCanvasSize({
          w: dragSize.width,
          h: dragSize.height
        });

        setDesignPosition({
          x: dragSize.xCordination,
          y: dragSize.yCordination,
          scaleX: 1,
          scaleY: 1,
          // rotation: dragSize.rotate || 0
        });

        console.log('🎨 Canvas set to:', { w: dragSize.width, h: dragSize.height });
        console.log('📍 Position set to:', { x: dragSize.xCordination, y: dragSize.yCordination });
      }

      // 🔥 3. Load the FULL SIZE product image
      if (customizationData?.image) {
        console.log('🖼️ Loading full-size image from:', customizationData.image);

        const img = new window.Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          console.log('✅ Full-size image loaded:', {
            width: img.width,
            height: img.height
          });

          setProductImage(img);
          setFullImageDimensions({
            width: img.width,
            height: img.height
          });
        };

        img.onerror = (error) => {
          console.error('❌ Failed to load image:', error);
          // Fallback to default
          const fallbackImg = new window.Image();
          fallbackImg.src = '/images/Facebook.png';
          fallbackImg.onload = () => {
            setProductImage(fallbackImg);
            setFullImageDimensions({
              width: fallbackImg.width,
              height: fallbackImg.height
            });
          };
        };

        img.src = customizationData.image;
      }
    }
  }, [customizationData]);

  console.log('designPosition', designPosition)
  console.log('canvasSize', canvasSize)
  console.log('renderedSize', renderedSize)



  // ==================== FONTS ====================
  const fonts = [
    "Inter", "Montserrat", "Playfair Display", "Roboto", "Poppins", "Open Sans",
    "Copper Black", "Broadway", "Source Serif", "Bauhaus93", "Forte", "Ravie", "Sarina",
    "Script MT Bold", "Segoe Script Bold", "Wide Latin", "Perpetua Titling MT Bold", "Elephant Italic",
    "Acumin Pro Bold", "ImaginaryFriendBB", "Ultra Regular", "Raleway",
    "Source Sans Pro", "Nunito", "Rubik", "Work Sans", "Fira Sans", "Manrope", "Jost",
    "Urbanist", "Plus Jakarta Sans", "Merriweather", "Lora", "Crimson Text",
    "Libre Baskerville", "Bitter", "DM Serif Display", "Vollkorn", "Space Grotesk", "Syne",
    "Archivo", "Chivo", "Sora", "Be Vietnam Pro", "Abril Fatface", "Alfa Slab One",
    "Bebas Neue", "Black Ops One", "Bodoni Moda", "Cinzel", "Comfortaa", "Dancing Script",
    "Great Vibes", "Kaushan Script", "Lilita One", "Lobster", "Orbitron", "Permanent Marker",
    "Press Start 2P", "Shadows Into Light", "Titan One", "Yellowtail"
  ];

  const typeLabel = {
    "text": "Text",
    "curvedText": "Curved-text",
    "image": "Image",
    "clipart": "Clip-art",
  };

  // ==================== CLIP ART ====================
  const [clipArts] = useState([
    "Wine-Bottle-&-Glass-01-min.png",
    "Taco Person-min.png",
    "Beer-01-min.png",
    "Burger-01-min.png",
    "Burrito-01-min.png",
    "Chicken Wing-01-min.png",
    "Cocktail 2-01-min.png",
    "Cocktail-01-min.png",
    "Fish Cook-min.png",
    "Fresh Ingredients-min.png",
    "Fries-01-min.png",
    "Grilled Cheese-01-min.png",
    "Happy Face 1-01-min.png",
    "Happy Face 2-01-min.png",
    "Heart-01-min.png",
    "Hot Dog Person-01-min.png",
    "Hot Dog-01-min.png",
    "Money-01-min.png",
    "Pizza Slice-01-min.png",
    "Pizza-01-min.png",
    "Popcorn-01-min.png",
    "Slushy-01-min.png",
    "Special Offer-01-min.png",
    "Star-min.png",
    "Taco-min.png",
    "Wine Glass-01-min.png",
    "Wine Pour-01-min.png",
    "X-01-min.png",
    "Facebook-01-min.png",
    "TikTok-01-min.png",
    "Instagram-01-min.png",
  ]);

  // ==================== TEXT CONTROLS ====================
  const [tVal, setTVal] = useState("");
  const [tColor, setTColor] = useState("#1e293b");
  const [tFont, setTFont] = useState(fonts[0]);
  const [tSize, setTSize] = useState(32);
  const [tStyle, setTStyle] = useState("normal");

  // ==================== POST API ====================
  const { isPosting, postToAPI } = PostAPI({
    previewStageRef,
    localData: customizationData,
    fontsUsed,
    finalDimensions: `${fullImageDimensions.width} x ${fullImageDimensions.height}`,
    onPostSuccess: (result) => {
      alert('Successfully added to cart!');
      console.log('Post successful:', result);
    },
    onPostError: (error) => {
      alert('Failed to add to cart: ' + error);
      console.error('Post error:', error);
    }
  });

  // ==================== FUNCTIONS ====================
  const generatePreview = () => {
    if (items.length > 0) {
      const uniqueFonts = [
        ...new Set(
          items
            .map(i => i.fontFamily)
            .filter(f => typeof f === "string" && f.trim() !== "")
        ),
      ];
      setFontsUsed(uniqueFonts);
    } else {
      setFontsUsed([]);
    }
    setShowPreviewModal(true);
  };

  const generatePreviewURL = (mime = "image/png") => {
    if (!previewStageRef.current) {
      console.error('Preview stage not found');
      return null;
    }
    try {
      return previewStageRef.current.toDataURL({
        mimeType: mime,
        pixelRatio: 1
      });
    } catch (error) {
      console.error('URL generation failed:', error);
      return null;
    }
  };

  const handlePostClick = async () => {
    try {
      const uri = await generatePreviewURL("image/png");
      if (!uri) return;
      await postToAPI(uri);
    } catch (err) {
      console.error("Error in handlePostClick:", err);
    }
  };

  // Replace the PostAPI import and usage with this:

  // Remove this line:
  // import PostAPI from "./PostAPI";

  // Add this new function to handle checkout/download
  const handleCheckout = async () => {
    try {
      // Generate a flattened preview
      const flattenedURI = await generatePreviewURL("image/png");

      // Create a ZIP file with all layers
      await downloadAsLayeredZip(flattenedURI);

    } catch (err) {
      console.error("Error in handleCheckout:", err);
      alert('Failed to generate layered file');
    }
  };

  // Replace the downloadAsLayeredZip function with this fixed version:

  const downloadAsLayeredZip = async (flattenedURI) => {
    // Create a new JSZip instance
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // 1. Add the base product image (full size)
    if (productImage) {
      try {
        const baseImageData = await fetch(productImage.src)
          .then(res => res.blob())
          .catch(() => null);
        if (baseImageData) {
          zip.file("01_Base_Image.png", baseImageData);
        }
      } catch (error) {
        console.error('Failed to fetch base image:', error);
      }
    }

    // 2. Add each design element as a separate layer using HTML Canvas (not Konva)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Create a temporary canvas
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.w;
      canvas.height = canvasSize.h;
      const ctx = canvas.getContext('2d');

      // Clear canvas with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the item based on its type
      if (item.type === "text") {
        ctx.save();
        ctx.font = `${item.fontSize}px "${item.fontFamily}"`;
        ctx.fillStyle = item.fill || '#000000';
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation || 0) * Math.PI / 180);
        ctx.scale(item.scaleX || 1, item.scaleY || 1);
        ctx.fillText(item.text, 0, 0);
        ctx.restore();
      } else if (item.type === "image" && item.image) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation || 0) * Math.PI / 180);
        ctx.drawImage(item.image, 0, 0, item.width, item.height);
        ctx.restore();
      }

      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (blob) {
        // Create descriptive filename
        const layerName = `${String(i + 2).padStart(2, '0')}_${item.type}_${item.layeringtype || ''}_${i}.png`
          .replace(/\s+/g, '_')
          .toLowerCase();
        zip.file(layerName, blob);
      }

      // Cleanup
      canvas.remove();
    }

    // 3. Add a flattened preview
    try {
      const flattenedBlob = await (await fetch(flattenedURI)).blob();
      zip.file("00_Flattened_Preview.png", flattenedBlob);
    } catch (error) {
      console.error('Failed to add flattened preview:', error);
    }

    // 4. Add metadata file
    const metadata = {
      canvasSize,
      designPosition,
      createdAt: new Date().toISOString(),
      items: items.map(item => ({
        id: item.id,
        type: item.type,
        layeringtype: item.layeringtype,
        x: item.x,
        y: item.y,
        rotation: item.rotation,
        ...(item.type === 'text' ? {
          text: item.text,
          fontFamily: item.fontFamily,
          fontSize: item.fontSize,
          color: item.fill,
          scaleX: item.scaleX,
          scaleY: item.scaleY
        } : {
          width: item.width,
          height: item.height
        })
      }))
    };
    zip.file("metadata.json", JSON.stringify(metadata, null, 2));

    // 5. Add instructions
    const instructions = `LAYERED DESIGN INSTRUCTIONS
============================

This ZIP file contains separate PNG files for each element in your design.

📁 FILE NAMING CONVENTION:
- 00_Flattened_Preview.png - Complete design preview
- 01_Base_Image.png - Background product image
- 02_text_...png - Text layers
- 03_image_...png - Image/clip art layers

🖥️ HOW TO USE IN PHOTOSHOP:
1. Create a new document: ${canvasSize.w} x ${canvasSize.h}px
2. Go to File → Scripts → Load Files into Stack
3. Select all PNG files from this folder
4. Click OK - each file becomes a separate layer
5. Arrange layers in order (01 at bottom)
6. Set blend modes as needed

📝 NOTES:
- All layers are PNG with transparency
- Layers are named in order (lower numbers = bottom layers)
- Metadata.json contains exact positioning data

Generated: ${new Date().toLocaleString()}
`;
    zip.file("INSTRUCTIONS.txt", instructions);

    // Generate and download ZIP
    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design_layers_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('✅ Layered design downloaded! Check your downloads folder.\n\nThe ZIP contains separate PNG files for each layer that you can import into Photoshop.');
  };

  // ==================== SAVE DESIGN JSON FUNCTION (WITH MAIN IMAGE) ====================
  const saveDesignJSON = async () => {
    try {
      // For images, we'll store URLs instead of base64 data
      const layersWithAssets = items.map((item) => {
        const baseLayer = {
          id: item.id,
          type: item.type,
          name: item.layeringtype || item.type,
          position: {
            x: item.x,
            y: item.y,
            rotation: item.rotation || 0,
            scaleX: item.scaleX || 1,
            scaleY: item.scaleY || 1
          },
          visible: true,
          locked: false,
          opacity: 100
        };

        if (item.type === 'text') {
          return {
            ...baseLayer,
            content: {
              text: item.text,
              fontFamily: item.fontFamily,
              fontSize: item.fontSize,
              color: item.fill,
              stroke: item.stroke || null,
              strokeWidth: item.strokeWidth || 0,
              shadow: item.shadowColor ? {
                color: item.shadowColor,
                blur: item.shadowBlur,
                offsetX: item.shadowOffsetX,
                offsetY: item.shadowOffsetY
              } : null
            }
          };
        } else if (item.type === 'image' && item.image) {
          return {
            ...baseLayer,
            type: item.layeringtype === 'Clip-art' ? 'clipart' : 'image',
            content: {
              imageUrl: item.image.src,
              width: item.width,
              height: item.height,
              originalWidth: item.image.width,
              originalHeight: item.image.height,
              alt: item.layeringtype || 'Image'
            }
          };
        }
        return baseLayer;
      });

      // 🔥 IMPORTANT: Get the main product image URL from customizationData
      const mainImageUrl = customizationData?.image || null;

      // Get the design area coordinates from templateDragSize
      const designArea = customizationData?.templateDragSize || {
        xCordination: designPosition.x,
        yCordination: designPosition.y,
        width: canvasSize.w,
        height: canvasSize.h,
        rotate: designPosition.rotation
      };

      // Complete design data structure for API
      const designData = {
        id: `design_${Date.now()}`,
        name: "Untitled Design",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // 🔥 Main product image (the background)
        mainImage: mainImageUrl ? {
          url: mainImageUrl,
          width: fullImageDimensions.width || productImage?.width,
          height: fullImageDimensions.height || productImage?.height,
          thumbnailUrl: mainImageUrl // You can generate a thumbnail URL
        } : null,

        // 🔥 Design area coordinates (where the editable area is on the main image)
        designArea: {
          x: designArea.xCordination || designPosition.x,
          y: designArea.yCordination || designPosition.y,
          width: designArea.width || canvasSize.w,
          height: designArea.height || canvasSize.h,
          rotation: designArea.rotate || designPosition.rotation,

          // Also include the rendered size info for scaling
          renderedSize: {
            width: renderedSize.width,
            height: renderedSize.height
          }
        },

        // Canvas size for the editable area
        canvasSize: {
          width: canvasSize.w,
          height: canvasSize.h
        },

        backgroundColor: bg,

        // All the design elements (text, cliparts, etc.)
        layers: layersWithAssets,

        metadata: {
          templateId: customizationData?.templateId || null,
          productId: customizationData?.id || null,
          templateDragSize: customizationData?.templateDragSize,
          renderedSize: renderedSize,
          fullImageDimensions: fullImageDimensions,
          version: '1.0.0',
          exportDate: new Date().toISOString()
        },

        stats: {
          totalLayers: items.length,
          textLayers: items.filter(i => i.type === 'text').length,
          imageLayers: items.filter(i => i.type === 'image').length
        }
      };

      // Log the complete JSON
      console.log('📦 COMPLETE DESIGN JSON FOR API:');
      console.log(JSON.stringify(designData, null, 2));

      const jsonString = JSON.stringify(designData);
      const sizeInKB = (jsonString.length / 1024).toFixed(2);
      console.log(`📊 JSON Size: ${sizeInKB} KB`);

      // Create downloadable JSON file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `design_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`✅ Design JSON saved!\n\nFile size: ${sizeInKB} KB\n\nIncludes main image and design area coordinates.`);

    } catch (error) {
      console.error('❌ Error saving JSON:', error);
      alert('Failed to save JSON: ' + error.message);
    }
  };

  // for psd file
  //..........................///
  //.................//
  const downloadAsPSD = async () => {
    try {
      // Create PSD structure
      const psd = {
        width: canvasSize.w,
        height: canvasSize.h,
        children: [],
        // Set color mode to RGB
        colorMode: 3, // 3 = RGB
      };

      // Helper function to convert canvas/image to ImageData
      const getImageDataFromCanvas = (canvas) => {
        const ctx = canvas.getContext('2d');
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      };

      // 1. Add base product image layer (bottom)
      if (productImage) {
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize.w;
        canvas.height = canvasSize.h;
        const ctx = canvas.getContext('2d');

        // Draw base image scaled to canvas size
        ctx.drawImage(productImage, 0, 0, canvasSize.w, canvasSize.h);

        psd.children.push({
          name: 'Base Image',
          imageData: getImageDataFromCanvas(canvas),
          opacity: 255,
          visible: true,
          blendMode: 'normal',
          left: 0,
          top: 0,
          right: canvasSize.w,
          bottom: canvasSize.h,
        });
      }

      // 2. Add each design element as a separate layer
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Create canvas for this layer
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize.w;
        canvas.height = canvasSize.h;
        const ctx = canvas.getContext('2d');

        // Clear with transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the item
        if (item.type === "text") {
          ctx.save();
          ctx.font = `${item.fontSize}px "${item.fontFamily}"`;
          ctx.fillStyle = item.fill || '#000000';
          ctx.translate(item.x, item.y);
          ctx.rotate((item.rotation || 0) * Math.PI / 180);
          ctx.scale(item.scaleX || 1, item.scaleY || 1);
          ctx.fillText(item.text, 0, 0);
          ctx.restore();
        } else if (item.type === "image" && item.image) {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate((item.rotation || 0) * Math.PI / 180);
          ctx.drawImage(item.image, 0, 0, item.width, item.height);
          ctx.restore();
        }

        // Create layer name
        const layerName = `${i + 2}_${item.type}_${item.layeringtype || ''}`
          .replace(/\s+/g, '_');

        psd.children.push({
          name: layerName,
          imageData: getImageDataFromCanvas(canvas),
          opacity: 255,
          visible: true,
          blendMode: 'normal',
          left: 0,
          top: 0,
          right: canvasSize.w,
          bottom: canvasSize.h,
        });
      }

      // Write PSD file
      const arrayBuffer = writePsd(psd);
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `design_${Date.now()}.psd`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('✅ PSD file downloaded! It contains all layers and can be opened in Photoshop.');

    } catch (error) {
      console.error('Error creating PSD:', error);
      alert('Failed to create PSD file: ' + error.message);
    }
  };

  const generateQRCode = async (text) => {
    if (!text.trim()) return;
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = qrUrl;
      });
      const id = uid();
      const w = Math.min(100, canvasSize.w * 0.2);
      const h = w;
      setItems(p => [...p, {
        id,
        layeringtype: 'QR code',
        type: "image",
        x: canvasSize.w / 2 - w / 2,
        y: canvasSize.h / 2 - h / 2,
        image: img,
        width: w,
        height: h,
        rotation: 0
      }]);
      setSelectedId(id);
      setShowQRModal(false);
      setQRText("");
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const insertClipArt = async (filename) => {
    const img = new window.Image();
    img.src = `/new-clip-art/${filename}`;
    img.onload = () => {
      const id = uid();
      const ratio = img.width / img.height;
      const w = Math.min(img.width, canvasSize.w * 0.15);
      const h = w / ratio;
      setItems(p => [...p, {
        id,
        type: "image",
        layeringtype: 'Clip-art',
        x: canvasSize.w / 2 - w / 2,
        y: canvasSize.h / 2 - h / 2,
        image: img,
        width: w,
        height: h,
        rotation: 0
      }]);
      setSelectedId(id);
    };
  };

  const addImage = async (files) => {
    if (!files) return;
    let fileArr;
    if (files instanceof FileList) fileArr = Array.from(files);
    else if (Array.isArray(files)) fileArr = files;
    else fileArr = [files];
    const newGallery = [];
    const newCanvasItems = [];
    let lastId = null;
    for (const file of fileArr) {
      if (!file || !(file instanceof Blob)) continue;
      const preview = URL.createObjectURL(file);
      previewsRef.current.push(preview);
      newGallery.push({ file, preview });
      const img = await loadImageFromFile(file);
      const id = uid();
      lastId = id;
      const ratio = img.width / img.height;
      const w = Math.min(img.width, canvasSize.w * 0.15);
      const h = w / ratio;
      newCanvasItems.push({
        id,
        layeringtype: 'Image',
        type: "image",
        x: canvasSize.w / 2 - w / 2,
        y: canvasSize.h / 2 - h / 2,
        image: img,
        width: w,
        height: h,
        rotation: 0
      });
    }
    if (newCanvasItems.length) setItems(p => [...p, ...newCanvasItems]);
    if (newGallery.length) setGallery(p => [...p, ...newGallery]);
    if (lastId) setSelectedId(lastId);
  };

  const insertFromGallery = async (galleryEntry) => {
    const file = galleryEntry.file;
    if (!file) return;
    const img = await loadImageFromFile(file);
    const id = uid();
    const ratio = img.width / img.height;
    const w = Math.min(img.width, canvasSize.w * 0.15);
    const h = w / ratio;
    setItems(p => [...p, {
      id,
      type: "image",
      layeringtype: "image",
      x: canvasSize.w / 2 - w / 2,
      y: canvasSize.h / 2 - h / 2,
      image: img,
      width: w,
      height: h,
      rotation: 0
    }]);
    setSelectedId(id);
  };

  const addText = () => {
    if (!tVal.trim()) return;
    const id = uid();
    if (tStyle === "curved") {
      const cx = canvasSize.w / 2, cy = canvasSize.h / 2, R = 120;
      const path = `M ${cx - R},${cy} A ${R},${R} 0 0 1 ${cx + R},${cy}`;
      setItems(p => [...p, {
        id, type: "curvedText", path, text: tVal,
        fontFamily: tFont, fontSize: tSize, fill: tColor,
        rotation: 0, x: 0, y: 0
      }]);
      setSelectedId(id);
      return;
    }
    const base = {
      id, type: "text", x: canvasSize.w / 2 - 60, y: canvasSize.h / 2 - 24,
      text: tVal, fontFamily: tFont, fontSize: tSize, rotation: 0,
      fill: tStyle === "gradient" ? undefined : tColor,
      scaleX: 1,
      scaleY: 1,
      stroke: tStyle === "outline" ? tColor : undefined,
      strokeWidth: tStyle === "outline" ? 2 : 0,
      shadowColor: tStyle === "shadow" ? "rgba(0,0,0,0.35)" : undefined,
      shadowBlur: tStyle === "shadow" ? 8 : 0,
      shadowOffsetX: tStyle === "shadow" ? 3 : 0,
      shadowOffsetY: tStyle === "shadow" ? 3 : 0,
    };
    setItems(p => [...p, base]);
    setSelectedId(id);
  };

  const updateItem = (id, patch) =>
    setItems(p => p.map(it => (it.id === id ? { ...it, ...patch } : it)));

  const bringToFront = (id) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      const clone = prev.slice();
      const [hit] = clone.splice(idx, 1);
      clone.push(hit);
      return clone;
    });
  };

  const bringForward = (id) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const clone = prev.slice();
      const [item] = clone.splice(idx, 1);
      clone.splice(idx + 1, 0, item);
      return clone;
    });
  };

  const sendBackward = (id) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx <= 0) return prev;
      const clone = prev.slice();
      const [item] = clone.splice(idx, 1);
      clone.splice(idx - 1, 0, item);
      return clone;
    });
  };

  const onEmptyClick = (e) => {
    if (e.target === e.target.getStage()) setSelectedId(null);
  };

  // Keyboard delete
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        setItems(p => p.filter(it => it.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  // Transformer
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    if (!selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = stage.findOne(`.${selectedId}`);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, items]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewsRef.current.forEach(u => {
        try { URL.revokeObjectURL(u); } catch (e) { }
      });
    };
  }, []);

  // ==================== DRAG HANDLERS ====================
  const commonDrag = (item) => ({
    name: item.id,
    draggable: true,
    x: item.x,
    y: item.y,
    rotation: item.rotation || 0,
    scaleX: item.scaleX || 1,
    scaleY: item.scaleY || 1,
    onClick: () => setSelectedId(item.id),
    onTap: () => setSelectedId(item.id),
    onDblClick: () => { bringToFront(item.id); setSelectedId(item.id); },
    onDragMove: (e) => { },
    onDragEnd: (e) => {
      const node = e.target;
      updateItem(item.id, {
        x: node.x(),
        y: node.y()
      });
    },
    onTransformEnd: (e) => {
      const n = e.target;
      const sx = n.scaleX();
      const sy = n.scaleY();
      const r = n.rotation();
      const absPos = n.getAbsolutePosition();
      n.scaleX(1);
      n.scaleY(1);
      n.setAbsolutePosition(absPos);
      if (item.type === "text") {
        updateItem(item.id, {
          scaleX: sx,
          scaleY: sy,
          rotation: r,
          x: n.x(),
          y: n.y()
        });
      } else if (item.type === "image") {
        updateItem(item.id, {
          width: Math.max(5, item.width * sx),
          height: Math.max(5, item.height * sy),
          rotation: r,
          x: n.x(),
          y: n.y()
        });
      }
    }
  });

  // ==================== NODE COMPONENT ====================
  const Node = ({ item }) => {
    switch (item.type) {
      case "text":
        return (
          <Group>
            <KText
              {...commonDrag(item)}
              text={item.text}
              fontFamily={item.fontFamily}
              fontSize={item.fontSize}
              fill={item.fill}
              stroke={item.stroke}
              strokeWidth={item.strokeWidth || 0}
              shadowColor={item.shadowColor}
              shadowBlur={item.shadowBlur}
              shadowOffsetX={item.shadowOffsetX}
              shadowOffsetY={item.shadowOffsetY}
              scaleX={item.scaleX || 1}
              scaleY={item.scaleY || 1}
            />
          </Group>
        );
      case "image":
        return (
          <Group>
            <KImage
              {...commonDrag(item)}
              image={item.image}
              width={item.width}
              height={item.height}
            />
          </Group>
        );
      default:
        return null;
    }
  };

  // ==================== PREVIEW STAGE ====================
  const PreviewStage = () => {
    const designGroupRef = useRef(null);
    const clipGroupRef = useRef(null);
    const previewContainerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 600, height: 400 });

    useEffect(() => {
      const measureContainer = () => {
        if (previewContainerRef.current) {
          const { width, height } = previewContainerRef.current.getBoundingClientRect();
          setContainerSize({ width: width - 40, height: height - 40 });
        }
      };
      measureContainer();
      window.addEventListener('resize', measureContainer);
      return () => window.removeEventListener('resize', measureContainer);
    }, []);

    if (!productImage) {
      return (
        <div ref={previewContainerRef} className="w-full min-h-[300px] flex items-center justify-center border border-gray-200 bg-gray-50 rounded-lg">
          <div className="text-gray-500">Loading product image...</div>
        </div>
      );
    }

    // 🔥 USE DIRECT VALUES FROM JSON - NO CALCULATIONS NEEDED

    // 1. Rendered size - what the user designed on (491x300)
    const renderedW = renderedSize.width;
    const renderedH = renderedSize.height;

    // 2. Canvas size - the editable area dimensions (328x150)
    const canvasW = canvasSize.w;
    const canvasH = canvasSize.h;

    // 3. Design position - where the editable area is placed (157,129)
    const posX = designPosition.x;
    const posY = designPosition.y;

    // 4. Full image dimensions - the actual high-res image
    const fullW = fullImageDimensions.width || productImage.width;
    const fullH = fullImageDimensions.height || productImage.height;

    // 5. Calculate scale from rendered size to full size
    const scaleRenderedToFull = fullW / renderedW;

    // 6. Calculate ACTUAL position on full-size image
    const actualX = posX * scaleRenderedToFull;
    const actualY = posY * scaleRenderedToFull;
    const actualWidth = canvasW * scaleRenderedToFull;
    const actualHeight = canvasH * scaleRenderedToFull;

    // 7. Calculate display size (fit in container)
    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect = fullW / fullH;

    let displayWidth, displayHeight;
    if (imageAspect > containerAspect) {
      displayWidth = containerSize.width;
      displayHeight = displayWidth / imageAspect;
    } else {
      displayHeight = containerSize.height;
      displayWidth = displayHeight * imageAspect;
    }

    // 8. Scale from full size to display size
    const scaleFullToDisplay = displayWidth / fullW;

    // 9. FINAL display coordinates
    const displayX = actualX * scaleFullToDisplay;
    const displayY = actualY * scaleFullToDisplay;
    const displayW = actualWidth * scaleFullToDisplay;
    const displayH = actualHeight * scaleFullToDisplay;

    // 10. Scale factor for design elements
    const designScaleFactor = displayW / canvasW;

    return (
      <div
        ref={previewContainerRef}
        className="w-full h-full flex justify-center items-center "
      >
        <Stage
          ref={previewStageRef}
          width={displayWidth}
          height={displayHeight}
          className="max-w-full h-auto shadow-2xl rounded-lg ring-1 ring-black/5"
        >
          <Layer>
            {/* FULL SIZE image scaled to fit display */}
            <KImage
              image={productImage}
              width={displayWidth}
              height={displayHeight}
            />

            {/* Semi-transparent overlay - more subtle */}
            <Rect
              x={0}
              y={0}
              width={displayWidth}
              height={displayHeight}
              fill="rgba(0,0,0,0.2)"
            />

            {/* Clear editable area */}
            <Group
              clipFunc={(ctx) => {
                ctx.rect(displayX, displayY, displayW, displayH);
              }}
            >
              <Rect
                x={0}
                y={0}
                width={displayWidth}
                height={displayHeight}
                fill="rgba(0,0,0,0)"
              />
            </Group>

            {/* Editable area border - elegant dashed blue */}
            <Rect
              x={displayX}
              y={displayY}
              width={displayW}
              height={displayH}
              stroke="#3b82f6"
              strokeWidth={2.5}
              dash={[6, 4]}
              fill="rgba(59,130,246,0.02)"
              cornerRadius={2}
            />

            {/* Design Group - positioned at the editable area */}
            <Group
              ref={clipGroupRef}
              x={displayX}
              y={displayY}
              scaleX={1}
              scaleY={1}
              rotation={designPosition.rotation || 0}
              clipX={0}
              clipY={0}
              clipWidth={displayW}
              clipHeight={displayH}
            >
              <Group
                ref={designGroupRef}
                name="preview-design-group"
                draggable={false}
                scaleX={designScaleFactor}
                scaleY={designScaleFactor}
              >
                {/* Background */}
                <Rect
                  x={0}
                  y={0}
                  width={canvasW}
                  height={canvasH}
                  fill={bg}
                />

                {/* Design elements - using canvas coordinates */}
                {items.map((item) => {
                  switch (item.type) {
                    case "text":
                      return (
                        <KText
                          key={item.id}
                          x={item.x || 0}
                          y={item.y || 0}
                          rotation={item.rotation || 0}
                          text={item.text}
                          fontFamily={item.fontFamily}
                          fontSize={item.fontSize || 28}
                          fill={item.fill}
                          stroke={item.stroke}
                          strokeWidth={item.strokeWidth || 0}
                          scaleX={item.scaleX || 1}
                          scaleY={item.scaleY || 1}
                        />
                      );
                    case "image":
                      return (
                        <KImage
                          key={item.id}
                          x={item.x || 0}
                          y={item.y || 0}
                          rotation={item.rotation || 0}
                          image={item.image}
                          width={item.width || 50}
                          height={item.height || 50}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </Group>
            </Group>
          </Layer>
        </Stage>
      </div>
    );
  };

  // ==================== RENDER ====================
  if (!productImage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600/20 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-slate-600 font-medium">Loading your design canvas...</p>
          <p className="text-slate-400 text-sm mt-2">Preparing your product image</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/your-project-id.css"
        />
      </Head>

      <CustomizerUI
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
        showPreviewModal={showPreviewModal}
        setShowPreviewModal={setShowPreviewModal}

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
        loadedCount={loadedCount}
        setLoadedCount={setLoadedCount}

        qrText={qrText}
        setQRText={setQRText}
        generateQRCode={generateQRCode}

        canvasSize={canvasSize}

        stageRef={stageRef}
        trRef={trRef}
        containerRef={containerRef}
        previewStageRef={previewStageRef}

        addText={addText}
        generatePreview={generatePreview}

        bringForward={bringForward}
        sendBackward={sendBackward}
        bringToFront={bringToFront}

        onEmptyClick={onEmptyClick}

        typeLabel={typeLabel}

        customizationData={customizationData}

        Node={Node}
        PreviewStage={PreviewStage}
        setSelectedMaterial={setSelectedMaterial}
        setNotes={setNotes}
      />
    </>
  );
}


