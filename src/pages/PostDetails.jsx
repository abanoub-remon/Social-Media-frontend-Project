import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleLike } from "../features/posts/postsSlice";
import {
	fetchComments,
	addLocalComment,
} from "../features/comments/commentsSlice";
import axios from "axios";
import { Button, Form, Spinner } from "react-bootstrap";

export default function PostDetails() {
	const { id } = useParams();
	const dispatch = useDispatch();

	const { posts, status } = useSelector((state) => state.posts);
	const commentsByPost = useSelector((state) => state.comments.commentsByPost);
	const user = useSelector((state) => state.auth.user);

	const post = posts.find((p) => p.id === Number(id));

	useEffect(() => {
		const fetchSinglePost = async () => {
			if (!post) {
				await axios.get(`https://dummyjson.com/posts/${id}`);
			}
			dispatch(fetchComments(id));
		};
		fetchSinglePost();
	}, [dispatch, id]);

	if (status === "loading" || !post)
		return (
			<div className="d-flex justify-content-center align-items-center vh-100">
				<Spinner animation="border" variant="primary" />
			</div>
		);

	const handleAddComment = (e) => {
		e.preventDefault();
		const text = e.target.comment.value.trim();
		if (!text) return;

		const newComment = {
			id: Date.now(),
			postId: post.id,
			userId: user?.id || 0,
			comment: text,
			user: { username: user?.username || "You" },
		};

		dispatch(addLocalComment({ postId: post.id, comment: newComment }));
		e.target.reset();
	};

	return (
		<div
			className="py-4 dark-cont"
			style={{
				backgroundColor: "#f0f2f5",
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
				padding: "20px",
			}}
		>
			<div style={{ width: "100%", maxWidth: "700px" }}>
				<div
					className="dark-cont-box"
					style={{
						background: "white",
						borderRadius: "15px",
						padding: "20px",
						boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
					}}
				>
					{/* Back to home */}
					<Link
						to="/home"
						style={{
							color: "#007bff",
							textDecoration: "none",
							display: "inline-block",
							marginBottom: "15px",
						}}
					>
						← Back to Home
					</Link>

					{/* User Info */}
					{post.user && (
						<div className="d-flex align-items-center mb-3">
							<img
								src={
									post.user.image ||
									"https://cdn-icons-png.flaticon.com/512/149/149071.png"
								}
								alt={post.user.name}
								className="rounded-circle me-2"
								style={{
									width: "45px",
									height: "45px",
									objectFit: "cover",
									border: "2px solid #eee",
								}}
							/>
							<Link
								to={`/profile/${post.user.id}`}
								className="fw-semibold text-dark text-decoration-none"
							>
								{post.user.name}
							</Link>
						</div>
					)}

					{/* Post Content */}
					<div style={{ marginBottom: "15px" }}>
						<h5 className="fw-bold">{post.title}</h5>
						<p style={{ fontSize: "15px", color: "#333" }}>{post.body}</p>
					</div>

					{/* Like and Comment Buttons */}
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
							onClick={() => dispatch(toggleLike(post.id))}
							style={{
								border: "none",
								background: "transparent",
								fontWeight: "500",
								color: post.liked ? "red" : "#555",
							}}
						>
							<i
								className={`fa-${post.liked ? "solid" : "regular"} fa-heart me-1`}
							></i>
							{typeof post.reactions === "number"
								? post.reactions
								: post.reactions?.likes ?? 0}{" "}
							Likes
						</Button>
					</div>

					{/* Comments Section */}
					<div
						className="dark-comment"
						style={{
							background: "#f9fafb",
							borderRadius: "10px",
							padding: "10px",
							marginTop: "15px",
						}}
					>
						<h6 className="fw-semibold mb-2">Comments</h6>

						{commentsByPost[post.id] ? (
							commentsByPost[post.id].length > 0 ? (
								commentsByPost[post.id].map((c) => (
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
							onSubmit={handleAddComment}
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
				</div>
			</div>
		</div>
	);
}
