import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("token");
  const expirationTime = localStorage.getItem("tokenExpiration");

  if (token && expirationTime) {
    const currentTime = new Date().getTime();
    
    // Check if the token is expired
    if (currentTime > parseInt(expirationTime, 10)) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      alert('Session expired. Please log in again.');
      return next(req);
    }
  }

  const newRequest = req.clone({
    setHeaders: {
      Authorization: `${token}`
    }
  });

  return next(newRequest);
};
