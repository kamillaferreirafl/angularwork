import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  DisifyService,
  DisifyResponse
} from '../../core/services/disify.service';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class CadastroComponent {

  private disifyService = inject(DisifyService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  etapa = 1;
  contaCriada = false;
  mensagemErro = '';

  dados = {
    documento: '',
    dataNascimento: '',
    nome: '',
    sobrenome: '',
    genero: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  };

  resultadoValidacaoEmail: DisifyResponse | null = null;
  carregandoValidacaoEmail = false;

  get tem8Caracteres(): boolean {
    return this.dados.senha.length >= 8;
  }

  get temMinuscula(): boolean {
    return /[a-z]/.test(this.dados.senha);
  }

  get temMaiuscula(): boolean {
    return /[A-Z]/.test(this.dados.senha);
  }

  get temDigito(): boolean {
    return /[0-9]/.test(this.dados.senha);
  }

  get temEspecial(): boolean {
    return /[$#@!%*?&]/.test(this.dados.senha);
  }

  get senhasConferem(): boolean {
    return (
      this.dados.senha !== '' &&
      this.dados.senha === this.dados.confirmarSenha
    );
  }

  get senhaValida(): boolean {
    return (
      this.tem8Caracteres &&
      this.temMinuscula &&
      this.temMaiuscula &&
      this.temDigito &&
      this.temEspecial &&
      this.senhasConferem
    );
  }

  get emailValido(): boolean {
    return !!(
      this.resultadoValidacaoEmail &&
      this.resultadoValidacaoEmail.format &&
      this.resultadoValidacaoEmail.dns &&
      !this.resultadoValidacaoEmail.disposable &&
      !this.resultadoValidacaoEmail.sugestao
    );
  }

  validarEmail(): void {
    const emailLimpo = this.dados.email.trim();

    if (!emailLimpo) {
      this.resultadoValidacaoEmail = null;
      return;
    }

    this.carregandoValidacaoEmail = true;
    this.resultadoValidacaoEmail = null;

    this.disifyService.validarEmail(emailLimpo).subscribe({
      next: (res: DisifyResponse) => {
        this.resultadoValidacaoEmail = res;
        this.carregandoValidacaoEmail = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.warn('Erro na validação do e-mail:', err);
        this.carregandoValidacaoEmail = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarSugestaoEmail(): void {
    if (this.resultadoValidacaoEmail?.sugestao) {
      this.dados.email = this.resultadoValidacaoEmail.sugestao;
      this.resultadoValidacaoEmail = null;
      this.validarEmail();
    }
  }

  proximaEtapa(): void {
    if (
      this.dados.documento &&
      this.dados.dataNascimento &&
      this.dados.nome &&
      this.dados.sobrenome &&
      this.dados.genero &&
      this.dados.telefone
    ) {
      this.etapa = 2;
    }
  }

  concluirCadastro(): void {
    this.mensagemErro = '';

    if (!this.senhaValida || !this.emailValido) {
      this.mensagemErro =
        'Verifique seu e-mail e os requisitos da senha.';
      return;
    }

    const nomeCompleto =
      `${this.dados.nome} ${this.dados.sobrenome}`.trim();

    const cadastrado = this.authService.cadastrarUsuario(
      nomeCompleto,
      this.dados.email
    );

    if (!cadastrado) {
      this.mensagemErro =
        'Este e-mail já está cadastrado ou os dados são inválidos.';
      return;
    }

    this.contaCriada = true;

    // Limpa os campos sensíveis da memória do componente.
    this.dados.senha = '';
    this.dados.confirmarSenha = '';
    this.dados.documento = '';
    this.dados.dataNascimento = '';
    this.dados.telefone = '';
  }
}