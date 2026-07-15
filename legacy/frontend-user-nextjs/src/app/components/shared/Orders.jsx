'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Auth_URL, getAdminId } from '@/utils/api';
import { IconPencil } from '@tabler/icons-react';
import { initializeCanvas, readPsd, writePsd } from 'ag-psd';
import { formatMoney } from '@/utils/pricing';

let psdCanvasInitialized = false;

const ensurePsdCanvas = () => {
  if (psdCanvasInitialized || typeof document === 'undefined') {
    return;
  }

  initializeCanvas(
    (width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      return canvas;
    },
    (width, height) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      return context.createImageData(width, height);
    }
  );

  psdCanvasInitialized = true;
};

const getOrdersFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
};

const formatCurrency = (value, currency = 'USD') => {
  return formatMoney(value, currency);
};

const getOrderCurrency = (order = {}) =>
  order?.currency ||
  order?.misc?.pricing?.currency ||
  order?.pricing?.currency ||
  'USD';

const getOrderAmount = (order = {}, key) => {
  const directValue = order?.[key];
  if (directValue !== undefined && directValue !== null && directValue !== '') {
    return directValue;
  }

  const fallbackBasePrice =
    order?.basePrice ??
    order?.misc?.pricing?.basePrice ??
    order?.misc?.pricing?.USD ??
    order?.misc?.pricing?.CAD ??
    order?.misc?.pricing?.totalPrice ??
    order?.total ??
    null;

  if (key === 'unitPrice') {
    return fallbackBasePrice ?? 'N/A';
  }

  if (key === 'subtotal') {
    const quantity = Number(order?.quantity) || 1;
    return fallbackBasePrice !== null ? fallbackBasePrice * quantity : order?.total ?? 'N/A';
  }

  if (key === 'discount') {
    return order?.discount ?? 0;
  }

  return order?.total ?? fallbackBasePrice ?? 'N/A';
};

const getFullName = (customer = {}) => {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return name || 'N/A';
};

const formatPaymentMethod = (value) => {
  if (!value) return 'N/A';

  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getStatusColor = (status = '') => {
  const normalizedStatus = status.toLowerCase();

  if (['paid', 'completed', 'delivered', 'success'].includes(normalizedStatus)) {
    return 'success';
  }

  if (['pending', 'processing'].includes(normalizedStatus)) {
    return 'warning';
  }

  if (['failed', 'cancelled', 'canceled', 'refunded'].includes(normalizedStatus)) {
    return 'error';
  }

  return 'default';
};

const InfoRow = ({ label, value }) => (
  <Box>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={600}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

const flattenPsdLayers = (layers = [], output = [], parentName = '') => {
  layers.forEach((layer, index) => {
    const layerName = layer.name || `Layer ${index + 1}`;
    const displayName = parentName ? `${parentName} / ${layerName}` : layerName;
    const isVisible = !layer.hidden && layer.visible !== false;

    if (layer.canvas && isVisible) {
      output.push({
        name: displayName,
        preview: layer.canvas.toDataURL('image/png'),
        width: layer.canvas.width,
        height: layer.canvas.height,
        top: layer.top ?? 0,
        left: layer.left ?? 0,
        opacity: layer.opacity ?? 1,
      });
    }

    if (Array.isArray(layer.children) && layer.children.length > 0) {
      flattenPsdLayers(layer.children, output, displayName);
    }
  });

  return output;
};

const parsePsdFile = async (file) => {
  ensurePsdCanvas();

  const buffer = await file.arrayBuffer();
  const psd = readPsd(buffer);
  const previewCanvas = psd.canvas;

  if (!previewCanvas) {
    throw new Error('Unable to generate preview from PSD file');
  }

  const layers = flattenPsdLayers(psd.children || []);

  return {
    preview: previewCanvas.toDataURL('image/png'),
    layers,
    psdMeta: {
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      width: psd.width || previewCanvas.width,
      height: psd.height || previewCanvas.height,
    },
  };
};

const getPsdPreviewFrame = (selectedOrder) => {
  const layers = selectedOrder?.canvas_info?.psdLayers || [];
  const uploadedPsd = selectedOrder?.canvas_info?.uploadedPsd || {};

  const bounds = layers.reduce(
    (acc, layer) => {
      const left = Number(layer.left) || 0;
      const top = Number(layer.top) || 0;
      const width = Number(layer.width) || 0;
      const height = Number(layer.height) || 0;

      return {
        maxRight: Math.max(acc.maxRight, left + width),
        maxBottom: Math.max(acc.maxBottom, top + height),
      };
    },
    { maxRight: 0, maxBottom: 0 }
  );

  return {
    width: Number(uploadedPsd.width) || bounds.maxRight || 1500,
    height: Number(uploadedPsd.height) || bounds.maxBottom || 600,
  };
};

const getInitialPreviewFrame = (selectedOrder) => ({
  width:
    Number(selectedOrder?.canvas_info?.metadata?.fullImageDimensions?.width) ||
    Number(selectedOrder?.canvas_info?.mainImage?.width) ||
    1500,
  height:
    Number(selectedOrder?.canvas_info?.metadata?.fullImageDimensions?.height) ||
    Number(selectedOrder?.canvas_info?.mainImage?.height) ||
    600,
});

export default function Orders() {
  const adminId = getAdminId();
  const imageInputRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState('');
  const psdPreviewFrame = getPsdPreviewFrame(selectedOrder);
  const initialPreviewFrame = getInitialPreviewFrame(selectedOrder);
  const selectedCurrency = getOrderCurrency(selectedOrder?.order || {});
  const initialPreviewSrc =
    selectedOrder?.canvas_info?.thumbnail ||
    selectedOrder?.order?.thumbnail ||
    null;

  const fetchOrders = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const payload = {
        adminId,
        task: 'getAllOrders',
      }

      const response = await axios.post(`${Auth_URL}/api/order/get-all-orders`, payload);
      setOrders(getOrdersFromResponse(response.data));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      alert(error?.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  const [anchorEl, setAnchorEl] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  const statusOptions = ["pending", "shipped", "completed", "cancelled"];

  const handleEdit = (event, order) => {
    setAnchorEl(event.currentTarget);
    setActiveOrder(order);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveOrder(null);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setImageUploadLoading(false);
    setSelectedImageName('');

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const updateOrderProductLocally = (orderId, updates = {}) => {
    setOrders((prev) =>
      prev.map((item) =>
        item._id === orderId
          ? {
              ...item,
              order: {
                ...item.order,
                ...(updates.order || {}),
              },
              canvas_info: {
                ...(item.canvas_info || {}),
                ...(updates.canvas_info || {}),
              },
            }
          : item
      )
    );

    setSelectedOrder((prev) =>
      prev && prev._id === orderId
        ? {
            ...prev,
            order: {
              ...prev.order,
              ...(updates.order || {}),
            },
            canvas_info: {
              ...(prev.canvas_info || {}),
              ...(updates.canvas_info || {}),
            },
          }
        : prev
    );
  };

  const handleOrderImageUpload = async (event) => {
    const file = event.target.files?.[0];
    const orderId = selectedOrder?._id;

    if (!file || !selectedOrder) {
      return;
    }

    if (!orderId) {
      alert('Order ID not found for this order');
      event.target.value = '';
      return;
    }

    try {
      setImageUploadLoading(true);
      setSelectedImageName(file.name);

      const parsedPsd = await parsePsdFile(file);
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('psd', file);
      formData.append('preview', parsedPsd.preview);
      formData.append('layers', JSON.stringify(parsedPsd.layers));
      formData.append('psdMeta', JSON.stringify(parsedPsd.psdMeta));

      const response = await axios.post('/api/orders/update-thumbnail', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateOrderProductLocally(orderId, {
        order: {
          thumbnail:
            response?.data?.thumbnail ||
            response?.data?.order?.order?.thumbnail ||
            parsedPsd.preview,
        },
        canvas_info: {
          psdPreview: response?.data?.psdPreview || parsedPsd.preview,
          psdLayers: response?.data?.psdLayers || parsedPsd.layers,
          uploadedPsd: response?.data?.uploadedPsd || null,
        },
      });
      setSelectedImageName('');

      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to update order product image:', error);
      alert(error?.response?.data?.message || 'Failed to update image');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleOpenImagePicker = () => {
    if (imageUploadLoading) {
      return;
    }

    imageInputRef.current?.click();
  };

  const handleEditOrderStatus = async (newStatus) => {
    if (!activeOrder || newStatus === activeOrder.status) {
      handleCloseMenu();
      return;
    }

    try {
      setStatusChangeLoading(true);
      const payload = {
        adminId,
        orderId: activeOrder._id,
        newStatus,
        task: 'updateOrderStatus',
      }
      await axios.post(`${Auth_URL}/api/order/get-all-orders`, payload);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === activeOrder._id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      handleCloseMenu();
      setStatusChangeLoading(false);
    }
  };

const downloadAsPSD = async (canvas_info) => {
  try {
    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const getImageDataFromCanvas = (canvas) => {
      const context = canvas.getContext('2d');
      return context.getImageData(0, 0, canvas.width, canvas.height);
    };

    const width =
      Number(canvas_info?.canvasSize?.width) ||
      Number(canvas_info?.designArea?.width) ||
      150;

    const height =
      Number(canvas_info?.canvasSize?.height) ||
      Number(canvas_info?.designArea?.height) ||
      150;

    const psd = {
      width,
      height,
      colorMode: 3,
      children: [],
    };

    if (canvas_info?.mainImage?.url) {
      const baseImage = await loadImage(canvas_info.mainImage.url);
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = width;
      baseCanvas.height = height;
      const baseContext = baseCanvas.getContext('2d');
      baseContext.drawImage(baseImage, 0, 0, width, height);

      psd.children.push({
        name: 'Base Image',
        imageData: getImageDataFromCanvas(baseCanvas),
        opacity: 255,
        visible: true,
        blendMode: 'normal',
        left: 0,
        top: 0,
        right: width,
        bottom: height,
      });
    }

    for (let index = 0; index < (canvas_info?.layers || []).length; index += 1) {
      const layer = canvas_info.layers[index];
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = width;
      layerCanvas.height = height;
      const layerContext = layerCanvas.getContext('2d');

      layerContext.clearRect(0, 0, width, height);

      const layerPosition = layer.position || {};
      const layerX = Number(layerPosition.x) || 0;
      const layerY = Number(layerPosition.y) || 0;
      const rotation = ((Number(layerPosition.rotation) || 0) * Math.PI) / 180;
      const layerScaleX = Number(layerPosition.scaleX) || 1;
      const layerScaleY = Number(layerPosition.scaleY) || 1;
      const opacity = Math.max(0, Math.min(255, Math.round(((Number(layer.opacity) || 100) / 100) * 255)));

      if (layer.type === 'text' && layer.content?.text) {
        const fontSize = Number(layer.content.fontSize) || 16;

        layerContext.save();
        layerContext.globalAlpha = opacity / 255;
        layerContext.translate(layerX, layerY);
        layerContext.rotate(rotation);
        layerContext.scale(layerScaleX, layerScaleY);
        layerContext.font = `${fontSize}px "${layer.content.fontFamily || 'Arial'}"`;
        layerContext.fillStyle = layer.content.color || '#000000';
        layerContext.textBaseline = 'top';

        if (layer.content.shadow?.color) {
          layerContext.shadowColor = layer.content.shadow.color;
          layerContext.shadowBlur = Number(layer.content.shadow.blur) || 0;
          layerContext.shadowOffsetX = Number(layer.content.shadow.offsetX) || 0;
          layerContext.shadowOffsetY = Number(layer.content.shadow.offsetY) || 0;
        }

        if (layer.content.stroke && Number(layer.content.strokeWidth) > 0) {
          layerContext.lineWidth = Number(layer.content.strokeWidth);
          layerContext.strokeStyle = layer.content.stroke;
          layerContext.strokeText(layer.content.text, 0, 0);
        }

        layerContext.fillText(layer.content.text, 0, 0);
        layerContext.restore();
      } else if ((layer.type === 'image' || layer.type === 'clipart') && layer.content?.imageUrl) {
        const image = await loadImage(layer.content.imageUrl);
        const layerWidth = Number(layer.content.width) || image.width;
        const layerHeight = Number(layer.content.height) || image.height;

        layerContext.save();
        layerContext.globalAlpha = opacity / 255;
        layerContext.translate(layerX, layerY);
        layerContext.rotate(rotation);
        layerContext.scale(layerScaleX, layerScaleY);
        layerContext.drawImage(image, 0, 0, layerWidth, layerHeight);
        layerContext.restore();
      } else {
        continue;
      }

      psd.children.push({
        name: layer.name || `${index + 1}_${layer.type || 'layer'}`,
        imageData: getImageDataFromCanvas(layerCanvas),
        opacity,
        visible: layer.visible !== false,
        blendMode: 'normal',
        left: 0,
        top: 0,
        right: width,
        bottom: height,
      });
    }

    if (!psd.children.length && canvas_info?.thumbnail) {
      const fallbackImage = await loadImage(canvas_info.thumbnail);
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = width;
      fallbackCanvas.height = height;
      const fallbackContext = fallbackCanvas.getContext('2d');
      fallbackContext.drawImage(fallbackImage, 0, 0, width, height);

      psd.children.push({
        name: 'Design',
        imageData: getImageDataFromCanvas(fallbackCanvas),
        opacity: 255,
        visible: true,
        blendMode: 'normal',
        left: 0,
        top: 0,
        right: width,
        bottom: height,
      });
    }

    const buffer = writePsd(psd);
    const blob = new Blob([buffer], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvas_info?.id || canvas_info?.name || 'design'}.psd`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('PSD exported successfully', {
      name: a.download,
      layers: psd.children.map((item) => item.name),
    });
  } catch (error) {
    console.error('PSD export failed:', error);
    alert(error?.message || 'PSD export failed');
  }
};

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Orders</Typography>
        <Button variant="outlined" onClick={() => fetchOrders(true)} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Tracking Number</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((item, index) => (
                <TableRow key={item._id || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.trackingNumber || 'N/A'}</TableCell>
                  <TableCell>{getFullName(item.customer)}</TableCell>
                  <TableCell>{item.customer?.email || 'N/A'}</TableCell>
                  <TableCell>{item.order?.name || 'N/A'}</TableCell>
                  <TableCell>{item.order?.quantity ?? 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(item.order?.total)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                     <Chip
                        label={item.status || "pending"}
                        size="small"
                        color={getStatusColor(item.status)}
                        variant="outlined"
                        disabled={statusChangeLoading}
                      />

                      <IconButton
                        size="small"
                        onClick={(e) => handleEdit(e, item)}
                      >
                        <IconPencil size={16} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatPaymentMethod(item.payment?.method)}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell align="center">
                     <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      
                    <Button variant="contained" size="small" onClick={() => setSelectedOrder(item)}>
                      View
                    </Button>
                    <Button variant="contained" size="small" onClick={() => downloadAsPSD(item.canvas_info)}>
                      Download as PSD
                    </Button>
                     </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {statusOptions.map((status) => (
          <MenuItem
            key={status}
            onClick={() => handleEditOrderStatus(status)}
            disabled={activeOrder?.status === status}
            sx={{
              textTransform: "capitalize",
            }}
          >
            <Chip
              label={status || "pending"}
              size="small"
              color={getStatusColor(status)}
              variant="outlined"
            />

          </MenuItem>
        ))}
      </Menu>
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={handleCloseOrderDetails}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            color: 'common.white',
            background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Order Details
          </Typography>
          {selectedOrder ? (
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              Tracking Number: {selectedOrder.trackingNumber || 'N/A'}
            </Typography>
          ) : null}
        </DialogTitle>

        <DialogContent dividers>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" mb={2} fontWeight={700}>
                    Order Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <InfoRow label="Status" value={selectedOrder.status} />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Payment Status"
                        value={selectedOrder.payment?.status || 'N/A'}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Total Amount"
                        value={formatCurrency(getOrderAmount(selectedOrder.order, 'total'), selectedCurrency)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Quantity"
                        value={selectedOrder.order?.quantity?.toString() || 'N/A'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InfoRow label="Order Date" value={formatDate(selectedOrder.createdAt)} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                    mb={2}
                  >
                    <Button
                      size="small"
                      onClick={handleOpenImagePicker}
                      disabled={imageUploadLoading}
                    >
                      {imageUploadLoading ? 'Uploading PSD...' : 'Upload PSD'}
                    </Button>
                  </Box>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept=".psd,application/octet-stream,image/vnd.adobe.photoshop"
                    onChange={handleOrderImageUpload}
                    disabled={imageUploadLoading}
                    style={{ display: 'none' }}
                  />
                  <Box display="flex" gap={2} alignItems="center" mb={2}>
                    
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {selectedOrder.order?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedOrder.trackingNumber || 'No tracking number'}
                      </Typography>
                      {selectedImageName || imageUploadLoading ? (
                        <Box mt={1.5}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mt={0.5}
                          >
                            {imageUploadLoading
                              ? `Uploading ${selectedImageName || 'PSD file'}...`
                              : selectedImageName}
                          </Typography>
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                  {selectedOrder.canvas_info?.psdLayers?.length ? (
                    <Box mb={2}>
                      <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                        PSD Layer Preview
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{ p: 1, borderRadius: 2, maxWidth: 560, mx: 'auto' }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: `${psdPreviewFrame.width} / ${psdPreviewFrame.height}`,
                            borderRadius: 1.5,
                            bgcolor: 'grey.100',
                            overflow: 'hidden',
                          }}
                        >
                          {[...selectedOrder.canvas_info.psdLayers].map((layer, index) => (
                            <Box
                              key={`${layer.name || 'layer'}-${index}`}
                              component="img"
                              src={layer.preview}
                              alt={layer.name || `Layer ${index + 1}`}
                              sx={{
                                position: 'absolute',
                                left: `${((Number(layer.left) || 0) / psdPreviewFrame.width) * 100}%`,
                                top: `${((Number(layer.top) || 0) / psdPreviewFrame.height) * 100}%`,
                                width: `${((Number(layer.width) || 0) / psdPreviewFrame.width) * 100}%`,
                                height: `${((Number(layer.height) || 0) / psdPreviewFrame.height) * 100}%`,
                                objectFit: 'fill',
                                opacity:
                                  Number(layer.opacity) > 1
                                    ? Number(layer.opacity) / 255
                                    : (Number(layer.opacity) || 1),
                                pointerEvents: 'none',
                              }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Box>
                  ) : initialPreviewSrc ? (
                    <Box mb={2}>
                      <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                        Preview
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{ p: 1, borderRadius: 2, maxWidth: 560, mx: 'auto' }}
                      >
                        <Box
                          component="img"
                          src={initialPreviewSrc}
                          alt={selectedOrder.order?.name || 'Order Preview'}
                          sx={{
                            display: 'block',
                            width: '100%',
                            aspectRatio: `${initialPreviewFrame.width} / ${initialPreviewFrame.height}`,
                            borderRadius: 1.5,
                            bgcolor: 'grey.100',
                            objectFit: 'contain',
                          }}
                        />
                      </Paper>
                    </Box>
                  ) : null}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Unit Price"
                        value={formatCurrency(getOrderAmount(selectedOrder.order, 'unitPrice'), selectedCurrency)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Subtotal"
                        value={formatCurrency(getOrderAmount(selectedOrder.order, 'subtotal'), selectedCurrency)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow
                        label="Discount"
                        value={formatCurrency(getOrderAmount(selectedOrder.order, 'discount'), selectedCurrency)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow label="Total" value={formatCurrency(getOrderAmount(selectedOrder.order, 'total'), selectedCurrency)} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" mb={2} fontWeight={700}>
                    Customer
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <InfoRow label="Full Name" value={getFullName(selectedOrder.customer)} />
                    </Grid>
                    <Grid item xs={12}>
                      <InfoRow label="Email" value={selectedOrder.customer?.email} />
                    </Grid>
                    <Grid item xs={12}>
                      <InfoRow label="Phone" value={selectedOrder.customer?.phone} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" mb={2} fontWeight={700}>
                    Shipping
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <InfoRow label="Address" value={selectedOrder.shipping?.address} />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow label="City" value={selectedOrder.shipping?.city} />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow label="State" value={selectedOrder.shipping?.state} />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow label="Zip Code" value={selectedOrder.shipping?.zipCode} />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow label="Country" value={selectedOrder.shipping?.country} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(180deg, rgba(29,78,216,0.04) 0%, rgba(15,23,42,0.02) 100%)',
                  }}
                >
                  <Typography variant="h6" mb={2} fontWeight={700}>
                    Payment
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <InfoRow
                        label="Method"
                        value={formatPaymentMethod(selectedOrder.payment?.method)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <InfoRow label="Payment Status" value={selectedOrder.payment?.status} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <InfoRow label="Tracking Number" value={selectedOrder.trackingNumber} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseOrderDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
