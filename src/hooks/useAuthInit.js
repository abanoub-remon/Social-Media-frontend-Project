import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";

export default function useAuthInit() {
	const dispatch = useDispatch();

	useEffect(() => {
		const token = localStorage.getItem("token");
		const user = localStorage.getItem("user");

		if (token && user) {
			dispatch(setCredentials({ user: JSON.parse(user), token }));
		}
	}, [dispatch, localStorage.getItem("token")]);
}
