import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  private authService = inject(AuthService);

  usuarioAtual = this.authService.usuarioAtual;
  estaLogado = this.authService.estaLogado;
  ehAdmin = this.authService.ehAdmin;
  token = this.authService.token;

  realizarLogin(email: string, senha: string): boolean {
    return this.authService.login(email, senha);
  }

  sair() {
    this.authService.logout();
  }

  obterToken(): string | null {
    return this.authService.obterToken();
  }

  obterPerfil() {
    return this.authService.obterPerfil();
  }
}