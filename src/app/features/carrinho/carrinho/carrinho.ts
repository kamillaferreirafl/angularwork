import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class Carrinho {

  carrinhoFacade = inject(CarrinhoFacade);

  // ========================================
  // REMOVER PRODUTO
  // ========================================

  removerItem(indice: number): void {
    this.carrinhoFacade.removerItem(indice);
  }

  // ========================================
  // LIMPAR CARRINHO
  // ========================================

  limparCarrinho(): void {
    this.carrinhoFacade.limparCarrinho();
  }

  // ========================================
  // FORMATAR PREÇOS
  // ========================================

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

}