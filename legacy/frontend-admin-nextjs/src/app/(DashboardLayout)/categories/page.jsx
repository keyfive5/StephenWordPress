'use client'

import React, { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Skeleton
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axios from "axios";
import { getAdminId, Cat_URL } from "@/utils/api";

export default function CategoriesPage() {
  const ADMIN_ID = getAdminId();

  const [categories, setCategories] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [form, setForm] = useState({ title: "" });

  const fetchCategories = async () => {
    setTableLoading(true);
    const res = await axios.get(`${Cat_URL}/api/categories/list`);
    setCategories(res.data.categories || []);
    setTableLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const closeDialog = () => {
    setOpenDialog(false);
    setCurrentCategory(null);
  };

  // CATEGORY CRUD
  const handleAddCategory = async () => {
    setSubmitLoading(true);
    await axios.post(`${Cat_URL}/api/categories/add`, {
      title: form.title,
      adminId: ADMIN_ID,
      misc: {}
    });
    closeDialog();
    fetchCategories();
    setSubmitLoading(false);
  };

  const handleEditCategory = async () => {
    setSubmitLoading(true);
    await axios.put(`${Cat_URL}/api/categories/edit`, {
      categoryId: currentCategory._id,
      title: form.title,
      adminId: ADMIN_ID,
      misc: {}
    });
    closeDialog();
    fetchCategories();
    setSubmitLoading(false);
  };

  const handleDeleteCategory = async (cat) => {
    if (!confirm("Delete category?")) return;
    setDeleteLoadingId(cat._id);

    await axios.delete(`${Cat_URL}/api/categories/delete`, {
      data: { categoryId: cat._id, adminId: ADMIN_ID }
    });

    fetchCategories();
    setDeleteLoadingId(null);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setIsEdit(false);
            setForm({ title: "" });
            setOpenDialog(true);
          }}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tableLoading
              ? Array.from(new Array(5)).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={2}>
                      <Skeleton height={40} />
                    </TableCell>
                  </TableRow>
                ))
              : categories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell>{cat.title}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => {
                          setIsEdit(true);
                          setCurrentCategory(cat);
                          setForm({ title: cat.title });
                          setOpenDialog(true);
                        }}
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => handleDeleteCategory(cat)}
                      >
                        {deleteLoadingId === cat._id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Delete />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {isEdit ? "Edit Category" : "Add Category"}
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
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={isEdit ? handleEditCategory : handleAddCategory}
          >
            {submitLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
