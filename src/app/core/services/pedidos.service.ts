import { Injectable, computed, signal } from '@angular/core';

import { ItemCarrinho } from '../models/item-carrinho';

export type StatusPedido =
  | 'Pendente'
  | 'Em preparação'
  | 'Enviado'
  | 'Entregue'
  | 'Cancelado';

export interface Pedido {
  id: string;
  data: string;

  cliente: {
    nome: string;
    email: string;
  };

  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
  };

  itens: ItemCarrinho[];

  total: number;

  status: StatusPedido;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private readonly chaveStorage = 'pedidos_megasport';

  private pedidosSignal = signal<Pedido[]>(
    this.carregarPedidos()
  );

  readonly pedidos = this.pedidosSignal.asReadonly();

  readonly totalPedidos = computed(
    () => this.pedidosSignal().length
  );

  readonly pedidosPendentes = computed(
    () =>
      this.pedidosSignal().filter(
        pedido => pedido.status === 'Pendente'
      ).length
  );

  // ========================================
  // CRIAR PEDIDO
  // ========================================

  criarPedido(
    dados: Omit<Pedido, 'id' | 'data' | 'status'>
  ): Pedido {

    const pedido: Pedido = {

      ...dados,

      id: this.gerarCodigoPedido(),

      data: new Date().toISOString(),

      status: 'Pendente',

      itens: dados.itens.map(item => ({ ...item })),

      cliente: { ...dados.cliente },

      endereco: { ...dados.endereco }
    };

    const listaAtualizada = [
      pedido,
      ...this.pedidosSignal()
    ];

    this.persistirPedidos(listaAtualizada);

    this.pedidosSignal.set(listaAtualizada);

    return pedido;
  }

  // ========================================
  // ATUALIZAR STATUS
  // ========================================

  atualizarStatus(
    id: string,
    status: StatusPedido
  ): void {

    const listaAtualizada = this.pedidosSignal().map(
      pedido =>
        pedido.id === id
          ? { ...pedido, status }
          : pedido
    );

    this.persistirPedidos(listaAtualizada);

    this.pedidosSignal.set(listaAtualizada);
  }

  // ========================================
  // REMOVER PEDIDO
  // ========================================

  removerPedido(id: string): void {

    const listaAtualizada = this.pedidosSignal().filter(
      pedido => pedido.id !== id
    );

    this.persistirPedidos(listaAtualizada);

    this.pedidosSignal.set(listaAtualizada);
  }

  // ========================================
  // GERAR IDENTIFICADOR
  // ========================================

  private gerarCodigoPedido(): string {

    const identificador = crypto.randomUUID()
      .replace(/-/g, '')
      .slice(0, 12)
      .toUpperCase();

    return `8${identificador}`;
  }

  // ========================================
  // SALVAR NO NAVEGADOR
  // ========================================

  private persistirPedidos(pedidos: Pedido[]): void {

    localStorage.setItem(
      this.chaveStorage,
      JSON.stringify(pedidos)
    );
  }

  // ========================================
  // CARREGAR PEDIDOS
  // ========================================

  private carregarPedidos(): Pedido[] {

    try {

      const dados = localStorage.getItem(
        this.chaveStorage
      );

      if (!dados) {
        return [];
      }

      const pedidos = JSON.parse(dados);

      return Array.isArray(pedidos)
        ? pedidos
        : [];

    } catch (erro) {

      console.error(
        'Erro ao carregar pedidos:',
        erro
      );

      return [];
    }
  }
}