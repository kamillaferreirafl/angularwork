import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ViaCepService } from '../../../core/services/viacep.service';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { PedidosService } from '../../../core/services/pedidos.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {
  private viaCepService = inject(ViaCepService);
  private pedidosService = inject(PedidosService);

  carrinhoFacade = inject(CarrinhoFacade);

  pedidoConcluido = false;
  codigoPedido = '';

  dadosCheckout = {
    nome: '',
    email: '',
    senha: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: ''
  };

  onCepChange(): void {
    const cepLimpo = this.dadosCheckout.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return;
    }

    this.viaCepService.consultarCep(cepLimpo).subscribe({
      next: dados => {
        if (dados && !dados.erro) {
          this.dadosCheckout.endereco = dados.logradouro || '';
          this.dadosCheckout.bairro = dados.bairro || '';
        } else {
          alert('CEP não encontrado.');
        }
      },
      error: erro => {
        console.error('Erro ao consultar CEP:', erro);
        alert('Não foi possível consultar o CEP.');
      }
    });
  }

  confirmarPedido(): void {
    const itens = this.carrinhoFacade.itens();

    if (itens.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }

    const pedido = this.pedidosService.criarPedido({
      cliente: {
        nome: this.dadosCheckout.nome.trim(),
        email: this.dadosCheckout.email.trim().toLowerCase()
      },
      endereco: {
        cep: this.dadosCheckout.cep,
        rua: this.dadosCheckout.endereco,
        numero: this.dadosCheckout.numero,
        complemento: this.dadosCheckout.complemento,
        bairro: this.dadosCheckout.bairro
      },
      itens: itens.map(item => ({ ...item })),
      total: this.carrinhoFacade.total()
    });

    this.codigoPedido = pedido.id;
    this.pedidoConcluido = true;

    this.carrinhoFacade.limparCarrinho();
  }
}