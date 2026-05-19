export const initialStore = () => {
	return {
		token: localStorage.getItem("token") || null,
		user: null
	};
};

export default function storeReducer(store, action = {}) {

	switch(action.type){

		case "set_token":

			return {
				...store,
				token: action.payload
			};

		case "set_user":

			return {
				...store,
				user: action.payload
			};

		case "logout":

			localStorage.removeItem("token");

			return {
				...store,
				token: null,
				user: null
			};

		default:
			throw Error("Unknown action.");
	}
}