import {
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { ProdutosService } from '../../../core/services/produtos.service';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { Produto } from '../../../core/models/produto-loja';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-produtos.html',
  styleUrl: './lista-produtos.css'
})
export class ListaProdutos {

  private produtosService = inject(ProdutosService);
  private carrinhoFacade = inject(CarrinhoFacade);
  private route = inject(ActivatedRoute);

  // PESQUISA RECEBIDA PELO CABEÇALHO
  private buscaUrl = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('busca') ?? '')
    ),
    { initialValue: '' }
  );

  // CATEGORIA RECEBIDA PELA HOME
  private categoriaUrl = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('categoria') ?? 'TODAS')
    ),
    { initialValue: 'TODAS' }
  );

  // ESTADOS DOS FILTROS
  categoriaSelecionada = signal('TODAS');
  ordenacao = signal('relevancia');

  constructor() {
    // Atualiza a categoria quando a URL mudar
    effect(() => {
      const categoria = this.categoriaUrl();
      this.categoriaSelecionada.set(categoria);
    });
  }

  // LISTA DE CATEGORIAS
  categorias = computed(() => {
    const categorias = this.produtosService
      .obterProdutos()
      .map(produto => produto.categoria)
      .filter(
        (categoria): categoria is string =>
          categoria !== undefined
      );

    return ['TODAS', ...new Set(categorias)];
  });

  // PRODUTOS FILTRADOS
  produtosFiltrados = computed(() => {

    const busca = this.normalizar(this.buscaUrl());
    const categoria = this.categoriaSelecionada();
    const ordenacao = this.ordenacao();

    const produtos = this.produtosService
      .obterProdutos()
      .filter(produto => {

        const correspondeBusca = this
          .normalizar(produto.nome)
          .includes(busca);

        const correspondeCategoria =
          categoria === 'TODAS' ||
          produto.categoria === categoria;

        return correspondeBusca && correspondeCategoria;
      });

    // MENOR PREÇO
    if (ordenacao === 'menor-preco') {
      return [...produtos].sort(
        (a, b) => a.preco - b.preco
      );
    }

    // MAIOR PREÇO
    if (ordenacao === 'maior-preco') {
      return [...produtos].sort(
        (a, b) => b.preco - a.preco
      );
    }

    return produtos;
  });

  // TEXTO DA PESQUISA
  buscaAtual = computed(() => this.buscaUrl());

  // SELECIONAR CATEGORIA
  selecionarCategoria(
    categoria: string | undefined
  ): void {
    this.categoriaSelecionada.set(
      categoria ?? 'TODAS'
    );
  }

  // ALTERAR ORDENAÇÃO
  alterarOrdenacao(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.ordenacao.set(select.value);
  }

  // ADICIONAR AO CARRINHO
  adicionarAoCarrinho(produto: Produto): void {
    this.carrinhoFacade.adicionarItem({
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem ?? ''
    });
  }

  // NORMALIZAR TEXTO DA PESQUISA
  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}