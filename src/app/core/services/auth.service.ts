import { Injectable, signal, computed } from '@angular/core';

export interface Usuario {
  email: string;
  nome?: string;
  eAdmin: boolean;
}

export interface UsuarioCadastrado {
  email: string;
  nome: string;
  perfil: 'ADMIN' | 'CLIENTE';
  dataCadastro: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly chaveUsuarios = 'usuarios_megasport';

  private readonly adminEmail = 'admin@email.com';
  private readonly adminSenha = '1234';

  usuarioAtual = signal<Usuario | null>(null);
  tokenSignal = signal<string | null>(null);

  private usuariosSignal = signal<UsuarioCadastrado[]>(
    this.carregarUsuarios()
  );

  usuarios = computed(() => this.usuariosSignal());

  totalUsuarios = computed(() => this.usuariosSignal().length);

  get estaLogado(): boolean {
    return this.usuarioAtual() !== null;
  }

  get ehAdmin(): boolean {
    return this.usuarioAtual()?.eAdmin ?? false;
  }

  get token(): string | null {
    return this.tokenSignal();
  }

  // CADASTRO DE CLIENTES
  cadastrarUsuario(nome: string, email: string): boolean {
    const emailNormalizado = email.trim().toLowerCase();
    const nomeNormalizado = nome.trim();

    if (!emailNormalizado || !nomeNormalizado) {
      return false;
    }

    if (
      this.usuariosSignal().some(
        usuario => usuario.email === emailNormalizado
      )
    ) {
      return false;
    }

    const novoUsuario: UsuarioCadastrado = {
      email: emailNormalizado,
      nome: nomeNormalizado,
      perfil: 'CLIENTE',
      dataCadastro: new Date().toISOString()
    };

    this.usuariosSignal.update(lista => [...lista, novoUsuario]);

    this.salvarUsuarios();

    return true;
  }

  // LOGIN GERAL
  login(email: string, senha: string, nome?: string): boolean {
    return this.loginUsuario(email, senha, nome);
  }

  // LOGIN DO CLIENTE
  // DEMONSTRAÇÃO: ainda não valida senha.
  loginUsuario(email: string, senha: string, nome?: string): boolean {
    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !senha.trim()) {
      return false;
    }

    if (emailNormalizado === this.adminEmail) {
      return false;
    }

    const usuarioCadastrado = this.usuariosSignal().find(
      usuario => usuario.email === emailNormalizado
    );

    if (!usuarioCadastrado) {
      return false;
    }

    this.usuarioAtual.set({
      email: emailNormalizado,
      nome: usuarioCadastrado.nome,
      eAdmin: false
    });

    this.tokenSignal.set('fake-user-token');

    return true;
  }

  // LOGIN ADMINISTRATIVO
  loginAdmin(email: string, senha: string, nome?: string): boolean {
    const emailNormalizado = email.trim().toLowerCase();

    const credenciaisValidas =
      emailNormalizado === this.adminEmail &&
      senha === this.adminSenha;

    if (!credenciaisValidas) {
      return false;
    }

    this.usuarioAtual.set({
      email: emailNormalizado,
      nome: nome || 'Administrador',
      eAdmin: true
    });

    this.tokenSignal.set('fake-admin-token');

    return true;
  }

  // REMOVER CLIENTE
  removerUsuario(email: string): boolean {
    const emailNormalizado = email.trim().toLowerCase();

    if (emailNormalizado === this.adminEmail) {
      return false;
    }

    this.usuariosSignal.update(lista =>
      lista.filter(usuario => usuario.email !== emailNormalizado)
    );

    this.salvarUsuarios();

    return true;
  }

  logout(): void {
    this.usuarioAtual.set(null);
    this.tokenSignal.set(null);
  }

  obterToken(): string | null {
    return this.token;
  }

  obterPerfil(): Usuario | null {
    return this.usuarioAtual();
  }

  private salvarUsuarios(): void {
    localStorage.setItem(
      this.chaveUsuarios,
      JSON.stringify(this.usuariosSignal())
    );
  }

  private carregarUsuarios(): UsuarioCadastrado[] {
    try {
      const dados = localStorage.getItem(this.chaveUsuarios);

      const usuarios: unknown = dados ? JSON.parse(dados) : [];

      if (!Array.isArray(usuarios)) {
        return [];
      }

      return usuarios.filter(
        (usuario): usuario is UsuarioCadastrado =>
          typeof usuario === 'object' &&
          usuario !== null &&
          typeof usuario.email === 'string' &&
          typeof usuario.nome === 'string' &&
          usuario.perfil === 'CLIENTE'
      );
    } catch {
      return [];
    }
  }
}