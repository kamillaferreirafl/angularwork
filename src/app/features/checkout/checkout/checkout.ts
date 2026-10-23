import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { FormsModule } from '@angular/forms';
import { ViaCepService } from '../../../core/services/viacep.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout {
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

  readonly carrinhoFacade = inject(CarrinhoFacade);
  private readonly viaCepService = inject(ViaCepService);

  onCepChange(): void {
    const cepLimpo = this.dadosCheckout.cep ? this.dadosCheckout.cep.replace(/\D/g, '') : '';
    
    // Dispara a busca apenas quando atingir 8 números
    if (cepLimpo.length === 8) {
      console.log('A consultar CEP:', cepLimpo); // Ajuda a depurar no F12
      
      this.viaCepService.consultarCep(cepLimpo).subscribe({
        next: (dados) => {
          console.log('Resposta da API ViaCEP:', dados); // Veja no console do navegador se os dados chegam aqui
          
          if (dados && !dados.erro) {
            // Atribui os valores retornados pela API aos campos do formulário
            this.dadosCheckout.endereco = dados.logradouro || '';
            this.dadosCheckout.bairro = dados.bairro || '';
          } else {
            alert('CEP não encontrado.');
          }
        },
        error: (erro) => {
          console.error('Erro ao buscar o CEP:', erro);
        }
      });
    }
  }

  confirmarPedido(): void {
    const numeroAleatorio = Math.floor(10000000000000 + Math.random() * 90000000000000);
    this.codigoPedido = '8' + numeroAleatorio.toString().substring(0, 14);
    if (this.carrinhoFacade.carrinhoVazio()) {
      return;
    }
    this.carrinhoFacade.limparCarrinho();
    this.pedidoConcluido = true;
  }
}