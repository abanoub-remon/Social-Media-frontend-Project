import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const savedComments = JSON.parse(localStorage.getItem("commentsByPost")) || {};

export const fetchComments = createAsyncThunk(
	"comments/fetchComments",
	async (postId) => {
		const res = await axios.get(`https://dummyjson.com/comments/post/${postId}`);
		return { postId, comments: res.data.comments };
	}
);

const commentsSlice = createSlice({
	name: "comments",
	initialState: {
		commentsByPost: savedComments,
		status: "idle",
		error: null,
	},
	reducers: {
		addLocalComment: (state, action) => {
			const { postId, comment } = action.payload;
			if (!state.commentsByPost[postId]) {
				state.commentsByPost[postId] = [];
			}
			state.commentsByPost[postId].unshift(comment);
			localStorage.setItem("commentsByPost", JSON.stringify(state.commentsByPost));
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchComments.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchComments.fulfilled, (state, action) => {
				const { postId, comments } = action.payload;
				const existing = state.commentsByPost[postId] || [];
				const merged =
					comments.length > 0
						? [
								...existing,
								...comments.filter((c) => !existing.some((e) => e.id === c.id)),
						  ]
						: existing.length > 0
						? existing
						: [];

				state.commentsByPost[postId] = merged;
				state.status = "succeeded";

				localStorage.setItem(
					"commentsByPost",
					JSON.stringify(state.commentsByPost)
				);
			})
			.addCase(fetchComments.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			});
	},
});

export const { addLocalComment } = commentsSlice.actions;
export default commentsSlice.reducer;
