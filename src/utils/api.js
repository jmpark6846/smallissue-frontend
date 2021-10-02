import axios from "axios";
import token from "../store/token";
import user from '../store/user';

const api = axios.create({
  baseURL: 'http://localhost:8000/',//process.env.BASE_URL,
  headers:{ 'Content-Type': 'application/json'},
  withCredentials: true,
})

let isTokenRefreshing = false;
let refreshQueue = [];


api.interceptors.response.use(response=>response, async error=> {
  const { response, config } = error
  const origianlRequest = config

  if(response.status === 401 && response.statusText === 'Unauthorized'){    
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
        console.error(err);
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

  // logout
  user.set(null);
  return Promise.reject(error)  
})

export default api

