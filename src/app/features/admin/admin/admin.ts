import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  inject,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ProdutosService } from '../../../core/services/produtos.service';
import { AuthService } from '../../../core/services/auth.service';

import {
  PedidosService,
  StatusPedido
} from '../../../core/services/pedidos.service';

import { Produto } from '../../../core/models/produto-loja';

type SecaoAdmin =
  | 'visao-geral'
  | 'produtos'
  | 'pedidos'
  | 'usuarios';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  private router = inject(Router);
  private authService = inject(AuthService);

  produtosService = inject(ProdutosService);
  pedidosService = inject(PedidosService);

  secaoAtiva = signal<SecaoAdmin>('visao-geral');

  selecionarSecao(secao: SecaoAdmin): void {
    this.secaoAtiva.set(secao);
  }

  @ViewChild('modalCadastro')
  modalCadastro!: ElementRef<HTMLDialogElement>;

  novoProduto = {
    nome: '',
    preco: 0,
    categoria: 'GERAL',
    imagem: ''
  };

  editandoIndex: number | null = null;

  usuarioAtual = computed(() => {
    const usuario = this.authService.usuarioAtual();

    if (!usuario) {
      return null;
    }

    return {
      email: usuario.email,
      perfil: usuario.eAdmin ? 'ADMIN' : 'CLIENTE'
    };
  });

  // PEDIDOS
  pedidos = this.pedidosService.pedidos;
  pedidosPendentes = this.pedidosService.pedidosPendentes;
  totalPedidos = this.pedidosService.totalPedidos;

  // USUÁRIOS CADASTRADOS
  usuarios = computed(() => [
    {
      email: 'admin@email.com',
      nome: 'Administrador',
      perfil: 'ADMIN' as const,
      dataCadastro: ''
    },
    ...this.authService.usuarios()
  ]);

  usuariosCadastrados = computed(() => this.usuarios().length);

  // PRODUTOS
  totalProdutos = computed(
    () => this.produtosService.obterProdutos().length
  );

  abrirModalCadastro(): void {
    this.editandoIndex = null;

    this.novoProduto = {
      nome: '',
      preco: 0,
      categoria: 'GERAL',
      imagem: ''
    };

    this.modalCadastro.nativeElement.showModal();
  }

  salvarProduto(): void {
    if (
      !this.novoProduto.nome.trim() ||
      this.novoProduto.preco <= 0 ||
      !this.novoProduto.imagem.trim()
    ) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    if (this.editandoIndex !== null) {
      this.produtosService.atualizarProduto(
        this.editandoIndex,
        { ...this.novoProduto }
      );

      this.editandoIndex = null;
    } else {
      this.produtosService.adicionarProduto({
        ...this.novoProduto
      });
    }

    this.novoProduto = {
      nome: '',
      preco: 0,
      categoria: 'GERAL',
      imagem: ''
    };

    this.modalCadastro.nativeElement.close();
  }

  prepararEdicao(index: number, produto: Produto): void {
    this.editandoIndex = index;

    this.novoProduto = {
      nome: produto.nome,
      preco: produto.preco,
      categoria: produto.categoria ?? 'GERAL',
      imagem: produto.imagem ?? ''
    };

    this.modalCadastro.nativeElement.showModal();
  }

  removerProduto(index: number): void {
    this.produtosService.removerProduto(index);
  }

  atualizarStatusPedido(
    id: string,
    status: StatusPedido
  ): void {
    this.pedidosService.atualizarStatus(id, status);
  }

  removerPedido(id: string): void {
    if (!confirm('Deseja realmente remover este pedido?')) {
      return;
    }

    this.pedidosService.removerPedido(id);
  }

  removerUsuario(email: string): void {
    if (email === 'admin@email.com') {
      alert('Não é possível remover o administrador principal.');
      return;
    }

    if (!confirm('Deseja realmente remover este usuário?')) {
      return;
    }

    this.authService.removerUsuario(email);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}