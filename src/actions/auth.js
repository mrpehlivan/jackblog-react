import {GET_CAPTCHAURL,LOGIN_SUCCESS,LOGIN_FAILURE,USERINFO_SUCCESS,LOGOUT_USER,USERINFO_FAILURE} from './ActionTypes'
const LOGIN_API = 'http://localhost:9000/auth/'
const API_ROOT = 'http://localhost:9000/api/'
import fetch from 'isomorphic-fetch'
import axios from 'axios'
import { pushState } from 'redux-router'
import cookie from 'react-cookie'

//登录
function loginSuccess(token) {
	return {
		type: LOGIN_SUCCESS,
		token: token
	}
}
function loginFailure(err) {
	return {
		type: LOGIN_FAILURE,
		errMsg : err.error_msg || '登录失败'
	}
}
export function localLogin(userInfo) {
	return (dispatch,getState) =>{
		return fetch(LOGIN_API + 'local',{
			method: 'post',
			credentials: 'include',
			headers: {
			  'Accept': 'application/json',
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify(userInfo)
		}).then(response => response.json().then(json => ({ json, response })))
		  .then(({json,response}) => {
		  	if(!response.ok){
		  		return dispatch(loginFailure(json))
		  	}
		  	//得到token,并存储
		  	cookie.save('token', json.token)
		  	//获取用户信息
		  	dispatch(getUserInfo(json.token))
		  	dispatch(loginSuccess(json.token))
		  	dispatch(pushState(null, '/'))
		  }).catch( err =>{
		  	//登录异常
		  	return dispatch(loginFailure(err))
		  })
	}

}

//获取验证码
export function getCaptchaUrl() {
	return {
		type: GET_CAPTCHAURL,
		captchaUrl: API_ROOT + 'users/getCaptcha?' + Math.random()
	}
}

//获取用户信息
function receiveUserInfo(user) {
	return {
		type: USERINFO_SUCCESS,
		user: user
	}
}
function failureUserInfo() {
	return {
		type: USERINFO_FAILURE
	}
}
export function getUserInfo(token) {
  return (dispatch, getState) => {
    return fetch(API_ROOT + 'users/me', {
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => response.json().then(json => ({ json, response })))
				  .then(({json,response}) => {
				  	if(!response.ok){
				  		return dispatch(failureUserInfo())
				  	}
				  	return dispatch(receiveUserInfo(json))
				  }).catch( err =>{
				  	//登录异常
				  	return dispatch(failureUserInfo())
				  })
   }
}

export function logout() {
  return dispatch => {
  	cookie.remove('token')
    dispatch({type: LOGOUT_USER})
    dispatch(pushState(null, '/'))
  }
}

// axios.post(LOGIN_API + 'local',userInfo, {
// 	//withCredentials: true
// })
//   .then(function (response) {
//     console.log(response);
//   })
//   .catch(function (response) {
//     console.log(response);
//   });