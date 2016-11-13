export const LOGIN_DATA_LOAD = 'LOGIN_DATA_LOAD';
export const LOGIN_DATA_SUCCESS = 'LOGIN_DATA_SUCCESS';
export const LOGIN_DATA_FAIL = 'LOGIN_DATA_FAIL';

export const GET_PUB_LOAD = 'GET_PUB_LOAD';
export const GET_PUB_SUCCESS = 'GET_PUB_SUCCESS';
export const GET_PUB_FAIL = 'GET_PUB_FAIL';

export const POST_USER_LOAD = 'POST_USER_LOAD';
export const POST_USER_SUCCESS = 'POST_USER_SUCCESS';
export const POST_USER_FAIL = 'POST_USER_FAIL';

export const POST_DISCUSSION_LOAD = 'POST_DISCUSSION_LOAD';
export const POST_DISCUSSION_SUCCESS = 'POST_DISCUSSION_SUCCESS';
export const POST_DISCUSSION_FAIL = 'POST_DISCUSSION_FAIL';

export const SET_CLONE_SUCCESS = 'SET_CLONE_SUCCESS';

export const SET_PR_SUCCESS = 'SET_PR_SUCCESS';

export const ACCEPT_PR_SUCCESS = 'ACCEPT_PR_SUCCESS';

export function login() {
	return (dispatch) => {
		dispatch({ type: LOGIN_DATA_LOAD });

		return clientFetch('/api/login')
		.then((result) => {
			dispatch({ type: LOGIN_DATA_SUCCESS, result });
		})
		.catch((error) => {
			console.log(error);
			dispatch({ type: LOGIN_DATA_FAIL, error });
		});
	};
}

export function getPub(slug) {
	return (dispatch) => {
		dispatch({ type: GET_PUB_LOAD });

		return clientFetch('/api/getPub/' + slug)
		.then((result) => {
			dispatch({ type: GET_PUB_SUCCESS, result });
		})
		.catch((error) => {
			console.log(error);
			dispatch({ type: GET_PUB_FAIL, error });
		});
	};
}

export function postUser(email, name) {
	return (dispatch) => {
		dispatch({ type: POST_USER_LOAD });

		return clientFetch('/api/user', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email,
				name: name,
			})
		})
		.then((result) => {
			dispatch({ type: POST_USER_SUCCESS, result });
		})
		.catch((error) => {
			console.log(error);
			dispatch({ type: POST_USER_FAIL, error });
		});
	};
}

export function postDiscussion(title, content, pubId, userId, parentId) {
	return (dispatch) => {
		dispatch({ type: POST_DISCUSSION_LOAD });

		// return clientFetch('/api/discussion/' + slug)
		return clientFetch('/api/discussion', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title: title,
				content: content,
				pubId: pubId,
				userId: userId,
				parentId: parentId,
			})
		})
		.then((result) => {
			dispatch({ type: POST_DISCUSSION_SUCCESS, result });
		})
		.catch((error) => {
			console.log(error);
			dispatch({ type: POST_DISCUSSION_FAIL, error });
		});
	};
}

export function setClone(parentTitle, parentId) {
	return {
		type: SET_CLONE_SUCCESS,
		parentTitle: parentTitle,
		parentId: parentId
	};
}

export function submitPR(newPR) {
	return {
		type: SET_PR_SUCCESS,
		newPR: newPR,
	};
}

export function acceptPR(newVersion) {
	return {
		type: ACCEPT_PR_SUCCESS,
		newVersion: newVersion,
	};
}
