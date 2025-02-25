import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CardMedia,
  Typography,
  Snackbar,
  Alert,
  Grid,
  Collapse,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import endpoints from "../Endpoints/endpoint";
import Preloader from "../components/Preloader";
import { toast } from "react-toastify";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import { useEffect } from "react";
import PlanStatusSelect from "../components/PlanStatusSelect";

import PlanCard from "../components/PlanCard";

dayjs.extend(isBetween);
dayjs.extend(advancedFormat);

const drawerWidth = 240;

export default function PlansPage() {
  const Navigate = useNavigate();
  const [plans, setPlans] = React.useState([]);
  const [coupons, setCoupons] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [newPlan, setNewPlan] = React.useState({
    title: "",
    description: "",
    timing: {},
    subpackages: [],
    addOn: [],
    image_list: [],
    plan_coupon: [],
    adult_age_range: "",
    child_age_range: "",
    status: "on",
  });
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [deletePlanId, setDeletePlanId] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [newLink, setNewLink] = React.useState("");
  const [newHighlight, setNewHighlight] = React.useState("");
  const [newChildActivities, setNewChildActivities] = React.useState("");
  const [newFacilitie, setNewFacilities] = React.useState("");
  const [newAddOn, setNewAddOn] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [subPackages, setsubPackages] = React.useState([]);
  const [subPackageDialogOpen, setSubPackageDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [currentSubPackage, setCurrentSubPackage] = React.useState({
    name: "",
    adult_price: "",
    child_price: "",
    adult_activities: [],
    child_activities: [],
    addOn: [],
  });
  const [isEditing, setIsEditing] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState(null);
  const [adminRole, setAdminRole] = React.useState();
  const [fromTime, setFromTime] = React.useState();
  const [toTime, setToTime] = React.useState();
  const [status, setStatus] = React.useState("on");

  React.useEffect(() => {
    fetchPlans();
    fetchCoupons();
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      const [fromHours, fromMinutes] = selectedPlan?.timing?.fromtime
        .split(":")
        .map(Number);
      const fromPeriod = selectedPlan?.timing?.fromperiod;

      const fromHours24 =
        fromPeriod === "PM" && fromHours < 12 ? fromHours + 12 : fromHours;
      const fromHours12 = fromHours % 12 || 12;

      setFromTime(dayjs().hour(fromHours24).minute(fromMinutes));

      const [toHours, toMinutes] = selectedPlan?.timing?.totime
        .split(":")
        .map(Number);
      const toPeriod = selectedPlan?.timing?.toperiod;

      const toHours24 =
        toPeriod === "PM" && toHours < 12 ? toHours + 12 : toHours;
      const toHours12 = toHours % 12 || 12;

      setToTime(dayjs().hour(toHours24).minute(toMinutes));
    }
  }, [selectedPlan]);

  const checkAuth = () => {
    const token = sessionStorage.getItem("jwtToken");

    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      setAdminRole(role);
      if (role == "checker") {
        Navigate("/scanner");
      }
    } else {
      console.log("Token not Found");
      Navigate("/login");
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${endpoints.serverBaseURL}/api/plan`);
      setPlans(response.data.plan);
      console.log("incoming plans", response.data.plan);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setLoading(true);
      alert("Something Went Wrong");
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/coupons`
      );
      setCoupons(response.data.coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  //loader****************************//
  if (loading) {
    return <Preloader />;
  }
  //************************************ */

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPlan(null);
  };

  const handleSave = async () => {
    const timing = {
      fromtime: formatTime(fromTime).time,
      fromperiod: formatTime(fromTime).period,
      totime: formatTime(toTime).time,
      toperiod: formatTime(toTime).period,
    };
    console.log("timing", timing);
    const updatedPlan = {
      ...newPlan,
      timing: timing,
    };

    console.log(updatedPlan);
    try {
      if (selectedPlan) {
        await axios.put(
          `${endpoints.serverBaseURL}/api/plan/${selectedPlan._id}`,
          updatedPlan
        );
      } else {
        await axios.post(`${endpoints.serverBaseURL}/api/plan`, updatedPlan);
      }
      fetchPlans();
      setNewPlan({
        title: "",
        description: "",
        timing: {},
        subpackages: [],
        image_list: [],
        plan_coupon: [],
        adult_age_range: "",
        child_age_range: "",
        status: "on",
      });
      handleClose();
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setNewPlan(plan);
    setOpen(true);
  };

  /////////////////////////handle  time/////////////
  const handleFromTimeChange = (newValue) => {
    setFromTime(newValue);
  };

  const handleToTimeChange = (newValue) => {
    setToTime(newValue);
  };

  const formatTime = (date) => {
    console.log("date", date);
    return {
      time: dayjs(date).format("hh:mm"),
      period: dayjs(date).format("A"),
    };
  };
  //////////////////////////////////////////////////////

  const handleDelete = async (planId) => {
    setDeletePlanId(planId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${endpoints.serverBaseURL}/api/plan/${deletePlanId}`);
      fetchPlans();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.log("Error deleting plan", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletePlanId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewPlan({ ...newPlan, [name]: value });
  };

  const handleImageLinksChange = (event) => {
    setNewLink(event.target.value);
  };

  const handleHighlightChange = (event) => {
    setNewHighlight(event.target.value);
  };

  const handleChildActivitiesChange = (event) => {
    setNewChildActivities(event.target.value);
  };

  const handleAddOnChange = (event) => {
    setNewAddOn(event.target.value);
  };

  const handleFacilitieChange = (event) => {
    setNewFacilities(event.target.value);
  };

  const handleAddLink = () => {
    if (newLink && newPlan.image_list.length < 5) {
      setNewPlan({ ...newPlan, image_list: [...newPlan.image_list, newLink] });
      setNewLink("");
    } else {
      setSnackbarMessage("Only 5 image links are allowed");
      setSnackbarOpen(true);
    }
  };

  const handleAddHighlight = () => {
    if (newHighlight && currentSubPackage.adult_activities?.length < 25) {
      setCurrentSubPackage({
        ...currentSubPackage,
        adult_activities: [...currentSubPackage.adult_activities, newHighlight],
      });
      setNewHighlight("");
    } else {
      setSnackbarMessage("Only 5 image links are allowed");
      setSnackbarOpen(true);
    }
  };

  const handleAddChildActivities = () => {
    if (newChildActivities && currentSubPackage.child_activities?.length < 25) {
      setCurrentSubPackage({
        ...currentSubPackage,
        child_activities: [
          ...currentSubPackage.child_activities,
          newChildActivities,
        ],
      });
      setNewChildActivities("");
    } else {
      setSnackbarMessage("Only 5 image links are allowed");
      setSnackbarOpen(true);
    }
  };

  const handleAddAddOn = () => {
    if (newAddOn && currentSubPackage.addOn.length < 10) {
      setCurrentSubPackage({
        ...currentSubPackage,
        addOn: [...currentSubPackage.addOn, newAddOn],
      });
      setNewAddOn("");
    } else {
      setSnackbarMessage("Only 5 image links are allowed");

      setSnackbarOpen(true);
    }
  };

  const handleAddFacilitie = () => {
    if (newFacilitie && currentSubPackage.facilities.length < 6) {
      setCurrentSubPackage({
        ...currentSubPackage,
        facilities: [...currentSubPackage.facilities, newFacilitie],
      });
      setNewFacilities("");
    } else {
      setSnackbarMessage("Only 5 Facilities are allowed");

      setSnackbarOpen(true);
    }
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = newPlan.image_list.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, image_list: updatedLinks });
  };

  const handleRemoveHighlights = (index) => {
    const updatedHighlights = currentSubPackage.adult_activities.filter(
      (_, i) => i !== index
    );
    setCurrentSubPackage({
      ...currentSubPackage,
      adult_activities: updatedHighlights,
    });
  };

  const handleRemoveChildActivities = (index) => {
    const updatedChildActivities = currentSubPackage.child_activities.filter(
      (_, i) => i !== index
    );
    setCurrentSubPackage({
      ...currentSubPackage,
      child_activities: updatedChildActivities,
    });
  };

  const handleRemoveAddOn = (index) => {
    const updatedAddOns = currentSubPackage.addOn.filter((_, i) => i !== index);
    setCurrentSubPackage({ ...currentSubPackage, addOn: updatedAddOns });
  };

  const handleRemoveFacilitie = (index) => {
    const updatedFacilitie = currentSubPackage.facilities.filter(
      (_, i) => i !== index
    );
    setCurrentSubPackage({
      ...currentSubPackage,
      facilities: updatedFacilitie,
    });
  };

  const handleCouponsChange = (event, value) => {
    setNewPlan({ ...newPlan, plan_coupon: value });
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage("");
  };

  //*******form validation********** */

  const validate = () => {
    const newErrors = {};
    if (!newPlan.title) newErrors.title = "Title is required";
    if (!newPlan.description || newPlan.description.length > 500) {
      newErrors.description =
        "Description is required and should be less than 200 characters";
    }

    if (newPlan.image_list.length === 0) {
      newErrors.image_list = "At least one image link is required";
    }
    if (!newPlan.adult_age_range) {
      newErrors.adult_age_range = "field required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (validate()) {
      handleSave();
    }
  };

  //**************Handle status Change**********/
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };
  //***********Handle Sub Packages ***************************/
  const handleAddSubPackageClick = () => {
    setCurrentSubPackage({
      name: "",
      adult_price: "",
      child_price: "",
      adult_activities: [],
      child_activities: [],
      addOn: [],
    });
    setIsEditing(false);
    setSubPackageDialogOpen(true);
  };

  const handleSubPackageChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubPackage({ ...currentSubPackage, [name]: value });
  };

  const handleSaveSubPackage = () => {
    if (isEditing) {
      const upadatedSubPackages = newPlan.subpackages.map((subPackage, index) =>
        index === editIndex ? currentSubPackage : subPackage
      );
      setNewPlan({ ...newPlan, subpackages: upadatedSubPackages });
    } else {
      const upadatedSubPackages = [...newPlan.subpackages, currentSubPackage];
      setNewPlan({ ...newPlan, subpackages: upadatedSubPackages });
    }

    setSubPackageDialogOpen(false);
    setCurrentSubPackage({});
    setIsEditing(false);
    setEditIndex(null);
  };

  const handleRemoveSubPackage = (index) => {
    const newSubPackages = newPlan.subpackages.filter((_, i) => i !== index);
    setsubPackages(newSubPackages);
    setNewPlan({ ...newPlan, subpackages: newSubPackages });
  };

  const handleEditSubPackage = (index) => {
    setCurrentSubPackage(newPlan.subpackages[index]);
    setEditIndex(index);
    setIsEditing(true);
    setSubPackageDialogOpen(true);
  };
  //******************************************** */
  const filteredPlans = plans.filter(
    (plan) =>
      plan.title.toLowerCase().includes(search.toLowerCase()) ||
      plan.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Box sx={{ padding: 2, display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 5,
            p: 4,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <TextField
              label="Search Plans"
              variant="outlined"
              size="small"
              value={search}
              sx={{ width: "35%", background: "white" }}
              onChange={handleSearchChange}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Box sx={{ position: "absolute", right: 10, top: 8 }}>
                    <SearchIcon sx={{ color: "#867AE9" }} />
                  </Box>
                ),
              }}
            />

            {adminRole === "superadmin" && (
              <Button
                variant="contained"
                style={{
                  background: "#ffffff",
                  color: "#867AE9",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                onClick={handleOpen}
                startIcon={<AddIcon />}
              >
                Add Plan
              </Button>
            )}
          </Box>

          {/* add plan dialog */}
          <Dialog open={open} onClose={handleClose} maxWidth="md">
            <DialogTitle sx={{ background: "#867AE9", color: "white" }}>
              {selectedPlan ? "Edit Plan" : "Add Plan"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Fill in the details of the plan.
              </DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                name="title"
                value={newPlan.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
              <TextField
                margin="dense"
                label="Description"
                required
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                name="description"
                value={newPlan.description}
                onChange={handleChange}
                error={!!errors.description}
                inputProps={{ minLength: 70, maxLength: 200 }}
                helperText={
                  errors.description
                    ? errors.description
                    : `${newPlan?.description?.length}/200`
                }
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={1} sx={{ mt: "0.1rem", mb: "1rem" }}>
                  <Grid item xs={4}>
                    <MobileTimePicker
                      label="From Time"
                      value={fromTime}
                      onChange={handleFromTimeChange}
                      renderInput={(params) => <TextField {...params} />}
                      ampm
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <MobileTimePicker
                      label="To Time"
                      value={toTime}
                      onChange={handleToTimeChange}
                      renderInput={(params) => <TextField {...params} />}
                      ampm
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      onClick={handleAddSubPackageClick}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ mt: "1", height: "3.5rem" }}
                    >
                      Add Sub Package
                    </Button>
                  </Grid>
                </Grid>
              </LocalizationProvider> <Box>
                {newPlan.subpackages.map((subPackage, index) => (
                  <Card key={index} sx={{ m: 1 }}>
                    <CardContent>
                      <Typography variant="h6">{subPackage.name}</Typography>
                      <Typography variant="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Adult Price :
                        </span>
                        {subPackage.adult_price}
                      </Typography>
                      <Typography variant="body2">
                        <span style={{ fontWeight: "bold" }}>
                          {" "}
                          Child Price:{" "}
                        </span>
                        {subPackage.child_price}
                      </Typography>
                      <Typography varaint="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Adult_Activities:{" "}
                        </span>{" "}
                        {subPackage.adult_activities.join(", ")}
                      </Typography>
                      <Typography varaint="body2">
                        <span style={{ fontWeight: "bold" }}>
                          Child_Activities:{" "}
                        </span>{" "}
                        {subPackage.child_activities.join(", ")}
                      </Typography>
                      <Typography varaint="body2">
                        <span style={{ fontWeight: "bold" }}>Add-Ons: </span>
                        {subPackage.addOn.join(", ")}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        onClick={() => handleEditSubPackage(index)}
                        variant="text"
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleRemoveSubPackage(index)}
                        varaint="outlined"
                        size="small"
                      >
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>


              <Box
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <TextField
                  margin="dense"
                  label="Image Link"
                  fullWidth
                  variant="outlined"
                  value={newLink}
                  onChange={handleImageLinksChange}
                />

                <IconButton
                  onClick={handleAddLink}
                  disabled={newPlan.image_list.length >= 5}
                >
                  <AddCircle />
                </IconButton>
              </Box>
              <Box>
                {newPlan.image_list?.map((link, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}) {link}
                    </Typography>

                    <IconButton onClick={() => handleRemoveLink(index)}>
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <TextField
                autoFocus
                required
                margin="dense"
                label="Add Adult Age Limit Range"
                fullWidth
                placeholder="e.g (12+ years)"
                variant="outlined"
                name="adult_age_range"
                value={newPlan.adult_age_range}
                onChange={handleChange}
                error={!!errors.adult_age_range}
                helperText={errors.adult_age_range}
              />
              <TextField
                autoFocus
                required
                margin="dense"
                label="Add Child Age Limit Range"
                fullWidth
                placeholder="e.g (5-10 years)"
                variant="outlined"
                name="child_age_range"
                value={newPlan.child_age_range}
                onChange={handleChange}
              />

              <Autocomplete
                multiple
                id="coupons"
                options={coupons}
                getOptionLabel={(option) => option.coupon_code}
                value={newPlan.plan_coupon}
                onChange={handleCouponsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    label="Coupons"
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </DialogContent>

            <DialogActions>
              <Button
                onClick={handleClose}
                variant="contained"
                style={{ background: "#686D76", textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveClick}
                variant="contained"
                style={{ background: "#867AE9", textTransform: "none" }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* sub package dialog */}
          <Dialog
            open={subPackageDialogOpen}
            onClose={() => {
              setSubPackageDialogOpen(false);
            }}
          >
            <DialogTitle sx={{ background: "#867AE9", color: "white" }}>
              {isEditing ? "Edit Sub Package" : "Add Sub Package"}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="sub Package Name"
                label="Sub Package Name "
                fullWidth
                variant="outlined"
                name="name"
                size="small"
                value={currentSubPackage.name}
                onChange={handleSubPackageChange}
                sx={{ mt: "10px" }}
              />
              <TextField
                margin="dense"
                label="Adult Price"
                fullWidth
                variant="outlined"
                name="adult_price"
                size="small"
                value={currentSubPackage.adult_price}
                onChange={handleSubPackageChange}
                type="number"
              />
              <TextField
                margin="dense"
                label="Child Price"
                fullWidth
                variant="outlined"
                name="child_price"
                size="small"
                value={currentSubPackage.child_price}
                onChange={handleSubPackageChange}
                type="number"
              />
              <Box
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <TextField
                  margin="dense"
                  label="Adult Activities"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={newHighlight}
                  onChange={handleHighlightChange}
                />

                <IconButton
                  onClick={handleAddHighlight}
                  disabled={currentSubPackage.adult_activities?.length >= 25}
                  sx={{ color: "#867AE9" }}
                >
                  <AddCircle />
                </IconButton>
              </Box>
              <Box>
                {currentSubPackage.adult_activities?.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}) {activity}
                    </Typography>

                    <IconButton onClick={() => handleRemoveHighlights(index)}>
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <TextField
                  margin="dense"
                  label="Child Activities"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={newChildActivities}
                  onChange={handleChildActivitiesChange}
                />

                <IconButton
                  onClick={handleAddChildActivities}
                  disabled={currentSubPackage.child_activities?.length >= 25}
                  sx={{ color: "#867AE9" }}
                >
                  <AddCircle />
                </IconButton>
              </Box>

              <Box>
                {currentSubPackage.child_activities?.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}) {activity}
                    </Typography>

                    <IconButton
                      onClick={() => handleRemoveChildActivities(index)}
                    >
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <TextField
                  margin="dense"
                  label="Add-Ons"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={newAddOn}
                  onChange={handleAddOnChange}
                />

                <IconButton
                  onClick={handleAddAddOn}
                  disabled={currentSubPackage.addOn?.length >= 25}
                  sx={{ color: "#867AE9" }}
                >
                  <AddCircle />
                </IconButton>
              </Box>
              <Box>
                {currentSubPackage.addOn?.map((addOn, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}) {addOn}
                    </Typography>

                    <IconButton onClick={() => handleRemoveAddOn(index)}>
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
              >
                <TextField
                  margin="dense"
                  label="Add Facilities"
                  fullWidth
                  size="small"
                  variant="outlined"
                  value={newFacilitie}
                  onChange={handleFacilitieChange}
                />

                <IconButton
                  onClick={handleAddFacilitie}
                  disabled={currentSubPackage.facilities?.length >= 5}
                  sx={{ color: "#867AE9" }}
                >
                  <AddCircle />
                </IconButton>
              </Box>
              <Box>
                {currentSubPackage.facilities?.map((facilitie, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {index + 1}) {facilitie}
                    </Typography>

                    <IconButton onClick={() => handleRemoveFacilitie(index)}>
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setSubPackageDialogOpen(false)}
                variant="conatained"
                style={{
                  background: "#686D76",
                  color: "white",
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSubPackage}
                variant="contained"
                style={{ background: "#867AE9", textTransform: "none" }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity="warning"
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>

          {/* Delete confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this plan?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={confirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ marginTop: 2 }}>
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                adminRole={adminRole}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
