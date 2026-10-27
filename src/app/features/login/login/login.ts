import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  email = '';
  senha = '';
  mensagemErro = '';

  // IDENTIFICA O LOGIN ADMINISTRATIVO
  get modoAdmin(): boolean {
    return this.router.url.split('?')[0] === '/admin/login';
  }

  // REALIZAR LOGIN
  fazerLogin(): void {

    this.mensagemErro = '';

    const email = this.email.trim();
    const senha = this.senha;

    if (!email || !senha) {
      this.mensagemErro = 'Preencha seu e-mail e sua senha.';
      return;
    }

    // LOGIN ADMINISTRATIVO
    if (this.modoAdmin) {

      const autorizado = this.authService.loginAdmin(
        email,
        senha
      );

      if (!autorizado) {
        this.mensagemErro =
          'E-mail ou senha de administrador incorretos.';
        return;
      }

      this.router.navigate(['/admin']);
      return;
    }

    // LOGIN DO CLIENTE
    const autorizado = this.authService.loginUsuario(
      email,
      senha
    );

    if (!autorizado) {
      this.mensagemErro =
        'E-mail não cadastrado ou credenciais inválidas.';
      return;
    }

    // VERIFICA SE EXISTE UMA PÁGINA DE RETORNO
    const returnUrl =
      this.activatedRoute.snapshot.queryParamMap.get('returnUrl');

    // PERMITE APENAS ROTAS INTERNAS SEGURAS
    const rotaValida =
      returnUrl &&
      returnUrl.startsWith('/') &&
      !returnUrl.startsWith('//') &&
      !returnUrl.includes('\\') &&
      !returnUrl.startsWith('/admin');

    if (rotaValida) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }
}