import { Routes, Route } from "react-router-dom";
import useAuthInit from "./hooks/useAuthInit";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import RequireAuth from "./components/RequireAuth";
import PostDetails from "./pages/PostDetails";
import SearchResults from "./pages/SearchResults";
import { useSelector } from "react-redux";

function App() {
	useAuthInit();
	const { user, token } = useSelector((state) => state.auth);

	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route
					path="/home"
					element={
						<RequireAuth>
							<Home />
						</RequireAuth>
					}
				/>
				<Route
					path="/profile/:id"
					element={
						<RequireAuth>
							<Profile />
						</RequireAuth>
					}
				/>
				<Route
					path="/create-post"
					element={
						<RequireAuth>
							<CreatePost />
						</RequireAuth>
					}
				/>
				<Route
					path="/post/:id"
					element={
						<RequireAuth>
							<PostDetails />
						</RequireAuth>
					}
				/>
				<Route
					path="/search"
					element={
						<RequireAuth>
							<SearchResults />
						</RequireAuth>
					}
				/>
				<Route
					path="/"
					element={
						<RequireAuth>
							<Home />
						</RequireAuth>
					}
				/>
			</Routes>
		</>
	);
}

export default App;
