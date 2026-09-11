import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { ItemCarrinho } from '../models/item-carrinho';

@Injectable({
  providedIn: 'root',
})
export class CarrinhoService {
  private platformId = inject(PLATFORM_ID);
  private readonly chaveStorage = 'minha-loja-carrinho';

  private carrinho = signal<ItemCarrinho[]>(this.carregarCarrinhoSalvo());

  itens = computed(() => this.carrinho());
  quantidade = computed(() => this.carrinho().length);
  total = computed(() =>
    this.carrinho().reduce((total, item) => total + item.preco, 0)
  );
  carrinhoVazio = computed(() => this.carrinho().length === 0);

  constructor() {
    effect(() => {
      this.salvarCarrinho(this.carrinho());
    });
  }

  adicionar(produto: ItemCarrinho) {
    this.carrinho.update((listaAtual) => [...listaAtual, produto]);
  }

  removerPorIndice(indice: number) {
    this.carrinho.update((listaAtual) =>
      listaAtual.filter((_, index) => index !== indice)
    );
  }

  limpar() {
    this.carrinho.set([]);
  }

  private estaNoNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private carregarCarrinhoSalvo(): ItemCarrinho[] {
    if (!this.estaNoNavegador()) return [];
    const dadosSalvos = localStorage.getItem(this.chaveStorage);
    if (!dadosSalvos) return [];
    try {
      return JSON.parse(dadosSalvos) as ItemCarrinho[];
    } catch {
      return [];
    }
  }

  private salvarCarrinho(itens: ItemCarrinho[]) {
    if (!this.estaNoNavegador()) return;
    localStorage.setItem(this.chaveStorage, JSON.stringify(itens));
  }
}