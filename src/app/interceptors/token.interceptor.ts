import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { TokenApiModel } from '../models/token-api.model';

@Injectable()
export class TokenInterceptor implements HttpInterceptor{

  constructor(private auth: AuthService, private toast: NgToastService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
   
    const myToken = this.auth.getToken()

    if(myToken){
      req = req.clone({
      setHeaders: {Authorization:`Bearer ${myToken}`}
    })
  }
    return next.handle(req).pipe(
      catchError((err:any)=>{
        if(err instanceof HttpErrorResponse){
          if(err.status === 401){}{
           // this.toast.warning({detail:"Warning", summary:"Token is expired, Please Login again"});
           // this.router.navigate(['login'])
         return this.handleUnAuthorizedError(req, next);
          }
        }
        return throwError(()=> new Error("Some other error occured"))
      })
    );
  }

  handleUnAuthorizedError(req: HttpRequest<any>, next: HttpHandler){
    let tokeApiModel = new TokenApiModel();
    tokeApiModel.acessToken = this.auth.getToken()!;
    tokeApiModel.refreshToken = this.auth.getRefreshToken()!;
    return this.auth.renewToken(tokeApiModel)
    .pipe(
      switchMap((data:TokenApiModel)=>{
        this.auth.storeRefreshToken(data.refreshToken);
        this.auth.storeToken(data.acessToken);
        req = req.clone({
          setHeaders: {Authorization:`Bearer ${data.acessToken}`}  
        })
        return next.handle(req);
      }),
      catchError((err)=>{
        return throwError(()=>{
          this.toast.warning({detail:"Warning", summary:"Token is expired, Please Login again"});
          this.router.navigate(['login'])
        })
      })
    )
  }
}

