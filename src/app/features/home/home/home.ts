import {
  Component,
  inject,
  ChangeDetectorRef,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';

import { ProdutosService } from '../../../core/services/produtos.service';

import { Produto } from '../../../core/models/produto-loja';

import {
  DisifyService,
  DisifyResponse
} from '../../../core/services/disify.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  public carrinhoFacade = inject(CarrinhoFacade);

  private produtosService = inject(ProdutosService);

  private disifyService = inject(DisifyService);

  private cdr = inject(ChangeDetectorRef);

  // ========================================
  // PRODUTOS MAIS VENDIDOS
  // ========================================

  readonly produtosMaisVendidos = computed(() =>
    this.produtosService.produtos().slice(0, 6)
  );

  // ========================================
  // JANELA DE SELEÇÃO
  // ========================================

  produtoSelecionado: Produto | null = null;

  corSelecionada = '';

  tamanhoSelecionado = '';

  capacidadeSelecionada = '';

  mensagemVariacoes = '';

  mensagemCarrinho = '';

  abrirSelecao(produto: Produto): void {

    this.produtoSelecionado = produto;

    this.corSelecionada = '';

    this.tamanhoSelecionado = '';

    this.capacidadeSelecionada = '';

    this.mensagemVariacoes = '';

    this.mensagemCarrinho = '';
  }

  fecharSelecao(): void {

    this.produtoSelecionado = null;

    this.corSelecionada = '';

    this.tamanhoSelecionado = '';

    this.capacidadeSelecionada = '';

    this.mensagemVariacoes = '';
  }

  // ========================================
  // VERIFICAR VARIAÇÕES
  // ========================================

  get possuiCores(): boolean {

    return (
      (this.produtoSelecionado?.cores?.length ?? 0) > 0
    );
  }

  get possuiTamanhos(): boolean {

    return (
      (this.produtoSelecionado?.tamanhos?.length ?? 0) > 0
    );
  }

  get possuiCapacidades(): boolean {

    return (
      (this.produtoSelecionado?.capacidades?.length ?? 0) > 0
    );
  }

  get variacoesValidas(): boolean {

    if (!this.produtoSelecionado) {
      return false;
    }

    if (this.possuiCores && !this.corSelecionada) {
      return false;
    }

    if (this.possuiTamanhos && !this.tamanhoSelecionado) {
      return false;
    }

    if (this.possuiCapacidades && !this.capacidadeSelecionada) {
      return false;
    }

    return true;
  }

  // ========================================
  // ADICIONAR AO CARRINHO
  // ========================================

  confirmarAdicao(): void {

    const produto = this.produtoSelecionado;

    if (!produto) {
      return;
    }

    if (!this.variacoesValidas) {

      this.mensagemVariacoes =
        'Selecione todas as opções disponíveis antes de continuar.';

      return;
    }

    this.carrinhoFacade.adicionarItem({

      produtoId: produto.id,

      nome: produto.nome,

      preco: produto.preco,

      imagem: produto.imagem,

      cor: this.corSelecionada || undefined,

      tamanho: this.tamanhoSelecionado || undefined,

      capacidade: this.capacidadeSelecionada || undefined

    });

    this.fecharSelecao();

    this.mensagemCarrinho =
      'Produto adicionado ao carrinho com sucesso!';
  }

  fecharMensagemCarrinho(): void {

    this.mensagemCarrinho = '';
  }

  // ========================================
  // FORMATAÇÃO DE PREÇO
  // ========================================

  formatarPreco(valor: number): string {

    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  // ========================================
  // NEWSLETTER
  // ========================================

  emailNewsletter = '';

  resultadoValidacao: DisifyResponse | null = null;

  carregandoValidacao = false;

  validarEmailNewsletter(): void {

    const emailLimpo = this.emailNewsletter
      ? this.emailNewsletter.trim()
      : '';

    if (!emailLimpo) {

      this.resultadoValidacao = null;

      return;
    }

    this.carregandoValidacao = true;

    this.resultadoValidacao = null;

    const regexEmailEstrito =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const ehFormatoValido =
      regexEmailEstrito.test(emailLimpo);

    this.disifyService.validarEmail(emailLimpo).subscribe({

      next: (res) => {

        this.resultadoValidacao = {

          ...res,

          format: res.format && ehFormatoValido

        };

        this.carregandoValidacao = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.warn(
          'API externa indisponível. Executando validação local:',
          err
        );

        this.carregandoValidacao = false;

        const partes = emailLimpo.split('@');

        const dominio =
          partes.length === 2 ? partes[1] : '';

        this.resultadoValidacao = {

          email: emailLimpo,

          format: ehFormatoValido,

          dns: ehFormatoValido,

          disposable: false,

          domain: dominio,

          whitelist: true

        };

        this.cdr.detectChanges();

      }

    });
  }

}