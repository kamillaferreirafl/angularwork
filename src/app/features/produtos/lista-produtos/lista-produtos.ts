import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProdutosService } from '../../../core/services/produtos.service';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './lista-produtos.html',
  styleUrl: './lista-produtos.css'
})
export class ListaProdutos {
  private produtosService = inject(ProdutosService);
  private carrinhoFacade = inject(CarrinhoFacade);

  produtos = this.produtosService.obterProdutos();

  adicionarAoCarrinho(produto: any) {
    this.carrinhoFacade.adicionarItem({
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem
    });
  }
}