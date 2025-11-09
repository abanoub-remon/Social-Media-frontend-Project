import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchAll } from "../features/search/searchSlice";
import { useLocation, Link } from "react-router-dom";
import { Card, Spinner, Container } from "react-bootstrap";
import { toggleLike } from "../features/posts/postsSlice";

export default function SearchResults() {
	const dispatch = useDispatch();
	const location = useLocation();
	const query = new URLSearchParams(location.search).get("q") || "";
	const { users, posts, status } = useSelector((state) => state.search);
	const { likedPosts } = useSelector((state) => state.posts);

	useEffect(() => {
		const fetchData = async () => {
			if (!query.trim()) return;

			try {
				await dispatch(searchAll(query));

				const usersRes = await fetch("https://dummyjson.com/users?limit=150");
				const usersData = await usersRes.json();
				const usersList = usersData.users;

				dispatch({
					type: "search/attachUserData",
					payload: usersList,
				});
			} catch (error) {
				console.error("Error fetching search data:", error);
			}
		};

		fetchData();
	}, [dispatch, query]);

	const isLiked = (postId) =>
		likedPosts.some((item) => item.postId === postId && item.liked);

	return (
		<Container
			className="py-4 dark-cont"
			style={{
				backgroundColor: "#f0f2f5",
				minHeight: "100vh",
				padding: "30px 15px",
			}}
		>
			<h3 className="fw-bold text-primary mb-4">
				Search results for: <span className="text-dark">"{query}"</span>
			</h3>

			{status === "loading" && (
				<div className="text-center my-5">
					<Spinner animation="border" variant="primary" />
				</div>
			)}

			{status === "succeeded" && (
				<>
					{/* Users Section */}
					<h5 className="fw-semibold text-secondary mb-3">Users</h5>
					{users.length > 0 ? (
						users.map((u) => (
							<Card
								key={u.id}
								className="mb-3 shadow-sm border-0"
								style={{
									borderRadius: "15px",
									background: "white",
									padding: "15px",
								}}
							>
								<div className="d-flex align-items-center gap-3">
									<img
										src={
											u.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
										}
										alt={u.firstName}
										width={50}
										height={50}
										className="rounded-circle border"
										style={{ objectFit: "cover" }}
									/>
									<div>
										<Link
											to={`/profile/${u.id}`}
											className="fw-semibold text-decoration-none text-primary"
										>
											{u.firstName} {u.lastName}
										</Link>
										<p className="text-muted mb-0">@{u.username}</p>
									</div>
								</div>
							</Card>
						))
					) : (
						<p className="text-muted">No users found.</p>
					)}

					<hr className="my-4" />

					{/* Posts Section */}
					<h5 className="fw-semibold text-secondary mb-3">Posts</h5>
					{posts.length > 0 ? (
						posts.map((p) => (
							<Card
								key={p.id}
								className="mb-3 shadow-sm border-0"
								style={{
									borderRadius: "15px",
									background: "white",
									padding: "15px",
								}}
							>
								<div className="d-flex align-items-center gap-2 mb-2">
									<img
										src={
											p.user?.image ||
											"https://cdn-icons-png.flaticon.com/512/149/149071.png"
										}
										alt={p.user?.name || "User"}
										width={40}
										height={40}
										className="rounded-circle border"
										style={{ objectFit: "cover" }}
									/>
									<Link
										to={`/profile/${p.user?.id || p.userId}`}
										className="text-primary text-decoration-none fw-semibold"
									>
										{p.user?.name || "Unknown User"}
									</Link>
								</div>

								<Link to={`/post/${p.id}`} className="text-dark text-decoration-none">
									<h6 className="fw-bold mb-1">{p.title}</h6>
									<p className="text-muted mb-2">{p.body}</p>
								</Link>

								<div className="d-flex align-items-center gap-2">
									<button
										onClick={() => dispatch(toggleLike(p.id))}
										className="btn btn-sm border-0 p-0"
										style={{
											background: "none",
											color: isLiked(p.id) ? "red" : "#555",
										}}
									>
										<i
											className={`fa-${isLiked(p.id) ? "solid" : "regular"} fa-heart me-1`}
										></i>
										{typeof p.reactions === "number"
											? p.reactions
											: p.reactions?.likes ?? 0}
									</button>
								</div>
							</Card>
						))
					) : (
						<p className="text-muted">No posts found.</p>
					)}
				</>
			)}

			{status === "failed" && (
				<p className="text-danger mt-4">Error loading search results.</p>
			)}
		</Container>
	);
}
