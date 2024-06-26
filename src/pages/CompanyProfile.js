import React, { useEffect, useState } from 'react';
import Sidenav from '../components/Sidenav';
import Navbar from '../components/Navbar';
import { Box, Grid, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Avatar,
  InputAdornment,
  Card,
  Divider,
  IconButton,
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import endpoints from '../Endpoints/endpoint';

const drawerWidth = 240;

export default function CompanyProfile() {
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetails();
    checkAuth();
  }, []);

  const [formValues, setFormValues] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [errors, setErrors] = useState({});
  const [complementaryPersons, setComplementaryPersons] = useState([]);
  const [paymentMethods ,  setPaymentMethods] = useState([]);

  const checkAuth = () => {
    const token = sessionStorage.getItem('jwtToken');
    if (token && token !== '' && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if (role !== 'superadmin') {
        navigate('/');
      }
    } else {
      console.log('Token not Found');
      navigate('/login');
    }
  };

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${endpoints.serverBaseURL}/api/admin/adminprofile`);
      setFormValues(response.data?.adminprofile[0]);
      setComplementaryPersons(response.data?.adminprofile[0]?.complementaryPersons || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleComplementaryPersonChange = (index, value) => {
    const updatedPersons = [...complementaryPersons];
    updatedPersons[index] = value;
    setComplementaryPersons(updatedPersons);
  };
  const handlePaymentMethodChange = (index, value) =>{
    const updatedMethods = [...paymentMethods];
    updatedMethods[index] = value;
    setPaymentMethods(updatedMethods);
  }
    

  const addComplementaryPerson = () => {
    setComplementaryPersons([...complementaryPersons, '']);
  };

  const addPaymentMehod = ()=>{
    setPaymentMethods([...paymentMethods,'']);
  }

  const removeComplementaryPerson = (index) => {
    const updatedPersons = complementaryPersons.filter((_, i) => i !== index);
    setComplementaryPersons(updatedPersons);
  };

  const removePaymentMethod =(index)=>{
    const updatedMethods = paymentMethods.filter((_,i)=> i !== index)
  }

  const handleSubmit = async (event) => {
    try {
      const updatedFormValues = { ...formValues, complementaryPersons , paymentMethods};
      if (!formValues._id) {
        await axios.post(`${endpoints.serverBaseURL}/api/admin/adminprofile`, updatedFormValues);
      } else {
        await axios.put(`${endpoints.serverBaseURL}/api/admin/adminprofile/${formValues._id}`, updatedFormValues);
      }
      setIsEdit(false);
      fetchDetails();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleEditClick = () => {
    setIsEdit(true);
  };

  const handleClose = () => {
    setIsEdit(false);
  };

  //**********form validation */
  const validate = () => {
    const newErrors = {};

    // URL validation for logo
    if (!formValues.logo) {
      newErrors.logo = 'Please enter a valid image URL';
    }

    // Email format validation
    if (formValues.email && !/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Email address is invalid';
    }

    // Phone number validation
    if (formValues.phone && !/^\d{10}$/.test(formValues.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    // Description length validation
    if (formValues.description && formValues.description.length > 400) {
      newErrors.description = 'Description should be less than 400 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = (event) => {
    event?.preventDefault();
    if (validate()) {
      handleSubmit();
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 3,
            p: 2,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Container component="main" maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mt: 5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" component="h1">
                  Company Profile
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ background: "#ffffff", color: '#867AE9', textTransform: "none", fontWeight: 'bold' }}
                  onClick={handleEditClick}
                >
                  Edit Profile
                </Button>
              </Box>
              <Card sx={{ p: 3, boxShadow: 3, mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="primary">
                      {formValues?.name}
                    </Typography>
                    <Avatar
                      sx={{ width: 120, height: 120, mt: 2 }}
                      alt="Company Logo"
                      src={formValues?.logo}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h7" color="#867AE9" gutterBottom>
                      Complementary Persons
                    </Typography>
                     <Typography variant='body1' >{complementaryPersons.join(", ")}</Typography>
                     <Divider sx={{ my: 2 }} />

                    <Typography variant="h7" color="#867AE9" gutterBottom>
                      Selected Payment Methods
                    </Typography>
                     <Typography variant='body1' >{paymentMethods.join(", ")}</Typography>
                      
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="#867AE9" gutterBottom>
                      Contact Information
                    </Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {formValues?.email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Mobile Number:</strong> {formValues?.phone}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Address:</strong> {formValues?.address}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" color="#867AE9" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {formValues?.description}
                    </Typography>
              
                  </Grid>
                </Grid>
              </Card>
            </Paper>
          </Container>
        </Box>
      </Box>


          {/* Edit Profile form */}
      <Dialog open={isEdit} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company Profile</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                <Avatar
                  src={formValues?.logo}
                  sx={{ width: 80, height: 80, margin: "0 auto" }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="logo"
                  label="Company Logo URL"
                  name="logo"
                  value={formValues?.logo}
                  onChange={handleChange}
                  error={!!errors.logo}
                  helperText={errors.logo}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  label="Company Name"
                  name="name"
                  value={formValues?.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  label="Company Email"
                  name="email"
                  type="email"
                  value={formValues?.email}
                  onChange={handleChange}
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Company Mobile Number"
                  name="phone"
                  value={formValues?.phone}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        +91
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  label="Company Address"
                  name="address"
                  value={formValues?.address}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  label="Company Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formValues?.description}
                  onChange={handleChange}
                  required
                  inputProps={{ maxLength: 400 }}
                  error={!!errors.description}
                  helperText={errors.description ? errors.description : `${formValues?.description?.length}/400`}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" color="#867AE9" gutterBottom>
                  Complementary Persons
                </Typography>
                {complementaryPersons.map((person, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      value={person}
                      onChange={(e) => handleComplementaryPersonChange(index, e.target.value)}
                      label={`Person ${index + 1}`}
                    />
                    <IconButton onClick={() => removeComplementaryPerson(index)} color="secondary">
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddCircle />}
                  onClick={addComplementaryPerson}
                  sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Add Person
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" color="#867AE9" gutterBottom>
                  Payment Methods
                </Typography>
                {paymentMethods.map((method, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      value={method}
                      onChange={(e) => handlePaymentMethodChange(index, e.target.value)}
                      label={`Method ${index + 1}`}
                    />
                    <IconButton onClick={() => removePaymentMethod(index)} color="secondary">
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddCircle />}
                  onClick={addPaymentMehod}
                  sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  Add Payment Method
                </Button>
              </Grid>
            </Grid> 
            
          </Box>
          
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            sx={{ background: "#ffffff", color: '#867AE9', textTransform: "none", fontWeight: 'bold' }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outlined"
            sx={{ background: "#ffffff", color: '#867AE9', textTransform: "none", fontWeight: 'bold' }}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
