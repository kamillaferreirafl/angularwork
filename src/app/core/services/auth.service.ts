import { Injectable, signal, computed } from '@angular/core';

export interface Usuario {
  email: string;
  perfil?: string;
  eAdmin?: boolean;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioSignal = signal<Usuario | null>(this.obterUsuarioSalvo());
  private tokenSignal = signal<string | null>(this.obterTokenSalvo());

  // Signals expostos
  usuarioAtual = computed(() => this.usuarioSignal());
  usuario = computed(() => this.usuarioSignal());
  estaLogado = computed(() => this.usuarioSignal() !== null);
  ehAdmin = computed(() => this.usuarioSignal()?.eAdmin ?? false);
  token = computed(() => this.tokenSignal());

  // Retorna boolean para satisfazer o retorno retornado no Facade
  login(email: string, senha?: string): boolean {
    const eAdmin = email.includes('admin');
    const tokenGerado = 'fake-jwt-token';
    const usuario: Usuario = { 
      email, 
      eAdmin, 
      perfil: eAdmin ? 'ADMIN' : 'CLIENTE',
      token: tokenGerado 
    };

    this.usuarioSignal.set(usuario);
    this.tokenSignal.set(tokenGerado);
    
    localStorage.setItem('usuario_logado', JSON.stringify(usuario));
    localStorage.setItem('token', tokenGerado);

    return true;
  }

  logout(): void {
    this.usuarioSignal.set(null);
    this.tokenSignal.set(null);
    
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('token');
  }

  // Métodos expostos exigidos pelo AuthFacade
  obterPerfil(): string {
    return this.usuarioSignal()?.perfil || 'CLIENTE';
  }

  obterToken(): string | null {
    return this.tokenSignal();
  }

  private obterUsuarioSalvo(): Usuario | null {
    const salvo = localStorage.getItem('usuario_logado');
    return salvo ? JSON.parse(salvo) : null;
  }

  private obterTokenSalvo(): string | null {
    return localStorage.getItem('token');
  }
}