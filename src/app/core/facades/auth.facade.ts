import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private authService = inject(AuthService);

  get estaLogado(): boolean {
    return this.authService.estaLogado;
  }

  get ehAdmin(): boolean {
    return this.authService.ehAdmin;
  }

  get token(): string | null {
    return this.authService.token;
  }

  login(email: string, senha: string) {
    return this.authService.login(email, senha);
  }

  logout() {
    this.authService.logout();
  }

  // Alias esperado pelo HTTP Interceptor
  sair() {
    this.logout();
  }

  obterToken() {
    return this.authService.obterToken();
  }

  obterPerfil() {
    return this.authService.obterPerfil();
  }
}