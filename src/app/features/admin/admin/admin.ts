import { Component, ElementRef, ViewChild, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProdutosService } from '../../../core/services/produtos.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin {
  private router = inject(Router);
  produtosService = inject(ProdutosService);

  @ViewChild('modalCadastro') modalCadastro!: ElementRef<HTMLDialogElement>;
  @ViewChild('modalProdutos') modalProdutos!: ElementRef<HTMLDialogElement>;
  @ViewChild('modalPedidos') modalPedidos!: ElementRef<HTMLDialogElement>;
  @ViewChild('modalUsuarios') modalUsuarios!: ElementRef<HTMLDialogElement>;

  novoProduto = {
    nome: '',
    preco: 0,
    categoria: 'GERAL',
    imagem: ''
  };

  editandoIndex: number | null = null;

  usuarioAtual = signal<any>({ email: 'admin@gmail.com', perfil: 'ADMIN' });
  mensagemPerfil = signal<string>('Usuário autenticado como ADMIN.');

  pedidos = signal([
    { id: 101, produto: 'Tênis de Corrida', status: 'Pendente' },
    { id: 102, produto: 'Camisa Dry-Fit', status: 'Pendente' },
    { id: 103, produto: 'Mochila Esportiva', status: 'Pendente' }
  ]);

  usuarios = signal([
    { email: 'admin@gmail.com', perfil: 'ADMIN' },
    { email: 'usuario1@gmail.com', perfil: 'CLIENTE' }
  ]);

  // Contador dinâmico baseado diretamente na quantidade real do serviço
  totalProdutos = computed(() => this.produtosService.obterProdutos().length);
  pedidosPendentes = signal<number>(3);
  usuariosCadastrados = signal<number>(8);

  abrirModalCadastro() {
    this.editandoIndex = null;
    this.novoProduto = { nome: '', preco: 0, categoria: 'GERAL', imagem: '' };
    this.modalCadastro.nativeElement.showModal();
  }

  abrirModalProdutos() {
    this.modalProdutos.nativeElement.showModal();
  }

  abrirModalPedidos() {
    this.modalPedidos.nativeElement.showModal();
  }

  abrirModalUsuarios() {
    this.modalUsuarios.nativeElement.showModal();
  }

  salvarProduto() {
    if (!this.novoProduto.nome || this.novoProduto.preco <= 0 || !this.novoProduto.imagem) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    if (this.editandoIndex !== null) {
      this.produtosService.atualizarProduto(this.editandoIndex, { ...this.novoProduto });
      this.editandoIndex = null;
    } else {
      this.produtosService.adicionarProduto({ ...this.novoProduto });
    }

    this.novoProduto = { nome: '', preco: 0, categoria: 'GERAL', imagem: '' };
    this.modalCadastro.nativeElement.close();
  }

  prepararEdicao(index: number, produto: any) {
    this.editandoIndex = index;
    this.novoProduto = { ...produto };
    this.modalProdutos.nativeElement.close();
    this.modalCadastro.nativeElement.showModal();
  }

  removerProduto(index: number) {
    this.produtosService.removerProduto(index);
  }

  removerPedido(id: number) {
    this.pedidos.update(lista => lista.filter(p => p.id !== id));
    this.pedidosPendentes.update(val => Math.max(0, val - 1));
  }

  removerUsuario(email: string) {
    if (email === 'admin@gmail.com') {
      alert('Não é possível remover o administrador principal.');
      return;
    }
    this.usuarios.update(lista => lista.filter(u => u.email !== email));
    this.usuariosCadastrados.update(val => Math.max(0, val - 1));
  }

  sair() {
    this.router.navigate(['/login']);
  }
}