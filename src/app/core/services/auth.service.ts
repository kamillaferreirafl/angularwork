import { Injectable, signal } from '@angular/core';

export interface Usuario {
  email: string;
  nome?: string;
  eAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Tipagem atualizada incluindo a propriedade opcional 'nome'
  usuarioAtual = signal<Usuario | null>(null);
  tokenSignal = signal<string | null>(null);

  get estaLogado(): boolean {
    return this.usuarioAtual() !== null;
  }

  get ehAdmin(): boolean {
    return this.usuarioAtual()?.eAdmin ?? false;
  }

  get token(): string | null {
    return this.tokenSignal();
  }

  login(email: string, senha: string, nome?: string): boolean {
    const eAdmin = email.includes('admin');
    this.usuarioAtual.set({ email, nome: nome || 'Usuário', eAdmin });
    this.tokenSignal.set('fake-jwt-token-12345');
    return true;
  }

  loginUsuario(email: string, senha: string, nome?: string) {
    this.usuarioAtual.set({ email, nome: nome || 'Usuário', eAdmin: false });
    this.tokenSignal.set('fake-user-token');
  }

  loginAdmin(email: string, senha: string, nome?: string) {
    this.usuarioAtual.set({ email, nome: nome || 'Admin', eAdmin: true });
    this.tokenSignal.set('fake-admin-token');
  }

  logout() {
    this.usuarioAtual.set(null);
    this.tokenSignal.set(null);
  }

  obterToken(): string | null {
    return this.token;
  }

  obterPerfil() {
    return this.usuarioAtual();
  }
}