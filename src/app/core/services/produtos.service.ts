import { Injectable, signal } from '@angular/core';
import { Produto } from '../models/produto-loja';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private listaProdutos = signal<Produto[]>([
    {
      nome: 'Tênis de Corrida Pro Runner',
      preco: 399.90,
      categoria: 'CALÇADOS',
      imagem: 'tenis.jpeg'
    },
    {
      nome: 'Camiseta Dry-Fit Performance',
      preco: 89.90,
      categoria: 'VESTUÁRIO',
      imagem: 'camisa.jpeg'
    },
    {
      nome: 'Mochila Esportiva Impermeável',
      preco: 199.90,
      categoria: 'ACESSÓRIOS',
      imagem: 'mochila.jpeg'
    },
    {
      nome: 'Garrafa Térmica Inox 1L',
      preco: 119.90,
      categoria: 'ACESSÓRIOS',
      imagem: 'garrafa.jpeg'
    },
    {
      nome: 'Camisa Oficial do Fluminense',
      preco: 399.90,
      categoria: 'VESTUÁRIO',
      imagem: 'fluminense.jpeg'
    },
    {
      nome: 'Camisa Oficial do Flamengo',
      preco: 299.90,
      categoria: 'VESTUÁRIO',
      imagem: 'flamengo.jpeg'
    }
  ]);

  obterProdutos() {
    return this.listaProdutos();
  }
}