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

  pedidos = computed(() => this.pedidosSignal());

  totalPedidos = computed(() => this.pedidosSignal().length);

  pedidosPendentes = computed(() =>
    this.pedidosSignal().filter(
      pedido => pedido.status === 'Pendente'
    ).length
  );

  criarPedido(
    dados: Omit<Pedido, 'id' | 'data' | 'status'>
  ): Pedido {
    const pedido: Pedido = {
      ...dados,
      id: this.gerarCodigoPedido(),
      data: new Date().toISOString(),
      status: 'Pendente'
    };

    this.pedidosSignal.update(lista => [pedido, ...lista]);
    this.salvarPedidos();

    return pedido;
  }

  atualizarStatus(id: string, status: StatusPedido): void {
    this.pedidosSignal.update(lista =>
      lista.map(pedido =>
        pedido.id === id
          ? { ...pedido, status }
          : pedido
      )
    );

    this.salvarPedidos();
  }

  removerPedido(id: string): void {
    this.pedidosSignal.update(lista =>
      lista.filter(pedido => pedido.id !== id)
    );

    this.salvarPedidos();
  }

  private gerarCodigoPedido(): string {
    const codigo = Date.now().toString();

    return '8' + codigo;
  }

  private salvarPedidos(): void {
    localStorage.setItem(
      this.chaveStorage,
      JSON.stringify(this.pedidosSignal())
    );
  }

  private carregarPedidos(): Pedido[] {
    try {
      const dados = localStorage.getItem(this.chaveStorage);

      if (!dados) {
        return [];
      }

      const pedidos = JSON.parse(dados);

      return Array.isArray(pedidos) ? pedidos : [];
    } catch {
      return [];
    }
  }
}