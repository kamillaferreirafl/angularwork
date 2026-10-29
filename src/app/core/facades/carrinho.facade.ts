import {
  Injectable,
  signal,
  computed,
  effect
} from '@angular/core';

import { ItemCarrinho } from '../models/item-carrinho';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoFacade {

  private readonly STORAGE_KEY = 'carrinho_megasport';

  private itensSignal = signal<ItemCarrinho[]>(
    this.carregarDoLocalStorage()
  );

  constructor() {
    effect(() => {
      const itens = this.itensSignal();

      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(itens)
      );
    });
  }

  readonly itens = this.itensSignal.asReadonly();

  readonly quantidade = computed(
    () => this.itensSignal().length
  );

  readonly carrinhoVazio = computed(
    () => this.quantidade() === 0
  );

  readonly total = computed(
    () => this.itensSignal().reduce(
      (acc, item) => acc + item.preco,
      0
    )
  );

  adicionarItem(item: ItemCarrinho): void {

    this.itensSignal.update(itens => [
      ...itens,
      {
        nome: item.nome,
        preco: item.preco,
        imagem: item.imagem,
        produtoId: item.produtoId,
        cor: item.cor,
        tamanho: item.tamanho,
        capacidade: item.capacidade
      }
    ]);
  }

  removerItem(index: number): void {
    this.itensSignal.update(
      itens => itens.filter((_, i) => i !== index)
    );
  }

  limparCarrinho(): void {
    this.itensSignal.set([]);
  }

  private carregarDoLocalStorage(): ItemCarrinho[] {

    try {
      const dadosSalvos = localStorage.getItem(
        this.STORAGE_KEY
      );

      if (!dadosSalvos) {
        return [];
      }

      const itens: unknown = JSON.parse(dadosSalvos);

      if (!Array.isArray(itens)) {
        return [];
      }

      return itens.filter(
        (item): item is ItemCarrinho =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.nome === 'string' &&
          typeof item.preco === 'number' &&
          Number.isFinite(item.preco)
      );

    } catch (erro) {
      console.error(
        'Erro ao carregar carrinho:',
        erro
      );

      return [];
    }
  }
}