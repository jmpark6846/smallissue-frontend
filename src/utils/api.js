import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers:{ 'Content-Type': 'application/json'},
  withCredentials: true,
})

let isTokenRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = () => {
  refreshSubscribers.map((callback) => callback());
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

api.interceptors.response.use(response=>response, async error=> {
  const { response, config } = error
  if(response.status === 401){
    if(response.statusText === 'Unauthorized'){
      if(response.data.code === 'token_not_valid'){
        return Promise.reject(error)  
      }

      if (!isTokenRefreshing) {
        isTokenRefreshing = true;

        const res = await api.post('accounts/token/refresh/');
        isTokenRefreshing = false;
        onTokenRefreshed();
      }
      const retryOriginalRequest = new Promise((resolve) => {
        addRefreshSubscriber(() => {
          resolve(api(config));
        });
      });
      return retryOriginalRequest;
      
    }
    return Promise.reject(error)  
  }
})

export default api

