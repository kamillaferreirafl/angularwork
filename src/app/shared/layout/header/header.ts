import {
  Component,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Router,
  RouterModule
} from '@angular/router';

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

  menuAberto = signal(false);
  termoBusca = signal('');

  // ABRIR / FECHAR MENU
  toggleMenu(): void {
    this.menuAberto.update(
      estado => !estado
    );
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }

  // ATUALIZAR PESQUISA
  atualizarBusca(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.termoBusca.set(input.value);
  }

  // PESQUISAR PRODUTOS
  buscarProdutos(event: Event): void {

    event.preventDefault();

    const termo = this.termoBusca().trim();

    this.router.navigate(['/produtos'], {
      queryParams: termo
        ? { busca: termo }
        : {}
    });
  }

  // ENCERRAR SESSÃO
  deslogar(): void {

    this.fecharMenu();

    // Encerra a autenticação
    this.authService.logout();

    // Mantém os produtos do carrinho
    this.router.navigate(['/login']);
  }
}