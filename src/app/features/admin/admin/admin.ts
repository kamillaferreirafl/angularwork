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

interface FormularioProduto {
  nome: string;
  preco: number;
  categoria: string;
  imagem: string;
  descricao: string;
  imagensAdicionais: string;
  cores: string;
  tamanhos: string;
  capacidades: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  private router = inject(Router);

  private authService = inject(AuthService);

  produtosService = inject(ProdutosService);

  pedidosService = inject(PedidosService);

  secaoAtiva = signal<SecaoAdmin>('visao-geral');

  @ViewChild('modalCadastro')
  modalCadastro!: ElementRef<HTMLDialogElement>;

  novoProduto: FormularioProduto = this.criarFormularioVazio();

  editandoIndex: number | null = null;

  // ========================================
  // NAVEGAÇÃO
  // ========================================

  selecionarSecao(secao: SecaoAdmin): void {
    this.secaoAtiva.set(secao);
  }

  // ========================================
  // USUÁRIO ATUAL
  // ========================================

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

  // ========================================
  // PEDIDOS
  // ========================================

  pedidos = this.pedidosService.pedidos;

  pedidosPendentes = this.pedidosService.pedidosPendentes;

  totalPedidos = this.pedidosService.totalPedidos;

  // ========================================
  // USUÁRIOS
  // ========================================

  usuarios = computed(() => [

    {
      email: 'admin@email.com',
      nome: 'Administrador',
      perfil: 'ADMIN' as const,
      dataCadastro: ''
    },

    ...this.authService.usuarios()

  ]);

  usuariosCadastrados = computed(() => {
    return this.usuarios().length;
  });

  // ========================================
  // PRODUTOS
  // ========================================

  totalProdutos = this.produtosService.totalProdutos;

  private criarFormularioVazio(): FormularioProduto {

    return {
      nome: '',
      preco: 0,
      categoria: 'GERAL',
      imagem: '',
      descricao: '',
      imagensAdicionais: '',
      cores: '',
      tamanhos: '',
      capacidades: ''
    };

  }

  // ========================================
  // ABRIR MODAL
  // ========================================

  abrirModalCadastro(): void {

    this.editandoIndex = null;

    this.novoProduto = this.criarFormularioVazio();

    this.modalCadastro.nativeElement.showModal();

  }

  // ========================================
  // FECHAR MODAL
  // ========================================

  fecharModalCadastro(): void {

    this.modalCadastro.nativeElement.close();

    this.editandoIndex = null;

    this.novoProduto = this.criarFormularioVazio();

  }

  // ========================================
  // CONVERTER TEXTO EM LISTA
  // ========================================

  private textoParaLista(texto: string): string[] {

    const valores = texto
      .split(/\r?\n|,/)
      .map(valor => valor.trim())
      .filter(valor => valor.length > 0);

    return [...new Set(valores)];

  }

  // ========================================
  // CONVERTER LISTA EM TEXTO
  // ========================================

  private listaParaTexto(lista?: string[]): string {

    return (lista ?? []).join('\n');

  }

  // ========================================
  // SALVAR PRODUTO
  // ========================================

  salvarProduto(): void {

    const nome = this.novoProduto.nome.trim();

    const imagem = this.novoProduto.imagem.trim();

    const descricao = this.novoProduto.descricao.trim();

    const preco = Number(this.novoProduto.preco);

    if (
      nome.length < 3 ||
      !Number.isFinite(preco) ||
      preco <= 0 ||
      !imagem
    ) {

      alert(
        'Informe um nome com pelo menos 3 caracteres, ' +
        'um preço válido e uma imagem principal.'
      );

      return;

    }

    const produto: Produto = {

      nome,

      preco,

      categoria: this.novoProduto.categoria || 'GERAL',

      imagem,

      descricao,

      imagens: this.textoParaLista(
        this.novoProduto.imagensAdicionais
      ).filter(url => url !== imagem),

      cores: this.textoParaLista(
        this.novoProduto.cores
      ),

      tamanhos: this.textoParaLista(
        this.novoProduto.tamanhos
      ),

      capacidades: this.textoParaLista(
        this.novoProduto.capacidades
      )

    };

    try {

      if (this.editandoIndex !== null) {

        this.produtosService.atualizarProduto(
          this.editandoIndex,
          produto
        );

      } else {

        this.produtosService.adicionarProduto(produto);

      }

      this.fecharModalCadastro();

    } catch (erro) {

      console.error(
        'Erro ao salvar produto:',
        erro
      );

      alert(
        'Não foi possível salvar o produto. ' +
        'Verifique o armazenamento do navegador.'
      );

    }

  }

  // ========================================
  // EDITAR PRODUTO
  // ========================================

  prepararEdicao(index: number, produto: Produto): void {

    this.editandoIndex = index;

    this.novoProduto = {

      nome: produto.nome,

      preco: produto.preco,

      categoria: produto.categoria ?? 'GERAL',

      imagem: produto.imagem ?? '',

      descricao: produto.descricao ?? '',

      imagensAdicionais: this.listaParaTexto(
        produto.imagens
      ),

      cores: this.listaParaTexto(
        produto.cores
      ),

      tamanhos: this.listaParaTexto(
        produto.tamanhos
      ),

      capacidades: this.listaParaTexto(
        produto.capacidades
      )

    };

    this.modalCadastro.nativeElement.showModal();

  }

  // ========================================
  // REMOVER PRODUTO
  // ========================================

  removerProduto(index: number): void {

    const produto =
      this.produtosService.obterProdutos()[index];

    if (!produto) {
      return;
    }

    const confirmou = confirm(
      `Deseja realmente remover "${produto.nome}"?`
    );

    if (!confirmou) {
      return;
    }

    this.produtosService.removerProduto(index);

  }

  // ========================================
  // ATUALIZAR STATUS DO PEDIDO
  // ========================================

  atualizarStatusPedido(
    id: string,
    status: StatusPedido
  ): void {

    this.pedidosService.atualizarStatus(
      id,
      status
    );

  }

  // ========================================
  // REMOVER PEDIDO
  // ========================================

  removerPedido(id: string): void {

    const confirmou = confirm(
      'Deseja realmente remover este pedido?'
    );

    if (!confirmou) {
      return;
    }

    this.pedidosService.removerPedido(id);

  }

  // ========================================
  // REMOVER USUÁRIO
  // ========================================

  removerUsuario(email: string): void {

    if (email === 'admin@email.com') {

      alert(
        'Não é possível remover o administrador principal.'
      );

      return;

    }

    const confirmou = confirm(
      'Deseja realmente remover este usuário?'
    );

    if (!confirmou) {
      return;
    }

    this.authService.removerUsuario(email);

  }

  // ========================================
  // SAIR DO PAINEL
  // ========================================

  sair(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }

}