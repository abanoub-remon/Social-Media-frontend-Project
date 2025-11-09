import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, setCredentials } from "../features/auth/authSlice";
import { useState, useEffect } from "react";
import axios from "axios";
import {
	Navbar,
	Nav,
	Container,
	Form,
	Button,
	Dropdown,
	Image,
} from "react-bootstrap";

export default function AppNavbar() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useSelector((state) => state.auth);

	const [query, setQuery] = useState("");
	const [results, setResults] = useState({ users: [], posts: [] });
	const [showResults, setShowResults] = useState(false);

	// Dark Mode State
	const [isDark, setIsDark] = useState(
		localStorage.getItem("darkMode") === "true"
	);
	useEffect(() => {
		document.body.classList.toggle("dark-mode", isDark);
		localStorage.setItem("darkMode", isDark);
	}, [isDark]);
	const toggleTheme = () => setIsDark(!isDark);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		const token = localStorage.getItem("token");

		if (storedUser && token && !user) {
			dispatch(setCredentials({ user: JSON.parse(storedUser), token }));
		}
	}, [dispatch, user]);

	useEffect(() => {
		setQuery("");
		setShowResults(false);
	}, [location.pathname]);

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.trim().length < 2) {
				setShowResults(false);
				return;
			}
			try {
				// search both users and posts
				const [usersRes, postsRes] = await Promise.all([
					axios.get(`https://dummyjson.com/users/search?q=${query}`),
					axios.get(`https://dummyjson.com/posts/search?q=${query}`),
				]);

				let users = usersRes.data.users || [];
				let posts = postsRes.data.posts || [];

				if (users.length > 0) {
					const userIds = users.map((u) => u.id);
					const allPostsRes = await axios.get(
						"https://dummyjson.com/posts?limit=150"
					);
					const userPosts = allPostsRes.data.posts.filter((p) =>
						userIds.includes(p.userId)
					);
					const combined = [...posts, ...userPosts];
					posts = combined.filter(
						(p, index, self) => index === self.findIndex((x) => x.id === p.id)
					);
				}

				setResults({ users, posts });
				setShowResults(true);
			} catch (err) {
				console.error("Search error:", err);
			}
		}, 400);

		return () => clearTimeout(timer);
	}, [query]);

	const handleLogout = () => {
		dispatch(logout());
		navigate("/login");
	};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		if (!query.trim()) return;
		navigate(`/search?q=${query.trim()}`);
		setShowResults(false);
		setQuery("");
	};

	return (
		<Navbar
			bg="light"
			expand="lg"
			className="shadow-sm border-bottom sticky-top"
			style={{ zIndex: 1000 }}
		>
			<Container fluid className="px-3 gap-2">
				<Navbar.Brand
					as={Link}
					to="/home"
					className="fw-bold text-primary d-flex align-items-center gap-2"
					style={{ fontSize: "1.25rem" }}
				>
					<i className="fa-solid fa-hashtag text-primary"></i> SocialApp
				</Navbar.Brand>

				<Navbar.Toggle aria-controls="responsive-navbar-nav" />
				<Navbar.Collapse
					id="responsive-navbar-nav"
					className="justify-content-between"
				>
					{/* Search bar only visible when user is logged in */}
					{user && (
						<div style={{ position: "relative", flex: 1, textAlign: "center" }}>
							<Form
								className="d-flex mx-auto position-relative"
								onSubmit={handleSearchSubmit}
								style={{ maxWidth: "400px", width: "100%" }}
							>
								<Form.Control
									type="search"
									placeholder="Search users or posts..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									className="rounded-pill px-3 shadow-sm searchInput"
								/>
								<Button
									type="submit"
									variant="outline-primary"
									className="rounded-pill ms-2"
								>
									<i className="fa-solid fa-magnifying-glass"></i>
								</Button>

								{/* Search Results Dropdown */}
								{showResults && (
									<div
										className="position-absolute bg-white p-2 rounded shadow-sm SearchResultsDropdown"
										style={{
											top: "110%",
											left: 0,
											width: "100%",
											zIndex: 2000,
											fontSize: "0.9rem",
										}}
									>
										<strong>👤 Users:</strong>
										{results.users.length > 0 ? (
											results.users.slice(0, 3).map((u) => (
												<div key={u.id}>
													<Link
														to={`/profile/${u.id}`}
														style={{
															textDecoration: "none",
															color: "#007bff",
														}}
														onClick={() => setShowResults(false)}
													>
														{u.firstName} {u.lastName}
													</Link>
												</div>
											))
										) : (
											<p className="text-muted mb-1">No users found</p>
										)}

										<hr className="my-2" />
										<strong>📝 Posts:</strong>
										{results.posts.length > 0 ? (
											results.posts.slice(0, 3).map((p) => (
												<div key={p.id}>
													<Link
														to={`/post/${p.id}`}
														style={{
															textDecoration: "none",
															color: "#000",
														}}
														onClick={() => setShowResults(false)}
													>
														{p.title}
													</Link>
												</div>
											))
										) : (
											<p className="text-muted mb-1">No posts found</p>
										)}
									</div>
								)}
							</Form>
						</div>
					)}

					<Nav className="d-flex align-items-center gap-3">
						{user ? (
							<>
								<Nav.Link as={Link} to="/create-post" className="text-dark">
									<i className="fa-solid fa-square-plus fs-5"></i> Create Post
								</Nav.Link>

								<Dropdown align="end">
									<Dropdown.Toggle
										variant="light"
										className="d-flex align-items-center gap-2 border-0 bg-transparent"
									>
										<Image
											src={
												user.image ||
												"https://cdn-icons-png.flaticon.com/512/149/149071.png"
											}
											roundedCircle
											width={32}
											height={32}
										/>
										<span className="fw-semibold text-dark userDropdown">
											{user.username}
										</span>
									</Dropdown.Toggle>

									<Dropdown.Menu className="drop-profile-menu">
										<Dropdown.Item as={Link} to={`/profile/${user.id}`}>
											<i className="fa-solid fa-user me-2 text-primary"></i> Profile
										</Dropdown.Item>
										<Dropdown.Divider />
										<Dropdown.Item onClick={handleLogout} className="text-danger">
											<i className="fa-solid fa-right-from-bracket me-2"></i> Logout
										</Dropdown.Item>
									</Dropdown.Menu>
								</Dropdown>
							</>
						) : (
							<Button
								as={Link}
								to="/login"
								variant="primary"
								className="rounded-pill px-3 fw-semibold text-white"
							>
								Login
							</Button>
						)}
						{/* Theme Button */}
						<Button
							variant="outline-secondary"
							className="rounded-circle p-2 border-0"
							onClick={toggleTheme}
							title={isDark ? "Light Mode" : "Dark Mode"}
						>
							<i
								className={`fa-solid ${
									isDark ? "fa-sun text-warning" : "fa-moon text-dark"
								}`}
							></i>{" "}
							Theme
						</Button>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
