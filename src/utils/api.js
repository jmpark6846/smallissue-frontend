import axios from "axios";
import { navigate } from "svelte-navigator";
import user from '../store/user';

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
  console.log(error)
  if(response.status === 401){    
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

export default api

