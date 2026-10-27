import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { AuthService } from './services/auth.service';

export const adminGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Visitante não autenticado
  if (!authService.estaLogado) {
    return router.createUrlTree(['/admin/login']);
  }

  // Administrador autenticado
  if (authService.ehAdmin) {
    return true;
  }

  // Cliente comum não pode acessar o painel
  return router.createUrlTree(['/acesso-negado']);
};