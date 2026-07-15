'use client'

import React, { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, TextField, Typography, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axios from "axios";
import { getAdminId, Cat_URL } from "@/utils/api";

export default function SubcategoriesPage() {

  const ADMIN_ID = getAdminId();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);

  const [tableLoading, setTableLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentSub, setCurrentSub] = useState(null);

  const [form, setForm] = useState({
    title: "",
    image: null,
    description: "",
    link: ""
  });

  // Fetch Categories
  const fetchCategories = async () => {
    const res = await axios.get(`${Cat_URL}/api/categories/list`);
    setCategories(res.data.categories || []);
  };

  // Fetch Subcategories
  const fetchSubcategories = async (categoryId) => {

    if (!categoryId) return;

    setTableLoading(true);

    const res = await axios.get(`${Cat_URL}/api/categories/get-subcategories`, {
      params: { categoryId }
    });

    setSubcategories(res.data.category?.subCategories || []);

    setTableLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    }
  }, [selectedCategory]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setCurrentSub(null);
  };

  // ADD SUBCATEGORY
  const handleAddSub = async () => {

    setSubmitLoading(true);

    const formData = new FormData();

    formData.append("categoryId", selectedCategory);
    formData.append("adminId", ADMIN_ID);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("link", form.link);

    if (form.image) {
      formData.append("image", form.image);
    }

    await axios.post(
      `${Cat_URL}/api/categories/add-subcategory`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    closeDialog();
    fetchSubcategories(selectedCategory);

    setSubmitLoading(false);
  };

  // EDIT SUBCATEGORY
  const handleEditSub = async () => {

    setSubmitLoading(true);

    const formData = new FormData();

    formData.append("categoryId", selectedCategory);
    formData.append("subCategoryId", currentSub._id);
    formData.append("adminId", ADMIN_ID);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("link", form.link);

    if (form.image) {
      formData.append("image", form.image);
    }

    await axios.put(
      `${Cat_URL}/api/categories/edit-subcategory`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    closeDialog();
    fetchSubcategories(selectedCategory);

    setSubmitLoading(false);
  };

  // DELETE SUBCATEGORY
  const handleDeleteSub = async (subId) => {

    if (!confirm("Delete subcategory?")) return;

    setDeleteLoadingId(subId);

    await axios.delete(`${Cat_URL}/api/categories/delete-subcategory`, {
      data: {
        categoryId: selectedCategory,
        subCategoryId: subId,
        adminId: ADMIN_ID
      }
    });

    fetchSubcategories(selectedCategory);

    setDeleteLoadingId(null);
  };

  return (

    <Box p={3}>

      <Typography variant="h5" mb={3}>
        Subcategories Management
      </Typography>

      {/* CATEGORY SELECT */}
      <Box mb={3}>
        <Typography mb={1}>Select Category</Typography>

        <Select
          fullWidth
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <MenuItem key={cat._id} value={cat._id}>
              {cat.title}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {selectedCategory && (
        <>

          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setIsEdit(false);
                setForm({
                  title: "",
                  image: null,
                  description: "",
                  link: ""
                });
                setOpenDialog(true);
              }}
            >
              Add Subcategory
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>

              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>

                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>

                ) : subcategories.length === 0 ? (

                  <TableRow>
                    <TableCell colSpan={4}>
                      No subcategories found.
                    </TableCell>
                  </TableRow>

                ) : (

                  subcategories.map((sub) => (

                    <TableRow key={sub._id}>

                      <TableCell>
                        <img
                          src={sub.image}
                          width={40}
                          height={40}
                          style={{ objectFit: "cover", borderRadius: 6 }}
                        />
                      </TableCell>

                      <TableCell>{sub.title}</TableCell>

                      <TableCell>{sub.description}</TableCell>

                      <TableCell align="right">

                        <IconButton
                          onClick={() => {
                            setIsEdit(true);
                            setCurrentSub(sub);
                            setForm({
                              title: sub.title,
                              description: sub.description,
                              link: sub.link,
                              image: null
                            });
                            setOpenDialog(true);
                          }}
                        >
                          <Edit />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => handleDeleteSub(sub._id)}
                        >
                          {deleteLoadingId === sub._id
                            ? <CircularProgress size={20} />
                            : <Delete />}
                        </IconButton>

                      </TableCell>

                    </TableRow>

                  ))

                )}

              </TableBody>

            </Table>
          </TableContainer>

        </>
      )}

      {/* ADD / EDIT MODAL */}

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="sm">

        <DialogTitle>
          {isEdit ? "Edit Subcategory" : "Add Subcategory"}
        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            margin="normal"
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
          />

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Image
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>

          {form.image && (
            <Typography mt={1} fontSize={13}>
              Selected: {form.image.name}
            </Typography>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Link"
            name="link"
            value={form.link}
            onChange={handleChange}
          />

        </DialogContent>

        <DialogActions>

          <Button onClick={closeDialog}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={isEdit ? handleEditSub : handleAddSub}
          >
            {submitLoading
              ? <CircularProgress size={22} color="inherit" />
              : "Save"}
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}