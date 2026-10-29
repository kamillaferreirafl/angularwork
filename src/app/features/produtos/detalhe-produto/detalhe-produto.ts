import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { ProdutosService } from '../../../core/services/produtos.service';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';

@Component({
  selector: 'app-detalhe-produto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalhe-produto.html',
  styleUrl: './detalhe-produto.css'
})
export class DetalheProduto {

  private route = inject(ActivatedRoute);
  private produtosService = inject(ProdutosService);
  private carrinhoFacade = inject(CarrinhoFacade);

  private produtoId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id') ?? '')
    ),
    { initialValue: '' }
  );

  produto = computed(() =>
    this.produtosService.obterProdutoPorId(this.produtoId())
  );

  corSelecionada = signal('');
  tamanhoSelecionado = signal('');
  capacidadeSelecionada = signal('');

  quantidade = signal(1);
  imagemSelecionada = signal('');
  mensagem = signal('');
  adicionado = signal(false);

  imagens = computed(() => {
    const produto = this.produto();

    if (!produto) {
      return [];
    }

    return [
      produto.imagem,
      ...(produto.imagens ?? [])
    ].filter((imagem): imagem is string => !!imagem);
  });

  imagemPrincipal = computed(() =>
    this.imagemSelecionada() || this.imagens()[0] || ''
  );

  total = computed(() =>
    (this.produto()?.preco ?? 0) * this.quantidade()
  );

  selecionarCor(cor: string): void {
    this.corSelecionada.set(cor);
    this.limparMensagem();
  }

  selecionarTamanho(tamanho: string): void {
    this.tamanhoSelecionado.set(tamanho);
    this.limparMensagem();
  }

  selecionarCapacidade(capacidade: string): void {
    this.capacidadeSelecionada.set(capacidade);
    this.limparMensagem();
  }

  selecionarImagem(imagem: string): void {
    this.imagemSelecionada.set(imagem);
  }

  aumentarQuantidade(): void {
    if (this.quantidade() < 99) {
      this.quantidade.update(valor => valor + 1);
    }
  }

  diminuirQuantidade(): void {
    if (this.quantidade() > 1) {
      this.quantidade.update(valor => valor - 1);
    }
  }

  adicionarAoCarrinho(): void {
    const produto = this.produto();

    if (!produto) {
      return;
    }

    if (
      produto.cores?.length &&
      !produto.cores.includes(this.corSelecionada())
    ) {
      this.exibirErro('Selecione uma cor.');
      return;
    }

    if (
      produto.tamanhos?.length &&
      !produto.tamanhos.includes(this.tamanhoSelecionado())
    ) {
      this.exibirErro('Selecione um tamanho.');
      return;
    }

    if (
      produto.capacidades?.length &&
      !produto.capacidades.includes(this.capacidadeSelecionada())
    ) {
      this.exibirErro('Selecione uma capacidade.');
      return;
    }

    for (let i = 0; i < this.quantidade(); i++) {
      this.carrinhoFacade.adicionarItem({
        produtoId: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem,
        cor: this.corSelecionada() || undefined,
        tamanho: this.tamanhoSelecionado() || undefined,
        capacidade: this.capacidadeSelecionada() || undefined
      });
    }

    this.mensagem.set(
      this.quantidade() === 1
        ? 'Produto adicionado ao carrinho!'
        : `${this.quantidade()} unidades adicionadas ao carrinho!`
    );

    this.adicionado.set(true);
  }

  private exibirErro(mensagem: string): void {
    this.mensagem.set(mensagem);
    this.adicionado.set(false);
  }

  private limparMensagem(): void {
    this.mensagem.set('');
    this.adicionado.set(false);
  }
}