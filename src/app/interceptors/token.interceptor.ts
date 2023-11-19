import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';

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
            this.toast.warning({detail:"Warning", summary:"Token is expired, Please Login again"});
            this.router.navigate(['login'])
          }
        }
        return throwError(()=> new Error("Some other error occured"))
      })
    );
  }
}

