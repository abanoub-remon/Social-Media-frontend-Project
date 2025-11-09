import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, toggleLike } from "../features/posts/postsSlice";
import {
	fetchComments,
	addLocalComment,
} from "../features/comments/commentsSlice";
import { Spinner, Button, Form } from "react-bootstrap";
import api from "../api/axios";

export default function Profile() {
	const { id } = useParams();
	const dispatch = useDispatch();
	const { posts, status } = useSelector((state) => state.posts);
	const commentsByPost = useSelector((state) => state.comments.commentsByPost);
	const authUser = useSelector((state) => state.auth.user);
	const [user, setUser] = useState(null);
	const [openComments, setOpenComments] = useState({});

	useEffect(() => {
		async function fetchUser() {
			try {
				const res = await api.get(`/users/${id}`);
				setUser(res.data);
			} catch (err) {
				console.error(err);
			}
		}
		fetchUser();
	}, [id]);

	useEffect(() => {
		if (status === "idle") dispatch(fetchPosts());
	}, [status, dispatch]);

	const userPosts = posts.filter((p) => p.user?.id === Number(id));

	const handleToggleComments = (postId) => {
		setOpenComments((prev) => ({
			...prev,
			[postId]: !prev[postId],
		}));
		if (!commentsByPost[postId]) dispatch(fetchComments(postId));
	};

	const handleAddComment = (e, postId) => {
		e.preventDefault();
		const text = e.target.comment.value.trim();
		if (!text) return;

		const newComment = {
			id: Date.now(),
			postId,
			userId: authUser?.id || 0,
			comment: text,
			user: { username: authUser?.username || "You" },
		};

		dispatch(addLocalComment({ postId, comment: newComment }));
		e.target.reset();
	};

	if (!user || status === "loading")
		return (
			<div className="d-flex justify-content-center align-items-center vh-100">
				<Spinner animation="border" variant="primary" />
			</div>
		);

	return (
		<div
			className="py-4 dark-cont"
			style={{
				backgroundColor: "#f0f2f5",
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
			}}
		>
			<div style={{ width: "100%", maxWidth: "700px" }}>
				{/* Profile Header */}
				<div
					className="dark-cont-box"
					style={{
						background: "white",
						borderRadius: "15px",
						padding: "20px",
						boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
						marginBottom: "25px",
					}}
				>
					<div className="d-flex align-items-center flex-wrap gap-3">
						<img
							src={
								user.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
							}
							alt={user.firstName}
							className="rounded-circle"
							style={{
								width: "100px",
								height: "100px",
								objectFit: "cover",
								border: "3px solid #e0e0e0",
							}}
						/>
						<div>
							<h4 className="fw-bold mb-1">
								{user.firstName} {user.lastName}
							</h4>
							<p className="text-muted mb-1">{user.email}</p>
							<p className="text-muted mb-0">Age: {user.age}</p>
						</div>
					</div>
				</div>

				{/* User Posts */}
				<h5 className="fw-semibold mb-3">Posts by {user.firstName}</h5>
				{userPosts.length === 0 ? (
					<div
						className="dark-cont-box"
						style={{
							background: "white",
							borderRadius: "15px",
							padding: "20px",
							textAlign: "center",
							color: "gray",
						}}
					>
						No posts yet.
					</div>
				) : (
					userPosts.map((p) => (
						<div
							className="dark-cont-box"
							key={p.id}
							style={{
								background: "white",
								borderRadius: "15px",
								padding: "15px 20px",
								marginBottom: "20px",
								boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
							}}
						>
							<div className="d-flex align-items-center mb-3">
								<img
									src={
										p.user?.image ||
										"https://cdn-icons-png.flaticon.com/512/149/149071.png"
									}
									alt={p.user?.name}
									className="rounded-circle me-2"
									style={{
										width: "45px",
										height: "45px",
										objectFit: "cover",
										border: "2px solid #eee",
									}}
								/>
								<div>
									<strong>{p.user?.name}</strong>
								</div>
							</div>

							<div style={{ fontSize: "15px", marginBottom: "10px" }}>
								<Link to={`/post/${p.id}`} className="text-dark text-decoration-none">
									<h6 className="fw-bold">{p.title}</h6>
									<p>{p.body}</p>
								</Link>
							</div>

							{/* Like + Comment */}
							<div
								className="d-flex justify-content-between align-items-center pt-2"
								style={{
									borderTop: "1px solid #eee",
									paddingTop: "10px",
								}}
							>
								<Button
									variant="light"
									size="sm"
									onClick={() => dispatch(toggleLike(p.id))}
									style={{
										border: "none",
										background: "transparent",
										fontWeight: "500",
										color: p.liked ? "red" : "#555",
									}}
								>
									<i className={`fa-${p.liked ? "solid" : "regular"} fa-heart me-1`}></i>
									{typeof p.reactions === "number"
										? p.reactions
										: p.reactions?.likes ?? 0}{" "}
									Likes
								</Button>

								<Button
									variant="light"
									size="sm"
									onClick={() => handleToggleComments(p.id)}
									style={{
										border: "none",
										background: "transparent",
										color: "#555",
										fontWeight: "500",
									}}
								>
									<i className="fa-regular fa-comment me-1"></i>
									{openComments[p.id] ? "Hide" : "Comments"}
								</Button>
							</div>

							{/* Comments */}
							{openComments[p.id] && (
								<div
									className="dark-comment mt-3"
									style={{
										background: "#f9fafb",
										borderRadius: "10px",
										padding: "10px",
									}}
								>
									{commentsByPost[p.id] ? (
										commentsByPost[p.id].length > 0 ? (
											commentsByPost[p.id].map((c) => (
												<div key={c.id} className="mb-2">
													<strong className="text-dark">{c.user?.username || "User"}</strong>
													<p className="mb-0 small text-muted">{c.comment || c.body}</p>
												</div>
											))
										) : (
											<p className="text-muted small mb-2">No comments yet.</p>
										)
									) : (
										<p className="text-muted small">Loading comments...</p>
									)}

									{/* Add Comment */}
									<Form
										onSubmit={(e) => handleAddComment(e, p.id)}
										className="d-flex align-items-center mt-2"
									>
										<Form.Control
											name="comment"
											placeholder="Write a comment..."
											size="sm"
											className="rounded-pill me-2"
											style={{
												background: "white",
												border: "1px solid #ddd",
											}}
										/>
										<Button
											variant="primary"
											size="sm"
											type="submit"
											className="rounded-pill px-3"
										>
											Send
										</Button>
									</Form>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}
