import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { ViaCepService } from '../../../core/services/viacep.service';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { PedidosService } from '../../../core/services/pedidos.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnDestroy {

  private viaCepService = inject(ViaCepService);
  private pedidosService = inject(PedidosService);
  private authService = inject(AuthService);

  carrinhoFacade = inject(CarrinhoFacade);

  pedidoConcluido = false;
  processandoPedido = false;

  codigoPedido = '';
  mensagemErro = '';

  consultandoCep = false;
  erroCep = '';

  private consultaCep?: Subscription;
  private ultimoCepConsultado = '';

  dadosCheckout = {
    nome: '',
    email: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: ''
  };

  constructor() {
    const usuario = this.authService.obterPerfil();

    if (usuario) {
      this.dadosCheckout.nome = usuario.nome ?? '';
      this.dadosCheckout.email = usuario.email;
    }
  }

  // CONSULTAR CEP
  onCepChange(): void {

    const cepLimpo = this.dadosCheckout.cep.replace(/\D/g, '');

    this.erroCep = '';

    // Cancela uma consulta anterior.
    this.consultaCep?.unsubscribe();
    this.consultandoCep = false;

    if (cepLimpo.length !== 8) {
      this.ultimoCepConsultado = '';
      return;
    }

    // Evita consultar novamente o mesmo CEP.
    if (cepLimpo === this.ultimoCepConsultado) {
      return;
    }

    this.ultimoCepConsultado = cepLimpo;
    this.consultandoCep = true;

    this.consultaCep = this.viaCepService.consultarCep(cepLimpo)
      .subscribe({

        next: dados => {

          this.consultandoCep = false;

          // Confirma que o CEP ainda é o mesmo.
          const cepAtual = this.dadosCheckout.cep.replace(/\D/g, '');

          if (cepAtual !== cepLimpo) {
            return;
          }

          if (dados && !dados.erro) {

            this.dadosCheckout.endereco = dados.logradouro || '';
            this.dadosCheckout.bairro = dados.bairro || '';

          } else {

            this.ultimoCepConsultado = '';
            this.erroCep = 'CEP não encontrado. Verifique o número informado.';

          }
        },

        error: erro => {

          console.error('Erro ao consultar CEP:', erro);

          this.consultandoCep = false;
          this.ultimoCepConsultado = '';

          this.erroCep =
            'Não foi possível consultar o CEP. Tente novamente.';
        }
      });
  }

  // CONFIRMAR PEDIDO
  confirmarPedido(formCheckout: NgForm): void {

    this.mensagemErro = '';

    if (this.processandoPedido || this.pedidoConcluido) {
      return;
    }

    if (formCheckout.invalid) {

      formCheckout.control.markAllAsTouched();

      this.mensagemErro =
        'Verifique os campos obrigatórios antes de continuar.';

      return;
    }

    const cepLimpo = this.dadosCheckout.cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {

      this.mensagemErro = 'Informe um CEP válido.';

      return;
    }

    if (this.consultandoCep) {

      this.mensagemErro =
        'Aguarde a consulta do CEP terminar.';

      return;
    }

    const itens = this.carrinhoFacade.itens();

    if (itens.length === 0) {

      this.mensagemErro = 'Seu carrinho está vazio.';

      return;
    }

    const total = this.carrinhoFacade.total();

    if (!Number.isFinite(total) || total <= 0) {

      this.mensagemErro =
        'Não foi possível calcular o total da compra.';

      return;
    }

    this.processandoPedido = true;

    try {

      const pedido = this.pedidosService.criarPedido({

        cliente: {
          nome: this.dadosCheckout.nome.trim(),
          email: this.dadosCheckout.email.trim().toLowerCase()
        },

        endereco: {
          cep: cepLimpo,
          rua: this.dadosCheckout.endereco.trim(),
          numero: this.dadosCheckout.numero.trim(),
          complemento: this.dadosCheckout.complemento.trim(),
          bairro: this.dadosCheckout.bairro.trim()
        },

        itens: itens.map(item => ({ ...item })),

        total
      });

      this.codigoPedido = pedido.id;
      this.pedidoConcluido = true;

      // Limpa o carrinho somente após registrar o pedido.
      this.carrinhoFacade.limparCarrinho();

    } catch (erro) {

      console.error('Erro ao registrar pedido:', erro);

      this.mensagemErro =
        'Não foi possível registrar o pedido. Tente novamente.';

    } finally {

      this.processandoPedido = false;

    }
  }

  ngOnDestroy(): void {
    this.consultaCep?.unsubscribe();
  }
}