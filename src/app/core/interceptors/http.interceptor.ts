import { inject } from '@angular/core';

import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { Router } from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import { AuthFacade } from '../facades/auth.facade';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  

  const apiMegaSport = false;


  if (!apiMegaSport) {
    return next(req);
  }

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      // Sessão não autorizada
      if (error.status === 401) {

        authFacade.sair();

        router.navigate(['/login']);

      }

      // Usuário sem permissão
      if (error.status === 403) {

        router.navigate(['/acesso-negado']);

      }

      return throwError(() => error);

    })

  );

};