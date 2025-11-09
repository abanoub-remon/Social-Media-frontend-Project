import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async (credentials, thunkAPI) => {
		try {
			const response = await api.post("/auth/login", credentials);
			const data = response.data;
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data));
			return data;
		} catch (err) {
			return thunkAPI.rejectWithValue(err.response?.data);
		}
	}
);

const initialState = {
	user: JSON.parse(localStorage.getItem("user")) || null,
	token: localStorage.getItem("token") || null,
	status: "idle",
	error: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (state, action) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
		},
		logout: (state) => {
			state.user = null;
			state.token = null;
			localStorage.removeItem("user");
			localStorage.removeItem("token");
		},
	},

	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload;
				state.token = action.payload.token;
				localStorage.setItem("user", JSON.stringify(action.payload));
				localStorage.setItem("token", action.payload.token);
			})

			.addCase(loginUser.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload?.message || "Login failed. Please try again.";
			});
	},
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
