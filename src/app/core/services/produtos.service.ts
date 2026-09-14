import { Injectable, signal } from '@angular/core';
import { Produto } from '../models/produto-loja';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private STORAGE_KEY = 'produtos_loja';

  private produtosIniciais: Produto[] = [
    { nome: 'Tênis de Corrida Pro Runner', preco: 399.90, categoria: 'CALÇADOS', imagem: 'tenis.jpeg' },
    { nome: 'Camiseta Dry-Fit Performance', preco: 89.90, categoria: 'VESTUÁRIO', imagem: 'camisa.jpeg' },
    { nome: 'Mochila Esportiva Impermeável', preco: 199.90, categoria: 'ACESSÓRIOS', imagem: 'mochila.jpeg' },
    { nome: 'Garrafa Térmica Inox 1L', preco: 119.90, categoria: 'ACESSÓRIOS', imagem: 'garrafa.jpeg' },
    { nome: 'Camisa Oficial do Fluminense', preco: 399.90, categoria: 'VESTUÁRIO', imagem: 'fluminense.jpeg' },
    { nome: 'Camisa Oficial do Flamengo', preco: 299.90, categoria: 'VESTUÁRIO', imagem: 'flamengo.jpeg' }
  ];

  private listaProdutos = signal<Produto[]>(this.carregarProdutos());

  private carregarProdutos(): Produto[] {
    const salvo = localStorage.getItem(this.STORAGE_KEY);
    return salvo ? JSON.parse(salvo) : this.produtosIniciais;
  }

  private salvarNoStorage(produtos: Produto[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(produtos));
  }

  obterProdutos() {
    return this.listaProdutos();
  }

  adicionarProduto(produto: Produto) {
    this.listaProdutos.update(produtos => {
      const atualizados = [produto, ...produtos];
      this.salvarNoStorage(atualizados);
      return atualizados;
    });
  }

  removerProduto(index: number) {
    this.listaProdutos.update(produtos => {
      const atualizados = produtos.filter((_, i) => i !== index);
      this.salvarNoStorage(atualizados);
      return atualizados;
    });
  }

  atualizarProduto(index: number, produtoAtualizado: Produto) {
    this.listaProdutos.update(produtos => {
      const atualizados = [...produtos];
      atualizados[index] = produtoAtualizado;
      this.salvarNoStorage(atualizados);
      return atualizados;
    });
  }
}