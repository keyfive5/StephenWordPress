import React, { useEffect, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@mui/material';

import { Rnd } from 'react-rnd';
import { Cat_URL, getAdminId, Products_URL } from '@/utils/api';
import axios from 'axios';

const MATERIALS = ['Gloss', 'Vinyl'];
const SIZES = ['2x2', '2x3', '3x3', '3x5', '4x3', '4x4', '4x5'];
const SHAPES = ['Circle', 'Square'];
const QUALITIES = [100, 250, 500, 750, 1000, 1500, 2000];

const ProductAddDialog = ({
    open,
    setOpen,
    step,
    setStep,
    categories,
    subcategories,
    imageRef,
    templateArea,
    setTemplateArea,
    setOriginalSize,
    fetchProducts,
    originalSize,
    setSubcategories
}) => {

    const [form, setForm] = useState({
        title: '',
        categoryId: '',
        subCategoryId: '',
        materials: [],
        sizes: [],
        shapes: [],
        qualities: [],
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        const combos = [];
        form.materials.forEach((material) =>
            form.sizes.forEach((size) =>
                form.shapes.forEach((shape) =>
                    form.qualities.forEach((quality) => {
                        combos.push({ material, size, shape, quality, price: '', usdPrice: '', cadPrice: '' });
                    }),
                ),
            ),
        );
        setVariants(combos);
    }, [form.materials, form.sizes, form.shapes, form.qualities]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState();
    const ADMIN_ID = getAdminId();

    const handleSave = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('adminId', ADMIN_ID);
            formData.append('name', form.title);
            formData.append('categoryId', form.categoryId);
            formData.append('subCategoryId', form.subCategoryId);
            form.materials.forEach((material) => {
                formData.append('material[]', material);
            });
            form.sizes.forEach((size) => {
                formData.append('sizes[]', size);
            });
            form.shapes.forEach((shape) => {
                formData.append('shapes[]', shape);
            });
            form.qualities.forEach((quality) => {
                formData.append('qualities[]', quality);
            });
            const primaryVariant = variants.find((variant) => variant.usdPrice || variant.cadPrice || variant.price) || {};
            const fallbackBasePrice = primaryVariant.usdPrice || primaryVariant.cadPrice || primaryVariant.price || 0;
            formData.append('basePrice', String(fallbackBasePrice));
            formData.append(
                'misc',
                JSON.stringify({
                    pricing: {
                        basePrice: fallbackBasePrice,
                        USD: primaryVariant.usdPrice || fallbackBasePrice,
                        CAD: primaryVariant.cadPrice || fallbackBasePrice,
                    },
                }),
            );
            formData.append(
                'originalSize[]',
                JSON.stringify({
                    originalwidthOfImage: originalSize[0].originalwidthOfImage,
                    originalHeightOfImage: originalSize[0].originalHeightOfImage,
                }),
            );

            // Dimensions
            formData.append(
                'dimentions[]',
                JSON.stringify({
                    xCordination: templateArea.x,
                    yCordination: templateArea.y,
                    width: templateArea.width,
                    height: templateArea.height,
                }),
            );

            // Variants
            variants.forEach((variant) => {
                const fallbackPrice =
                    variant.usdPrice !== '' && variant.usdPrice !== null && variant.usdPrice !== undefined
                        ? variant.usdPrice
                        : variant.cadPrice;
                formData.append(
                    'variants[]',
                    JSON.stringify({
                        material: variant.material,
                        size: variant.size,
                        shape: variant.shape,
                        quality: variant.quality,
                        price: variant.price || fallbackPrice || '',
                        usdPrice: variant.usdPrice || '',
                        cadPrice: variant.cadPrice || '',
                    }),
                );
            });

            // Image
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            await axios.post(`${Products_URL}/api/products/add`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Product created successfully');

            // Refresh product list
            await fetchProducts();

            // Reset form
            setOpen(false);
            setStep(1);
            setForm({
                title: '',
                categoryId: '',
                subCategoryId: '',
                materials: [],
                sizes: [],
                shapes: [],
                qualities: [],
            });

            setSelectedFile(null);
            setImagePreview(null);
            setVariants([]);
            setErrors({});
        } catch (error) {
            console.log('handle Save Error', error)
            alert(error?.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleMultiChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    /* ---------------- VALIDATIONS ---------------- */

    const validateStep1 = () => {
        let newErrors = {};

        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (!form.categoryId) newErrors.categoryId = 'Category is required';
        if (!form.subCategoryId) newErrors.subCategoryId = 'Subcategory is required';
        if (!selectedFile) newErrors.image = 'Image is required';
        if (form.materials.length === 0) newErrors.materials = 'Select at least one material';
        if (form.sizes.length === 0) newErrors.sizes = 'Select at least one size';
        if (form.shapes.length === 0) newErrors.shapes = 'Select at least one shape';
        if (form.qualities.length === 0) newErrors.qualities = 'Select at least one quantity';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        let newErrors = {};
        let hasError = false;

        variants.forEach((v, i) => {
            if (!v.price && !v.usdPrice && !v.cadPrice) {
                newErrors[`price_${i}`] = 'USD or CAD price required';
                hasError = true;
            }
        });

        setErrors(newErrors);
        return !hasError;
    };

    const handleCategoryChange = async (e) => {
        const id = e.target.value;
        setForm({ ...form, categoryId: id, subCategoryId: '' });
        const res = await axios.get(`${Cat_URL}/api/categories/get-subcategories`, {
            params: { categoryId: id },
        });
        setSubcategories(res.data.category?.subCategories || []);
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
            <DialogTitle>
                {step === 1 && 'Product Details'}
                {step === 2 && 'Variant Pricing'}
                {step === 3 && 'Printable Area Editor'}
            </DialogTitle>

            <DialogContent>
                {step === 1 && (
                    <>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Title"
                            value={form.title}
                            error={!!errors.title}
                            helperText={errors.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />

                        <FormControl fullWidth margin="normal" error={!!errors.categoryId}>
                            <InputLabel>Category</InputLabel>
                            <Select value={form.categoryId} onChange={handleCategoryChange}>
                                {categories.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>
                                        {cat.title}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.categoryId && (
                                <Typography color="error" variant="caption">
                                    {errors.categoryId}
                                </Typography>
                            )}
                        </FormControl>

                        <FormControl fullWidth margin="normal" error={!!errors.subCategoryId}>
                            <InputLabel>Subcategory</InputLabel>
                            <Select
                                value={form.subCategoryId}
                                onChange={(e) => setForm({ ...form, subCategoryId: e.target.value })}
                            >
                                {subcategories.map((sub) => (
                                    <MenuItem key={sub._id} value={sub._id}>
                                        {sub.title}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.subCategoryId && (
                                <Typography color="error" variant="caption">
                                    {errors.subCategoryId}
                                </Typography>
                            )}
                        </FormControl>

                        <Button component="label" variant="outlined" sx={{ mt: 2 }}>
                            Upload Image
                            <input hidden type="file" accept="image/*" onChange={handleImageUpload} />
                        </Button>
                        {errors.image && (
                            <Typography color="error" variant="caption" display="block">
                                {errors.image}
                            </Typography>
                        )}

                        {imagePreview && (
                            <Box mt={2}>
                                <img src={imagePreview} width={140} style={{ borderRadius: 8 }} alt="Preview" />
                            </Box>
                        )}

                        {[
                            { label: 'Materials', name: 'materials', options: MATERIALS },
                            { label: 'Sizes', name: 'sizes', options: SIZES },
                            { label: 'Shapes', name: 'shapes', options: SHAPES },
                            { label: 'Qualities', name: 'qualities', options: QUALITIES },
                        ].map((field) => (
                            <FormControl
                                key={field.name}
                                fullWidth
                                margin="normal"
                                error={!!errors[field.name]}
                            >
                                <InputLabel>{field.label}</InputLabel>
                                <Select
                                    multiple
                                    value={form[field.name]}
                                    onChange={(e) => handleMultiChange(field.name, e.target.value)}
                                    input={<OutlinedInput label={field.label} />}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                    {field.options.map((opt) => (
                                        <MenuItem key={opt} value={opt}>
                                            {opt}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors[field.name] && (
                                    <Typography color="error" variant="caption">
                                        {errors[field.name]}
                                    </Typography>
                                )}
                            </FormControl>
                        ))}
                    </>
                )}

                {step === 2 && (
                    <>
                        <Box
                            mb={2}
                            p={2}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: 'rgba(15, 23, 42, 0.02)',
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={700} mb={1}>
                                Currency Pricing
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Enter USD and/or CAD for each variant. If one is empty, the other will be used as the fallback.
                            </Typography>
                        </Box>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Material</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Shape</TableCell>
                                    <TableCell>Qty</TableCell>
                                    <TableCell>USD</TableCell>
                                    <TableCell>CAD</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {variants.map((v, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{v.material}</TableCell>
                                        <TableCell>{v.size}</TableCell>
                                        <TableCell>{v.shape}</TableCell>
                                        <TableCell>{v.quality}</TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={v.usdPrice}
                                                error={!!errors[`price_${i}`]}
                                                helperText={errors[`price_${i}`] && !v.usdPrice && !v.cadPrice ? errors[`price_${i}`] : ''}
                                                onChange={(e) => {
                                                    const updated = [...variants];
                                                    updated[i].usdPrice = e.target.value;
                                                    updated[i].price = e.target.value || updated[i].cadPrice || '';
                                                    setVariants(updated);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={v.cadPrice}
                                                error={!!errors[`price_${i}`]}
                                                helperText={errors[`price_${i}`] && !v.usdPrice && !v.cadPrice ? errors[`price_${i}`] : ''}
                                                onChange={(e) => {
                                                    const updated = [...variants];
                                                    updated[i].cadPrice = e.target.value;
                                                    updated[i].price = updated[i].usdPrice || e.target.value || '';
                                                    setVariants(updated);
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )}

                {step === 3 && imagePreview && (
                    <Box position="relative" maxWidth={600} mx="auto">
                        <img
                            ref={imageRef}
                            src={imagePreview}
                            alt="Template"
                            style={{ width: '100%' }}
                            onLoad={() => {
                                if (imageRef.current) {
                                    const { width, height } = imageRef.current.getBoundingClientRect();
                                    setOriginalSize([
                                        {
                                            originalwidthOfImage: width,
                                            originalHeightOfImage: height,
                                        },
                                    ]);
                                }
                            }}
                        />
                        <Rnd
                            size={{ width: templateArea.width, height: templateArea.height }}
                            position={{ x: templateArea.x, y: templateArea.y }}
                            bounds="parent"
                            onDragStop={(e, d) => setTemplateArea((prev) => ({ ...prev, x: d.x, y: d.y }))}
                            onResizeStop={(e, dir, ref, delta, pos) => {
                                setTemplateArea({
                                    x: pos.x,
                                    y: pos.y,
                                    width: parseInt(ref.style.width),
                                    height: parseInt(ref.style.height),
                                    rotate: 0,
                                });
                            }}
                            style={{ border: '2px dashed red', background: 'rgba(255,0,0,0.1)' }}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}

                {step < 3 && (
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (step === 1 && !validateStep1()) return;
                            if (step === 2 && !validateStep2()) return;
                            setStep(step + 1);
                        }}
                    >
                        Next
                    </Button>
                )}

                {step === 3 && (
                    <Button variant="contained" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default ProductAddDialog
