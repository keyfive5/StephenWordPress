"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, FormControl, InputLabel, Select, MenuItem,
  OutlinedInput, Chip, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper
} from "@mui/material";
import { Rnd } from "react-rnd";
import axios from "axios";
import { Cat_URL, getAdminId } from "@/utils/api";
import {Products_URL} from "@/utils/api";

const MATERIALS = ["Gloss", "Vinyl"];
const SIZES = ["2x2", "2x3", "3x3", "3x5", "4x3", "4x4", "4x5"];
const SHAPES = ["Circle", "Square"];
const QUALITIES = [100, 250, 500, 750, 1000, 1500, 2000];

export default function ProductsPage() {
  const imageRef = useRef(null);
  const ADMIN_ID = getAdminId();
  

  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [variants, setVariants] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [templateArea, setTemplateArea] = useState({
    x: 50,
    y: 50,
    width: 150,
    height: 150,
    rotate: 0
  });

  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    subCategoryId: "",
    materials: [],
    sizes: [],
    shapes: [],
    qualities: []
  });

  useEffect(() => {
    axios.get(`${Cat_URL}/api/categories/list`)
      .then(res => setCategories(res.data.categories || []));
  }, []);

  const handleCategoryChange = async (e) => {
    const id = e.target.value;
    setForm({ ...form, categoryId: id, subCategoryId: "" });
    const res = await axios.get(`${Cat_URL}/api/categories/get-subcategories`, {
      params: { categoryId: id }
    });
    setSubcategories(res.data.category?.subCategories || []);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMultiChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const combos = [];
    form.materials.forEach(material =>
      form.sizes.forEach(size =>
        form.shapes.forEach(shape =>
          form.qualities.forEach(quality => {
            combos.push({ material, size, shape, quality, price: "" });
          })
        )
      )
    );
    setVariants(combos);
  }, [form.materials, form.sizes, form.shapes, form.qualities]);

  const handleVariantPriceChange = (i, value) => {
    const updated = [...variants];
    updated[i].price = value;
    setVariants(updated);
  };

  /* ---------------- VALIDATIONS ---------------- */

  const validateStep1 = () => {
    let newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.categoryId) newErrors.categoryId = "Category is required";
    if (!form.subCategoryId) newErrors.subCategoryId = "Subcategory is required";
    if (!selectedFile) newErrors.image = "Image is required";
    if (form.materials.length === 0) newErrors.materials = "Select at least one material";
    if (form.sizes.length === 0) newErrors.sizes = "Select at least one size";
    if (form.shapes.length === 0) newErrors.shapes = "Select at least one shape";
    if (form.qualities.length === 0) newErrors.qualities = "Select at least one quantity";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    let hasError = false;

    variants.forEach((v, i) => {
      if (!v.price) {
        newErrors[`price_${i}`] = "Price required";
        hasError = true;
      }
    });

    setErrors(newErrors);
    return !hasError;
  };

  

  /* ---------------- SAVE PRODUCT ---------------- */

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("adminId", ADMIN_ID);
      formData.append("title", form.title);
      formData.append("categoryId", form.categoryId);
      formData.append("subCategoryId", form.subCategoryId);

      form.materials.forEach(m => formData.append("materials[]", m));
      form.sizes.forEach(s => formData.append("sizes[]", s));
      form.shapes.forEach(s => formData.append("shapes[]", s));
      form.qualities.forEach(q => formData.append("qualities[]", q));

      formData.append("variants", JSON.stringify(variants));

      formData.append("templateDragSize", JSON.stringify([{
        xCordination: templateArea.x,
        yCordination: templateArea.y,
        width: templateArea.width,
        height: templateArea.height,
        rotate: templateArea.rotate
      }]));

      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      

      const response = await axios.post(
        `${Products_URL}/api/products/add`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setProducts(prev => [...prev, response.data.product]);

      alert("Product created successfully");

      setOpen(false);
      setStep(1);
      setForm({
        title: "",
        categoryId: "",
        subCategoryId: "",
        materials: [],
        sizes: [],
        shapes: [],
        qualities: []
      });
      setSelectedFile(null);
      setImagePreview(null);
      setVariants([]);
      setErrors({});
    } catch (error) {
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Products</Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>Add Product</Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          {step === 1 && "Product Details"}
          {step === 2 && "Variant Pricing"}
          {step === 3 && "Printable Area Editor"}
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
                onChange={e => setForm({ ...form, title: e.target.value })}
              />

              <FormControl fullWidth margin="normal" error={!!errors.categoryId}>
                <InputLabel>Category</InputLabel>
                <Select value={form.categoryId} onChange={handleCategoryChange}>
                  {categories.map(cat => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.title}</MenuItem>
                  ))}
                </Select>
                <Typography color="error" variant="caption">{errors.categoryId}</Typography>
              </FormControl>

              <FormControl fullWidth margin="normal" error={!!errors.subCategoryId}>
                <InputLabel>Subcategory</InputLabel>
                <Select value={form.subCategoryId}
                  onChange={e => setForm({ ...form, subCategoryId: e.target.value })}>
                  {subcategories.map(sub => (
                    <MenuItem key={sub._id} value={sub._id}>{sub.title}</MenuItem>
                  ))}
                </Select>
                <Typography color="error" variant="caption">{errors.subCategoryId}</Typography>
              </FormControl>

              <Button component="label" variant="outlined" sx={{ mt: 2 }}>
                Upload Image
                <input hidden type="file" accept="image/*" onChange={handleImageUpload} />
              </Button>
              {errors.image && (
                <Typography color="error" variant="caption">{errors.image}</Typography>
              )}

              {imagePreview && (
                <Box mt={2}>
                  <img src={imagePreview} width={140} style={{ borderRadius: 8 }} />
                </Box>
              )}

              {[{ label: "Materials", name: "materials", options: MATERIALS },
              { label: "Sizes", name: "sizes", options: SIZES },
              { label: "Shapes", name: "shapes", options: SHAPES },
              { label: "Qualities", name: "qualities", options: QUALITIES }
              ].map(field => (
                <FormControl key={field.name} fullWidth margin="normal" error={!!errors[field.name]}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    multiple
                    value={form[field.name]}
                    onChange={e => handleMultiChange(field.name, e.target.value)}
                    input={<OutlinedInput label={field.label} />}
                  >
                    {field.options.map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                  <Typography color="error" variant="caption">{errors[field.name]}</Typography>
                </FormControl>
              ))}
            </>
          )}

          {step === 2 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Shape</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Price</TableCell>
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
                        size="small"
                        value={v.price}
                        error={!!errors[`price_${i}`]}
                        helperText={errors[`price_${i}`]}
                        onChange={e => handleVariantPriceChange(i, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {step === 3 && imagePreview && (
            <Box position="relative" maxWidth={600} mx="auto">
              <img ref={imageRef} src={imagePreview} style={{ width: "100%" }} />
              <Rnd
                size={{ width: templateArea.width, height: templateArea.height }}
                position={{ x: templateArea.x, y: templateArea.y }}
                bounds="parent"
                onDragStop={(e, d) =>
                  setTemplateArea(prev => ({ ...prev, x: d.x, y: d.y }))
                }
                onResizeStop={(e, dir, ref, delta, pos) => {
                  setTemplateArea({
                    x: pos.x,
                    y: pos.y,
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height),
                    rotate: 0
                  });
                }}
                style={{ border: "2px dashed red", background: "rgba(255,0,0,0.1)" }}
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
              {loading ? "Saving..." : "Save Product"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
