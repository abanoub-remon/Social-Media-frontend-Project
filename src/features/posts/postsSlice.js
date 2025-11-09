import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
	const postsRes = await axios.get("https://dummyjson.com/posts?limit=50");
	const usersRes = await axios.get("https://dummyjson.com/users?limit=100");

	const users = usersRes.data.users;

	const posts = postsRes.data.posts
		.map((p) => {
			const user = users.find((u) => u.id === p.userId);
			return user
				? {
						...p,
						user: {
							id: user.id,
							name: `${user.firstName} ${user.lastName}`,
							username: user.username,
							image: user.image,
						},
				  }
				: null;
		})
		.filter(Boolean);
	return posts;
});

export const addPost = createAsyncThunk("posts/addPost", async (postData) => {
	const res = await axios.post("https://dummyjson.com/posts/add", postData);
	return res.data;
});

const savedLikes = JSON.parse(localStorage.getItem("likedPosts")) || [];
const currentUser = JSON.parse(localStorage.getItem("user"));
const currentUserId = currentUser?.id || 0;


const postsSlice = createSlice({
	name: "posts",
	initialState: {
		posts: [],
		status: "idle",
		error: null,
		likedPosts: savedLikes,
		userId: currentUserId,
	},
	reducers: {
		toggleLike: (state, action) => {
			const postId = action.payload;
			const post = state.posts.find((p) => p.id === postId);
			if (post) {
				post.liked = !post.liked;

				if (typeof post.reactions === "number") {
					post.reactions += post.liked ? 1 : -1;
				} else if (post.reactions?.likes !== undefined) {
					post.reactions.likes += post.liked ? 1 : -1;
				}

				const filteredLikes = state.likedPosts.filter(
					(item) => !(item.postId === postId && item.userId === state.userId)
				);

				if (post.liked) {
					filteredLikes.push({ postId, userId: state.userId, liked: true });
				}

				state.likedPosts = filteredLikes;
				localStorage.setItem("likedPosts", JSON.stringify(filteredLikes));
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPosts.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchPosts.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.posts = action.payload.map((p) => ({
					...p,
					liked: state.likedPosts.some(
						(item) =>
							item.postId === p.id && item.userId === state.userId && item.liked
					),
				}));
			})
			.addCase(fetchPosts.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})

			.addCase(addPost.fulfilled, (state, action) => {
				const newPost = {
					...action.payload,
					user: {
						id: currentUser?.id || 0,
						name: `${currentUser?.firstName || "You"} ${currentUser?.lastName || ""}`,
						username: currentUser?.username || "you",
						image:
							currentUser?.image ||
							"https://cdn-icons-png.flaticon.com/512/149/149071.png",
					},
					reactions: 0,
					liked: false,
				};

				state.posts.unshift(newPost);
				localStorage.setItem("localPosts", JSON.stringify(state.posts));
			});
	},
});

export const { toggleLike } = postsSlice.actions;
export default postsSlice.reducer;
