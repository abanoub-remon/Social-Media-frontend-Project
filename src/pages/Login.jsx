import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Spinner } from "react-bootstrap";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { token, status, error } = useSelector((state) => state.auth);

	useEffect(() => {
		if (token) {
			navigate("/home");
		}
	}, [token, navigate]);


	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(loginUser({ username, password }));
	};

	return (
		<div
			className="dark-cont"
			style={{
				backgroundColor: "#f0f2f5",
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				padding: "20px",
			}}
		>
			<Card
				style={{
					width: "100%",
					maxWidth: "400px",
					borderRadius: "15px",
					boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
					backgroundColor: "white",
				}}
			>
				<Card.Body>
					<h3 className="fw-bold mb-3 text-center text-primary">Login</h3>
					<p className="text-center text-muted mb-4">
						Welcome back! Please log in to continue 🚀
					</p>

					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Username</Form.Label>
							<Form.Control
								type="text"
								placeholder="Enter your username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								style={{
									borderRadius: "10px",
									border: "1px solid #ddd",
									padding: "10px",
								}}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label className="fw-semibold">Password</Form.Label>
							<Form.Control
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								style={{
									borderRadius: "10px",
									border: "1px solid #ddd",
									padding: "10px",
								}}
							/>
						</Form.Group>

						{error && <p className="text-danger text-center small mb-2">{error}</p>}

						<div className="d-grid mt-4">
							<Button
								variant="primary"
								type="submit"
								disabled={status === "loading"}
								className="rounded-pill fw-semibold"
							>
								{status === "loading" ? (
									<>
										<Spinner as="span" animation="border" size="sm" className="me-2" />
										Logging in...
									</>
								) : (
									"Login"
								)}
							</Button>
						</div>
					</Form>
				</Card.Body>
			</Card>
		</div>
	);
}
