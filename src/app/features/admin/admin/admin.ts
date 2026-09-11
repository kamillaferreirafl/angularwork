import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ProdutosService } from '../../../core/services/produtos.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  authService = inject(AuthService);
  private produtosService = inject(ProdutosService);

  // Sinais e métodos de autenticação
  usuarioAtual = computed(() => this.authService.usuarioAtual());
  mensagemPerfil = computed(() => `Usuário autenticado como ${this.usuarioAtual()?.perfil || 'ADMIN'}.`);
  
  // Total dinâmico de produtos cadastrados (usa obterProdutos())
  totalProdutos = computed(() => this.produtosService.obterProdutos().length);
  
  // Valores estáticos simulados
  pedidosPendentes = computed(() => 3);
  usuariosCadastrados = computed(() => 8);

  sair() {
    this.authService.logout();
  }
}