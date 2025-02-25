import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import BookingList from "./pages/BookingList";
import Attendence from "./pages/AttendenceList"

import NotFound from "./pages/PageNotFound";
import Grid from "@mui/material/Grid";
import Plans from "./pages/Plans";
import CouponsPage from "./pages/CouponPage";
import ProfilePage from "./pages/ProfilePage";
import { Box } from "@mui/material";
import "./App.css";
import CompanyProfile from "./pages/CompanyProfile";
import ApprovalPage from "./pages/ApprovalPage";
import AdminLogin from "./pages/AdminLogin";
import AddUserPage from "./pages/AddUserPage";
//import RequireAuth from './auth.js/RequireAuth';
//import {ROLES} from './config/roles'
import axios from "axios";
import useAppStore from "./appStore";
import { useEffect, useState } from "react";
import endpoints from "./Endpoints/endpoint";
import PlansPage from "./pages/dumyPage";
import ScannerPage from "./pages/ScannerPage";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import Preloader from "./components/Preloader";
import ReportPage from "./pages/ReportPage";
import Ticket from "./components/Ticket";
import SocialShare from "./components/SocialShare";
import { jwtDecode } from "jwt-decode";
import { use } from "react";

// import AgentRole from "./components/AgentRole";

const App = () => {
  const [loading, setLoading] = useState(true);
  const setCompanyData = useAppStore((state) => state.setCompanyData);

  const [roles, setRoles] = useState({
      isChecker: false,
    });

    const navigate = useNavigate();

  useEffect(() => {
    fetchDetails();
  }, [setCompanyData]);

  useEffect(() => {
      const roleCheck = () => {
        const token = sessionStorage.getItem("jwtToken");
        if (token) {
          const { role } = jwtDecode(token);
          setRoles({
            isChecker: role === "checker",
          });
        }
      };
      roleCheck();
    }, []);

    useEffect(() => {
      if (roles.isChecker) {
        navigate("/scanner");
      }
    }, [roles.isChecker, navigate]);

    useEffect(() => {
      if(sessionStorage.getItem("jwtToken") === null){
        navigate("/login");
      }
    }, [navigate]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/admin/adminprofile`
      );

      setCompanyData(response.data?.adminprofile[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setLoading(true);
      alert("Something Went Wrong");
    }
  };
  if (loading) {
    return <Preloader />;
  }
  return (
    <Box sx={{ background: "#EEF1FF"}}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route
          path="/"
          element={roles.isChecker ? <Navigate to="/scanner" /> : <Attendence />}
        />
       

        <Route path="/dashboard" element={<Home />} />

        <Route path="/bookings" element={<BookingList />} />
        <Route path="/" element={<Attendence />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/companyprofile" element={<CompanyProfile />} />
        <Route path="/reportpage" element={<ReportPage/>}/>
        <Route path="/approval" element={<ApprovalPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/bookingconfirm" element={<BookingConfirmPage />} />
        <Route path="/addadminchecker" element={<AddUserPage />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route path="/sharelink" element={<SocialShare />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
};

export default App;
