import {
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { ProdutosService } from '../../../core/services/produtos.service';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-produtos.html',
  styleUrl: './lista-produtos.css'
})
export class ListaProdutos {

  private produtosService = inject(ProdutosService);
  private route = inject(ActivatedRoute);

  private produtos = this.produtosService.produtos;

  private buscaUrl = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('busca') ?? '')
    ),
    { initialValue: '' }
  );

  private categoriaUrl = toSignal(
    this.route.queryParamMap.pipe(
      map(params => params.get('categoria') ?? 'TODAS')
    ),
    { initialValue: 'TODAS' }
  );

  categoriaSelecionada = signal('TODAS');
  ordenacao = signal('relevancia');

  constructor() {
    effect(() => {
      this.categoriaSelecionada.set(this.categoriaUrl());
    });
  }

  categorias = computed(() => {

    const categorias = this.produtos()
      .map(produto => produto.categoria)
      .filter(
        (categoria): categoria is string =>
          categoria !== undefined
      );

    return [
      'TODAS',
      ...new Set(categorias)
    ];
  });

  produtosFiltrados = computed(() => {

    const busca = this.normalizar(this.buscaUrl());
    const categoria = this.categoriaSelecionada();
    const ordenacao = this.ordenacao();

    const produtos = this.produtos().filter(produto => {

      const correspondeBusca = this
        .normalizar(produto.nome)
        .includes(busca);

      const correspondeCategoria =
        categoria === 'TODAS' ||
        produto.categoria === categoria;

      return correspondeBusca && correspondeCategoria;
    });

    if (ordenacao === 'menor-preco') {
      return [...produtos].sort(
        (a, b) => a.preco - b.preco
      );
    }

    if (ordenacao === 'maior-preco') {
      return [...produtos].sort(
        (a, b) => b.preco - a.preco
      );
    }

    return produtos;
  });

  buscaAtual = computed(() => this.buscaUrl());

  selecionarCategoria(
    categoria: string | undefined
  ): void {
    this.categoriaSelecionada.set(
      categoria ?? 'TODAS'
    );
  }

  alterarOrdenacao(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.ordenacao.set(select.value);
  }

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}