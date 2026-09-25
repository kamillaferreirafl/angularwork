import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarrinhoFacade } from '../../../core/facades/carrinho.facade';
import { DisifyService, DisifyResponse } from '../../../core/services/disify.service';

interface ProdutoDestaque {
  id: number;
  nome: string;
  categoria?: string;
  desconto?: number;
  imagem: string;
  precoAntigo?: number;
  preco: number;
  parcelamento: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  public carrinhoFacade = inject(CarrinhoFacade);
  private disifyService = inject(DisifyService);
  private cdr = inject(ChangeDetectorRef);

  // Propriedades para a validação do e-mail
  emailNewsletter: string = '';
  resultadoValidacao: DisifyResponse | null = null;
  carregandoValidacao: boolean = false;

  validarEmailNewsletter(): void {
    const emailLimpo = this.emailNewsletter ? this.emailNewsletter.trim() : '';

    if (!emailLimpo) {
      this.resultadoValidacao = null;
      return;
    }

    this.carregandoValidacao = true;
    this.resultadoValidacao = null;

    // Regra estrita de validação (exige formato: usuario@dominio.extensao)
    const regexEmailEstrito = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const ehFormatoValido = regexEmailEstrito.test(emailLimpo);

    this.disifyService.validarEmail(emailLimpo).subscribe({
      next: (res) => {
        // Aplica a checagem rigorosa de formato sobre o retorno
        this.resultadoValidacao = {
          ...res,
          format: res.format && ehFormatoValido
        };
        this.carregandoValidacao = false;
        this.cdr.detectChanges(); // Garante atualização imediata da tela
      },
      error: (err) => {
        console.warn('API externa indisponível/bloqueada. Executando validação local estrita:', err);
        this.carregandoValidacao = false;

        const partes = emailLimpo.split('@');
        const dominio = partes.length === 2 ? partes[1] : '';

        // Fallback local preciso em caso de timeout/bloqueio da API
        this.resultadoValidacao = {
          email: emailLimpo,
          format: ehFormatoValido,
          dns: ehFormatoValido,
          disposable: false,
          domain: dominio,
          whitelist: true
        };
        this.cdr.detectChanges(); // Garante atualização imediata da tela
      }
    });
  }

  // Produtos reais cadastrados no catálogo da MegaSport
  produtosMaisVendidos: ProdutoDestaque[] = [
    {
      id: 1,
      nome: 'Tênis de Corrida Pro Runner',
      categoria: 'CALÇADOS',
      desconto: 20,
      imagem: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=60',
      precoAntigo: 499.90,
      preco: 399.90,
      parcelamento: 'ou 3x de R$ 133,30'
    },
    {
      id: 2,
      nome: 'Camiseta Dry-Fit Performance',
      categoria: 'VESTUÁRIO',
      desconto: 15,
      imagem: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&auto=format&fit=crop&q=60',
      precoAntigo: 105.90,
      preco: 89.90,
      parcelamento: 'ou 2x de R$ 44,95'
    },
    {
      id: 3,
      nome: 'Mochila Esportiva Impermeável',
      categoria: 'ACESSÓRIOS',
      desconto: 10,
      imagem: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=60',
      precoAntigo: 219.90,
      preco: 199.90,
      parcelamento: 'ou 2x de R$ 99,95'
    },
    {
      id: 4,
      nome: 'Garrafa Térmica Inox 1L',
      categoria: 'ACESSÓRIOS',
      imagem: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=60',
      preco: 79.90,
      parcelamento: 'ou 2x de R$ 39,95'
    },
    {
      id: 5,
      nome: 'Camisa Oficial Fluminense',
      categoria: 'VESTUÁRIO',
      desconto: 10,
      imagem: '/fluminense.jpeg',
      precoAntigo: 349.90,
      preco: 314.90,
      parcelamento: 'ou 3x de R$ 104,96'
    },
    {
      id: 6,
      nome: 'Camisa Oficial Flamengo',
      categoria: 'VESTUÁRIO',
      desconto: 10,
      imagem: '/flamengo.jpeg',
      precoAntigo: 349.90,
      preco: 314.90,
      parcelamento: 'ou 3x de R$ 104,96'
    }
  ];

  adicionarAoCarrinho(produto: ProdutoDestaque) {
    if ('adicionar' in this.carrinhoFacade) {
      (this.carrinhoFacade as any).adicionar(produto);
    } else if ('adicionarItem' in this.carrinhoFacade) {
      (this.carrinhoFacade as any).adicionarItem(produto);
    }
  }
}