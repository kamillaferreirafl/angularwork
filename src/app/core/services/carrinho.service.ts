import { Injectable, signal, computed } from '@angular/core';
import { Produto } from '../models/produto-loja';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private readonly STORAGE_KEY = 'itens_carrinho_loja';

  private itensCarrinho = signal<Produto[]>(this.carregarDoStorage());

  itens = this.itensCarrinho.asReadonly();
  totalItens = computed(() => this.itensCarrinho().length);
  valorTotal = computed(() => 
    this.itensCarrinho().reduce((acc, item) => acc + (Number(item.preco) || 0), 0)
  );

  private carregarDoStorage(): Produto[] {
    const salvo = localStorage.getItem(this.STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : [];
  }

  private salvarNoStorage(produtos: Produto[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(produtos));
  }

  adicionarItem(produto: Produto) {
    this.itensCarrinho.update(lista => {
      const novaLista = [...lista, produto];
      this.salvarNoStorage(novaLista);
      return novaLista;
    });
  }

  removerItem(index: number) {
    this.itensCarrinho.update(lista => {
      const novaLista = lista.filter((_, i) => i !== index);
      this.salvarNoStorage(novaLista);
      return novaLista;
    });
  }

  limparCarrinho() {
    this.itensCarrinho.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}