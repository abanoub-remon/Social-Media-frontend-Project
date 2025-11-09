import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const searchAll = createAsyncThunk("search/searchAll", async (query) => {
	const [usersRes, postsRes] = await Promise.all([
		axios.get(`https://dummyjson.com/users/search?q=${query}`),
		axios.get(`https://dummyjson.com/posts/search?q=${query}`),
	]);

	const users = usersRes.data.users || [];
	let posts = postsRes.data.posts || [];

	if (users.length > 0) {
		const userIds = users.map((u) => u.id);

		const allPostsRes = await axios.get(`https://dummyjson.com/posts?limit=150`);

		const userPosts = allPostsRes.data.posts.filter((p) =>
			userIds.includes(p.userId)
		);

		const combined = [...posts, ...userPosts];
		posts = combined.filter(
			(p, index, self) => index === self.findIndex((x) => x.id === p.id)
		);
	}

	return { users, posts, query };
});

const searchSlice = createSlice({
	name: "search",
	initialState: {
		query: "",
		users: [],
		posts: [],
		status: "idle",
		error: null,
	},
	reducers: {
		attachUserData: (state, action) => {
			const usersList = action.payload;
			state.posts = state.posts.map((post) => {
				const u = usersList.find((x) => x.id === post.userId);
				return {
					...post,
					user: u
						? {
								id: u.id,
								name: `${u.firstName} ${u.lastName}`,
								image: u.image,
						  }
						: null,
				};
			});
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(searchAll.pending, (state) => {
				state.status = "loading";
			})
			.addCase(searchAll.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.query = action.payload.query;
				state.users = action.payload.users;
				state.posts = action.payload.posts;
			})
			.addCase(searchAll.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			});
	},
});

export default searchSlice.reducer;
