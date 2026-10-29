import { Injectable, signal, computed } from '@angular/core';
import { Produto } from '../models/produto-loja';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {

  private readonly STORAGE_KEY = 'produtos_loja';

  private readonly produtosIniciais: Produto[] = [
    {
      nome: 'Tênis de Corrida Pro Runner',
      preco: 399.90,
      categoria: 'CALÇADOS',
      imagem: 'tenis.jpeg',
      descricao: 'Tênis esportivo desenvolvido para acompanhar seus treinos e corridas.',
      cores: ['Preto', 'Branco', 'Azul'],
      tamanhos: [
        '34', '35', '36', '37', '38', '39',
        '40', '41', '42', '43', '44'
      ]
    },
    {
      nome: 'Camiseta Dry-Fit Performance',
      preco: 89.90,
      categoria: 'VESTUÁRIO',
      imagem: 'camisa.jpeg',
      descricao: 'Camiseta esportiva confortável para treinos e atividades físicas.',
      cores: ['Preto', 'Branco', 'Azul'],
      tamanhos: ['P', 'M', 'G', 'GG']
    },
    {
      nome: 'Mochila Esportiva Impermeável',
      preco: 199.90,
      categoria: 'ACESSÓRIOS',
      imagem: 'mochila.jpeg',
      descricao: 'Mochila esportiva prática para acompanhar sua rotina.',
      cores: ['Preto', 'Azul', 'Cinza']
    },
    {
      nome: 'Garrafa Térmica Inox 1L',
      preco: 119.90,
      categoria: 'ACESSÓRIOS',
      imagem: 'garrafa.jpeg',
      descricao: 'Garrafa térmica para manter sua bebida na temperatura desejada.',
      cores: ['Preto', 'Prata', 'Azul'],
      capacidades: ['1 L']
    },
    {
      nome: 'Camisa Oficial do Fluminense',
      preco: 399.90,
      categoria: 'VESTUÁRIO',
      imagem: 'fluminense.jpeg',
      descricao: 'Camisa do Fluminense para demonstrar sua paixão pelo clube.',
      cores: ['Tricolor'],
      tamanhos: ['P', 'M', 'G', 'GG', 'XG']
    },
    {
      nome: 'Camisa Oficial do Flamengo',
      preco: 299.90,
      categoria: 'VESTUÁRIO',
      imagem: 'flamengo.jpeg',
      descricao: 'Camisa do Flamengo para acompanhar seu time dentro e fora dos estádios.',
      cores: ['Rubro-negra'],
      tamanhos: ['P', 'M', 'G', 'GG', 'XG']
    }
  ];

  private listaProdutos = signal<Produto[]>(
    this.carregarProdutos()
  );

  readonly produtos = this.listaProdutos.asReadonly();

  readonly totalProdutos = computed(
    () => this.listaProdutos().length
  );

  obterProdutos(): Produto[] {
    return this.listaProdutos();
  }

  obterProdutoPorId(id: string): Produto | undefined {
    return this.listaProdutos().find(
      produto => produto.id === id
    );
  }

  adicionarProduto(produto: Produto): void {
    const novoProduto: Produto = {
      ...produto,
      id: this.gerarId()
    };

    const atualizados = [
      novoProduto,
      ...this.listaProdutos()
    ];

    this.salvarNoStorage(atualizados);
    this.listaProdutos.set(atualizados);
  }

  atualizarProduto(
    index: number,
    produtoAtualizado: Produto
  ): void {

    const lista = this.listaProdutos();

    if (index < 0 || index >= lista.length) {
      return;
    }

    const atualizados = lista.map((produto, i) => {
      if (i !== index) {
        return produto;
      }

      return {
        ...produto,
        ...produtoAtualizado,
        id: produto.id
      };
    });

    this.salvarNoStorage(atualizados);
    this.listaProdutos.set(atualizados);
  }

  removerProduto(index: number): void {

    const lista = this.listaProdutos();

    if (index < 0 || index >= lista.length) {
      return;
    }

    const atualizados = lista.filter(
      (_, i) => i !== index
    );

    this.salvarNoStorage(atualizados);
    this.listaProdutos.set(atualizados);
  }

  private gerarId(): string {
    return crypto.randomUUID();
  }

  private salvarNoStorage(produtos: Produto[]): void {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(produtos)
    );
  }

  private carregarProdutos(): Produto[] {

    let produtos: Produto[] = [...this.produtosIniciais];

    try {
      const salvo = localStorage.getItem(
        this.STORAGE_KEY
      );

      if (salvo !== null) {
        const dados: unknown = JSON.parse(salvo);

        if (Array.isArray(dados)) {
          produtos = dados.filter(
            (produto): produto is Produto =>
              typeof produto === 'object' &&
              produto !== null &&
              typeof produto.nome === 'string' &&
              typeof produto.preco === 'number' &&
              Number.isFinite(produto.preco)
          );
        }
      }
    } catch (erro) {
      console.error(
        'Erro ao carregar produtos:',
        erro
      );
    }

    const idsUtilizados = new Set<string>();
    let houveAlteracoes = false;

    const produtosAtualizados = produtos.map(produto => {

      let id = produto.id;

      if (!id || idsUtilizados.has(id)) {
        id = this.gerarId();
        houveAlteracoes = true;
      }

      idsUtilizados.add(id);

      return {
        ...produto,
        id
      };
    });

    if (houveAlteracoes) {
      try {
        this.salvarNoStorage(produtosAtualizados);
      } catch (erro) {
        console.error(
          'Erro ao salvar identificadores dos produtos:',
          erro
        );
      }
    }

    return produtosAtualizados;
  }
}