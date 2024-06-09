import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { css, keyframes } from "@emotion/react";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignInSide() {


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (token: string) => {
    // Save the token in local storage
    localStorage.setItem("token", token);
    // // Refresh the browser to trigger navigation
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create an object with the user's email and password
    const credentials = {
      email,
      password,
    };

    try {
      // Send a POST request to your authentication endpoint
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        toast.success("Logged In Successfully");
        // Authentication succeeded
        // Retrieve the user's isAdmin status from the response or your authentication system
        const data = await response.json();
        const token = data.token;
        // Save the token and navigate the user
        handleLoginSuccess(token);
      } else {
        // Authentication failed; you can handle this by displaying an error message to the user
        console.error("Login failed");
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
      console.error("Login error:", error);
    }
  };
  const imageUrls = [
    "https://www.simplilearn.com/ice9/free_resources_article_thumb/data_analyticstrendsmin.jpg",
    "https://assets.toptal.io/images?url=https%3A%2F%2Fbs-uploads.toptal.io%2Fblackfish-uploads%2Fcomponents%2Fblog_post_page%2F4087270%2Fcover_image%2Fregular_1708x683%2F0823-DashboardDesign-Dan-Newsletter-50fe6aeddf1bc0cb40886dd609c47908.png",
    "https://analytics.hbs.edu/wp-content/uploads/sites/15/2020/10/BizAnalytics_vs_Intelligence-Hero.jpg",
  ];
  // Step 3: Set up state for the current image index
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const fadeInOut = keyframes`
  0% { opacity: 0; }
  10% (opacity: 0.2;)
  25% { opacity: 0.5; }
  50% { opacity: 1;}
  75% { opacity: 0.8; }
  80% {opacity: 0.5;}
  90% {opacity: 0.2;}
  100% { opacity: 0; }
`;
  // Step 4: Use useEffect for the image cycling logic
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, 6000); // Change image every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [imageUrls.length]);

  return (
    
    <ThemeProvider theme={defaultTheme}>
              <ToastContainer position="top-right" autoClose={1000} />

      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${imageUrls[currentImageIndex]})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
            animation: `${fadeInOut} 6s infinite`,
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
