import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class Checkout {
  private router = inject(Router);

  private obterItensStorage(): any[] {
    // Usando a chave exata que estava no Local Storage: 'carrinho_megasport'
    const salvo = localStorage.getItem('carrinho_megasport');
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  }

  totalItensCheckout = () => this.obterItensStorage().length;
  
  valorTotalCheckout = () => {
    const itens = this.obterItensStorage();
    return itens.reduce((acc: number, item: any) => acc + (Number(item.preco) || 0), 0);
  };

  voltarCarrinho() {
    this.router.navigate(['/carrinho']);
  }

  finalizarCompra(event: Event) {
    event.preventDefault();
    if (this.totalItensCheckout() === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
    alert('Compra finalizada com sucesso!');
    localStorage.removeItem('carrinho_megasport');
    this.router.navigate(['/produtos']);
  }
}