import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'precoFormatado',
  standalone: true
})
export class PrecoFormatadoPipe implements PipeTransform {
  transform(valor: number): string {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }
}