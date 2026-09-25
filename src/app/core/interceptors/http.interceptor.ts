import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { AuthFacade } from '../facades/auth.facade';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  const token = authFacade.obterToken();

  const novaReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(novaReq).pipe(
    tap({
      next: (event) => console.log('RESPONSE:', event),
      error: (error) => console.error('ERRO:', error),
    }),
    catchError((error) => {
      if (error.status === 401) {
        authFacade.sair();
        router.navigateByUrl('/login');
      }
      if (error.status === 403) {
        router.navigateByUrl('/produtos');
      }
      return throwError(() => error);
    })
  );
};