import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  public carrinhoFacade = inject(CarrinhoFacade);
  public authService = inject(AuthService);
  private router = inject(Router);

  // Propriedade de estado do menu flutuante
  menuAberto = signal(false);

  // Alterna a abertura e fechamento do menu
  toggleMenu() {
    this.menuAberto.update(estado => !estado);
  }

  // Fecha o menu suspenso
  fecharMenu() {
    this.menuAberto.set(false);
  }

  deslogar() {
    this.fecharMenu();
    this.authService.logout();
    this.carrinhoFacade.limparCarrinho();
    this.router.navigate(['/login']);
  }
}