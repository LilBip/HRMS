import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContexts";
import { login, LoginCredentials } from "../api/authApi";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const account = await login(credentials);
      if (account) {
        setUser({
          token: account.token || account.id,
          id: account.id,
          username: account.username,
          fullName: account.fullName,
          role: account.role,
          email: account.email,
        });
        navigate("/");
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#181a1f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 3,
            bgcolor: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: "#f7e9e9",
              mb: 2,
              fontWeight: "bold",
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Sign in to become a hero
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
              sx={{
                "& label": { color: "white" },
                "& input": { color: "white" },
                "& .MuiInput-underline:before": {
                  borderBottomColor: "white",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottomColor: "white",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "white",
                },
              }}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      sx={{ color: "white" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& label": { color: "white" },
                "& input": { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "white" },
                  "&:hover fieldset": { borderColor: "white" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: "#00A8E8",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1rem",
                "&:hover": {
                  bgcolor: "#0077B6",
                },
              }}
            >
              Sign In
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate("/register")}
              sx={{ color: "#00A8E8" }}
            >
              Đăng ký tài khoản mới
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
