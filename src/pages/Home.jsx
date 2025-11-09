import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, toggleLike } from "../features/posts/postsSlice";
import {
	fetchComments,
	addLocalComment,
} from "../features/comments/commentsSlice";
import { Link } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";

export default function Home() {
	const dispatch = useDispatch();
	const { posts, status } = useSelector((state) => state.posts);
	const commentsByPost = useSelector((state) => state.comments.commentsByPost);
	const user = useSelector((state) => state.auth.user);
	const [openComments, setOpenComments] = useState({});

	useEffect(() => {
		if (status === "idle") dispatch(fetchPosts());
	}, [status, dispatch]);

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
			userId: user?.id || 0,
			comment: text,
			user: { username: user?.username || "You" },
		};

		dispatch(addLocalComment({ postId, comment: newComment }));
		e.target.reset();
	};

	if (status === "loading")
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
			<div style={{ width: "100%", maxWidth: "650px" }}>
				{posts.map((p) => (
					<div key={p.id} className="post-card">
						{/* User Info */}
						{p.user && (
							<div className="d-flex align-items-center mb-3">
								<img
									src={
										p.user.image ||
										"https://cdn-icons-png.flaticon.com/512/149/149071.png"
									}
									alt={p.user.name}
									className="rounded-circle me-2"
									style={{
										width: "40px",
										height: "40px",
										objectFit: "cover",
										border: "2px solid #eee",
									}}
								/>
								<div>
									<Link
										to={`/profile/${p.user.id}`}
										className="fw-semibold text-dark text-decoration-none"
									>
										{p.user.name}
									</Link>
								</div>
							</div>
						)}

						{/* Post Content */}
						<div
							style={{
								fontSize: "15px",
								lineHeight: "1.6",
								marginBottom: "10px",
							}}
						>
							<Link to={`/post/${p.id}`} className="text-dark text-decoration-none">
								<h5 className="fw-bold">{p.title}</h5>
								<p>{p.body}</p>
							</Link>
						</div>

						{/* Like + Comment Buttons */}
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
								className="dark-cont-box "
								style={{
									background: "#f9fafb",
									borderRadius: "10px",
									padding: "10px",
								}}
							>
								{commentsByPost[p.id] ? (
									commentsByPost[p.id].length > 0 ? (
										commentsByPost[p.id].map((c) => (
											<div key={c.id} className="mb-2 dark-comment">
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
				))}
			</div>
		</div>
	);
}
