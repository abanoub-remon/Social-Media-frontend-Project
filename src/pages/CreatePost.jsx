import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../features/posts/postsSlice";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Spinner } from "react-bootstrap";

export default function CreatePost() {
	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { status } = useSelector((state) => state.posts);
	const user = useSelector((state) => state.auth.user);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const newPost = {
			title,
			body,
			userId: user?.id || 1,
			user: {
				id: user?.id || 1,
				name: `${user?.firstName || user?.username || "Unknown"} ${
					user?.lastName || ""
				}`,
				image:
					user?.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
			},
			reactions: 0,
		};

		await dispatch(addPost(newPost));
		navigate("/home");
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
					maxWidth: "600px",
					borderRadius: "15px",
					boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
					backgroundColor: "white",
				}}
			>
				<Card.Body>
					<h4 className="fw-bold mb-3 text-center text-primary">Create New Post</h4>

					{/* User Info */}
					<div className="d-flex align-items-center mb-3">
						<img
							src={
								user?.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
							}
							alt={user?.username || "User"}
							className="rounded-circle me-2"
							style={{
								width: "50px",
								height: "50px",
								objectFit: "cover",
								border: "2px solid #eee",
							}}
						/>
						<div>
							<p className="m-0 fw-semibold">
								{user?.firstName ? `${user.firstName} ${user.lastName}` : "You"}
							</p>
							<small className="text-muted">Share your thoughts with friends 👋</small>
						</div>
					</div>

					{/* Post Form */}
					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Control
								className="dark-input"
								type="text"
								placeholder="Post title..."
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								style={{
									borderRadius: "10px",
									border: "1px solid #ddd",
									padding: "10px",
								}}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Control
								className="dark-input"
								as="textarea"
								rows={4}
								placeholder="What's on your mind?"
								value={body}
								onChange={(e) => setBody(e.target.value)}
								required
								style={{
									borderRadius: "10px",
									border: "1px solid #ddd",
									padding: "10px",
								}}
							/>
						</Form.Group>

						<div className="d-flex justify-content-end">
							<Button
								variant="primary"
								type="submit"
								disabled={status === "loading"}
								className="rounded-pill px-4"
							>
								{status === "loading" ? (
									<>
										<Spinner as="span" animation="border" size="sm" className="me-2" />
										Posting...
									</>
								) : (
									"Post"
								)}
							</Button>
						</div>
					</Form>
				</Card.Body>
			</Card>
		</div>
	);
}
