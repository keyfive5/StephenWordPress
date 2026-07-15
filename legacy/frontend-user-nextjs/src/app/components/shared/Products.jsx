'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Grid,
  Stack,
} from '@mui/material';
import axios from 'axios';
import { Cat_URL, getAdminId } from '@/utils/api';
import { Products_URL } from '@/utils/api';
import ProductAddDialog from './ProductAddDialog';
import ProductEditDialog from './ProductEditDialog';
import { formatMoney, getProductPricing, parseProductMisc } from '@/utils/pricing';

export default function ProductsPage() {
  const imageRef = useRef(null);
  const ADMIN_ID = getAdminId();
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [templateArea, setTemplateArea] = useState({
    x: 50,
    y: 50,
    width: 150,
    height: 150,
    rotate: 0,
  });

  const [originalSize, setOriginalSize] = useState([
    {
      originalwidthOfImage: 0,
      originalHeightOfImage: 0,
    },
  ]);

  const [productId, setProductId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null);


  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories/list");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
  }, []);

  // Load subcategories when filter category changes
  useEffect(() => {
    if (filterCategory) {
      axios
        .get(`${Cat_URL}/api/categories/get-subcategories`, {
          params: { categoryId: filterCategory },
        })
        .then((res) => {
          const subs = res.data.category?.subCategories || [];
          setSubcategories(subs);
        });
    } else {
      setSubcategories([]);
      setFilterSubcategory('');
    }
  }, [filterCategory]);

  // Load all subcategories for lookup when categories change
  useEffect(() => {
    const fetchAllSubcategories = async () => {
      const allSubs = [];
      for (const category of categories) {
        try {
          const res = await axios.get(`${Cat_URL}/api/categories/get-subcategories`, {
            params: { categoryId: category._id },
          });
          const subs = res.data.category?.subCategories || [];
          allSubs.push(...subs);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      }
      setAllSubcategories(allSubs);
    };

    if (categories.length > 0) {
      fetchAllSubcategories();
    }
  }, [categories]);

  // Apply filters whenever products, filterCategory, or filterSubcategory changes
  useEffect(() => {
    let filtered = [...products];

    if (filterCategory) {
      filtered = filtered.filter((product) => product.categoryId === filterCategory);
    }

    if (filterSubcategory) {
      filtered = filtered.filter((product) => product.subCategoryId === filterSubcategory);
    }

    setFilteredProducts(filtered);
  }, [products, filterCategory, filterSubcategory]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${Products_URL}/api/products/get`);

      // Parse the products data properly
      const parsedProducts = (res.data.products || []).map((p) => {
        // Helper function to safely parse JSON
        // Parse material
        let material = [];
        if (p.material) {
          if (typeof p.material === 'string') {
            try {
              const parsed = JSON.parse(p.material);
              material = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              material = [p.material];
            }
          } else if (Array.isArray(p.material)) {
            material = p.material;
          }
        }

        // Parse sizes
        let sizes = [];
        if (p.sizes) {
          if (typeof p.sizes === 'string') {
            try {
              const parsed = JSON.parse(p.sizes);
              sizes = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              sizes = [p.sizes];
            }
          } else if (Array.isArray(p.sizes)) {
            sizes = p.sizes;
          }
        }

        // Parse shapes
        let shapes = [];
        if (p.shapes) {
          if (typeof p.shapes === 'string') {
            try {
              const parsed = JSON.parse(p.shapes);
              shapes = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              shapes = [p.shapes];
            }
          } else if (Array.isArray(p.shapes)) {
            shapes = p.shapes;
          }
        }

        // Parse qualities
        let qualities = [];
        if (p.qualities) {
          if (typeof p.qualities === 'string') {
            try {
              const parsed = JSON.parse(p.qualities);
              qualities = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              qualities = [p.qualities];
            }
          } else if (Array.isArray(p.qualities)) {
            qualities = p.qualities;
          }
        }

        // Parse variants
        let variants = [];
        if (p.variants) {
          if (typeof p.variants === 'string') {
            try {
              const parsed = JSON.parse(p.variants);
              variants = Array.isArray(parsed)
                ? parsed.map(v => {
                  try {
                    return typeof v === 'string' ? JSON.parse(v) : v;
                  } catch {
                    return v;
                  }
                })
                : [];
            } catch {
              variants = [];
            }
          } else if (Array.isArray(p.variants)) {
            variants = p.variants;
          }
        }

        return {
          ...p,
          material,
          sizes,
          shapes,
          qualities,
          variants,
          misc: parseProductMisc(p.misc),
          basePrice: Number(p.basePrice) || 0,
          // Keep the original name if it's a string, otherwise parse it
          name: typeof p.name === 'string'
            ? (p.name.startsWith('[') ? JSON.parse(p.name)[0] : p.name)
            : (Array.isArray(p.name) ? p.name[0] : p.name),
        };
      });

      setProducts(parsedProducts);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  /* ---------------- SAVE PRODUCT ---------------- */


  const handleDelete = async (productId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this product?')) {
        return;
      }

      const formData = new FormData();
      formData.append('adminId', ADMIN_ID);
      formData.append('productId', productId);

      await axios.post(`${Products_URL}/api/products/delete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchProducts();
      alert('Product deleted successfully');
    } catch (error) {
      alert(error?.response?.data?.message || 'Delete failed');
    }
  };



  const handleEdit = async (productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) {
      alert('Product not found');
      return;
    }
    setSelectedProduct(product);
    setProductId(productId);
    setStep(1);
    setEditOpen(true);
  };

  const getCategoryTitle = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    return category?.title || 'N/A';
  };
  const getSubcategoryTitle = (subcategoryId) => {
    const subcategory = allSubcategories.find((s) => s._id === subcategoryId);
    return subcategory?.title || 'N/A';
  };

  const getPricingSummary = (product) => {
    const pricing = getProductPricing(product);
    return `USD ${formatMoney(pricing.usdPrice, 'USD')} / CAD ${formatMoney(pricing.cadPrice, 'CAD')}`;
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Products</Typography>

        <Box>
          <Button variant="outlined" sx={{ mr: 2 }} onClick={fetchProducts}>
            Refresh
          </Button>

          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Filter Products
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>All Categories</em>;
                  }
                  const category = categories.find((c) => c._id === selected);
                  return category?.title || selected;
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={!filterCategory}>
              <Select
                value={filterSubcategory}
                onChange={(e) => setFilterSubcategory(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>All Subcategories</em>;
                  }
                  const subcategory = subcategories.find((s) => s._id === selected);
                  return subcategory?.title || 'N/A';
                }}
              >
                <MenuItem value="">All Subcategories</MenuItem>
                {subcategories.map((sub) => (
                  <MenuItem key={sub._id} value={sub._id}>
                    {sub.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subcategory</TableCell>
              <TableCell>Pricing</TableCell>
              <TableCell>Materials</TableCell>
              <TableCell>Sizes</TableCell>
              <TableCell>Shapes</TableCell>
              <TableCell>Total Variants</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <TableRow key={product._id}>
                  <TableCell>{index + 1}</TableCell>

                  {/* Image */}
                  <TableCell>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        width={60}
                        style={{ borderRadius: 6 }}
                      />
                    )}
                  </TableCell>

                  {/* Name */}
                  <TableCell>{product.name || 'N/A'}</TableCell>

                  {/* Category */}
                  <TableCell>{getCategoryTitle(product.categoryId)}</TableCell>

                  {/* Subcategory */}
                  <TableCell>{getSubcategoryTitle(product.subCategoryId)}</TableCell>

                  {/* Pricing */}
                  <TableCell>{getPricingSummary(product)}</TableCell>

                  {/* Materials */}
                  <TableCell>
                    {product.material && product.material.length > 0
                      ? product.material.join(', ')
                      : 'N/A'}
                  </TableCell>

                  {/* Sizes */}
                  <TableCell>
                    {product.sizes && product.sizes.length > 0
                      ? product.sizes.join(', ')
                      : 'N/A'}
                  </TableCell>

                  {/* Shapes */}
                  <TableCell>
                    {product.shapes && product.shapes.length > 0
                      ? product.shapes.join(', ')
                      : 'N/A'}
                  </TableCell>

                  {/* Variants Count */}
                  <TableCell>
                    {product.variants && product.variants.length > 0
                      ? product.variants.length
                      : '0'}
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        color="info"
                        variant="contained"
                        size="small"
                        onClick={() => handleEdit(product._id)}
                      >
                        Edit
                      </Button>

                      <Button
                        color="error"
                        variant="contained"
                        size="small"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ProductAddDialog
        open={open}
        setOpen={setOpen}
        step={step}
        setStep={setStep}
        categories={categories}
        subcategories={subcategories}
        imageRef={imageRef}
        templateArea={templateArea}
        setTemplateArea={setTemplateArea}
        setOriginalSize={setOriginalSize}
        fetchProducts={fetchProducts}
        originalSize={originalSize}
        setSubcategories={setSubcategories}
      />
      <ProductEditDialog
        open={editOpen}
        setOpen={setEditOpen}
        step={step}
        setStep={setStep}
        categories={categories}
        subcategories={subcategories}
        imageRef={imageRef}
        templateArea={templateArea}
        setTemplateArea={setTemplateArea}
        setOriginalSize={setOriginalSize}
        fetchProducts={fetchProducts}
        originalSize={originalSize}
        setSubcategories={setSubcategories}
        product={selectedProduct}
        productId={productId}
      />
    </Box>
  );
}
