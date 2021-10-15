import axios from "axios";
import {getNotificationsContext} from 'svelte-notifications';
import { navigate } from "svelte-navigator";
import { get } from "svelte/store";
import { appNoti, user } from "../store";
import { READONLY_NOTI } from "./common";

const api = axios.create({
  headers:{ 'Content-Type': 'application/json'},
  withCredentials: true,
  
})

let isTokenRefreshing = false;
let refreshQueue = [];


api.interceptors.response.use(response=>response, async error=> {
  const { response, config } = error
  const origianlRequest = config

  // if(response.status === 500){
  //   navigate('/not_found', { replace: true})
  // }

  if(response.status === 403){
    if(get(user).is_readonly){
      appNoti.update(v=>[ ...v, READONLY_NOTI])
    }
  }
  if(response.status === 401){    
    if(response.data.code === "token_not_valid"){
      return api.post('accounts/logout/')
      .then(res=>{
        user.set(null);
        project.set(null)
        notification.set({
          unread_count: 0,
          unread_list: []
        });
        const from = ($location.state && $location.state.from) || "/login";
        navigate(from, { replace: true });
      })
      .catch(err=>console.error(err))
    }

    if (!isTokenRefreshing) {
      isTokenRefreshing = true;
      
      api.post('accounts/token/refresh/')
      .then(()=>{
        refreshQueue.forEach((p) => p.resolve());
        refreshQueue = [];  
      })
      .catch(err => {
        refreshQueue.forEach(p => p.reject(err));
        refreshQueue = [];
      })
      .finally(()=>{
        isTokenRefreshing = false;
      })
    }

    const retryOriginalRequest = new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: () => resolve(api(origianlRequest)),
        reject: (err) => reject(err)
      })
    });
    return retryOriginalRequest;
  }
  return Promise.reject(error)  
})

export function fileDownload(url, filename){
  return api.get(url, { responseType: 'blob' })
    .then((response)=>{
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    })
}

export default api

