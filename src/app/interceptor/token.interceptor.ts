import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("token");
  const newRequest = req.clone({
    setHeaders:{
      Authorization:`${token}`
    }
  })
  return next(newRequest);
};
