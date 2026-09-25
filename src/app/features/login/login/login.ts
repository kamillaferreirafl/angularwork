import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  ehUsuario = true;
  email = '';
  senha = '';

  fazerLogin() {
    // Caso o AuthService aceite apenas o método login() padrão
    if (typeof (this.authService as any).login === 'function') {
      (this.authService as any).login(this.email, this.senha);
    } else if (typeof (this.authService as any).loginUsuario === 'function') {
      (this.authService as any).loginUsuario(this.email, this.senha);
    }

    this.router.navigate(['/']);
  }
}