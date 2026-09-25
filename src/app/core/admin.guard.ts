import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Removido o () do estaLogado já que ele é um getter/propriedade
  if (authService.estaLogado && authService.usuarioAtual()?.eAdmin) {
    return true;
  }

  router.navigate(['/acesso-negado']);
  return false;
};