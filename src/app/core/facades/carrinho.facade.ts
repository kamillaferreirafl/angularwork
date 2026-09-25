import { Injectable, signal, computed, effect } from '@angular/core';
import { ItemCarrinho } from '../models/item-carrinho';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoFacade {
  // Carrega os itens salvos no localStorage ao iniciar
  private itensSignal = signal<ItemCarrinho[]>(this.carregarDoLocalStorage());

  constructor() {
    // Toda vez que itensSignal mudar, salva automaticamente no localStorage
    effect(() => {
      const itens = this.itensSignal();
      localStorage.setItem('carrinho_megasport', JSON.stringify(itens));
    });
  }

  // Signals expostos para leitura
  itens = computed(() => this.itensSignal());
  quantidade = computed(() => this.itensSignal().filter(item => item != null).length);
  carrinhoVazio = computed(() => this.quantidade() === 0);
  total = computed(() =>
    this.itensSignal().reduce((acc, item) => acc + (item?.preco || 0), 0)
  );

  adicionarItem(item: ItemCarrinho) {
    this.itensSignal.update(itens => [
      ...itens,
      {
        nome: item.nome,
        preco: item.preco,
        imagem: item.imagem
      }
    ]);
  }

  removerItem(index: number) {
    this.itensSignal.update(itens => itens.filter((_, i) => i !== index));
  }

  limparCarrinho() {
    this.itensSignal.set([]);
  }

  private carregarDoLocalStorage(): ItemCarrinho[] {
    const dadosSalvos = localStorage.getItem('carrinho_megasport');
    if (dadosSalvos) {
      try {
        return JSON.parse(dadosSalvos);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}