import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DisifyResponse {
  email: string;
  format: boolean;
  domain: string;
  disposable: boolean;
  dns: boolean;
  whitelist: boolean;
  sugestao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DisifyService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.disify.com/api/email';

  // --- CONJUNTO COMPLETO DE DOMÍNIOS VÁLIDOS PERMITIDOS ---
  private dominiosValidos = new Set([
    // Globais
    'gmail.com', 'googlemail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
    'icloud.com', 'me.com', 'mac.com', 'msn.com', 'live.com', 'aol.com',
    'zoho.com', 'mail.com', 'email.com', 'yandex.com', 'protonmail.com',
    'proton.me', 'tutanota.com', 'tutamail.com', 'tuta.io', 'fastmail.com',
    'duck.com',

    // Brasil & Portugal
    'yahoo.com.br', 'hotmail.com.br', 'outlook.com.br', 'live.com.br',
    'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 
    'globo.com', 'globomail.com', 'globo.com.br',
    'oi.com.br', 'r7.com', 'zipmail.com.br', 'sapo.pt',

    // Institucionais / Académicos Comuns
    'usp.br', 'ufrj.br', 'unicamp.br', 'ufmg.br', 'puc-rio.br', 'pucsp.br',
    'pucrs.br', 'unesp.br', 'ufsc.br', 'ufrgs.br', 'uff.br', 'uerj.br'
  ]);

  // --- MAPEAMENTO COMPLETO DE ERROS DE DIGITAÇÃO ---
  private mapaErrosDigitacao: { [key: string]: string } = {
    // --- GMAIL / GOOGLEMAIL ---
    'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmal.com': 'gmail.com',
    'gmaill.com': 'gmail.com', 'gmaik.com': 'gmail.com', 'gmain.com': 'gmail.com',
    'gmial.com': 'gmail.com', 'gmil.com': 'gmail.com', 'gmaim.com': 'gmail.com',
    'gmaiol.com': 'gmail.com', 'gmail.com.br': 'gmail.com', 'gmail.br': 'gmail.com',
    'gmail.co.br': 'gmail.com', 'g-mail.com': 'gmail.com', 'g.mail.com': 'gmail.com',
    'qmail.com': 'gmail.com', 'fmail.com': 'gmail.com', 'hmail.com': 'gmail.com',
    'googlemial.com': 'googlemail.com', 'googlemal.com': 'googlemail.com',

    // --- HOTMAIL ---
    'hotmai.com': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmaill.com': 'hotmail.com',
    'hotamail.com': 'hotmail.com', 'hotmaik.com': 'hotmail.com', 'hotmain.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com', 'hotmil.com': 'hotmail.com', 'hotmali.com': 'hotmail.com',
    'hotmeil.com': 'hotmail.com', 'hotmail.br': 'hotmail.com.br', 'hot-mail.com': 'hotmail.com',
    'jotmail.com': 'hotmail.com', 'notmail.com': 'hotmail.com', 'gotmail.com': 'hotmail.com',

    // --- OUTLOOK ---
    'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outllok.com': 'outlook.com',
    'outlik.com': 'outlook.com', 'outloc.com': 'outlook.com', 'outlokk.com': 'outlook.com',
    'autlook.com': 'outlook.com', 'otlook.com': 'outlook.com', 'outloook.com': 'outlook.com',
    'outook.com': 'outlook.com', 'outllok.com.br': 'outlook.com.br', 'outlok.com.br': 'outlook.com.br',
    'outlook.br': 'outlook.com.br',

    // --- YAHOO ---
    'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahho.com': 'yahoo.com',
    'yaho.com.br': 'yahoo.com.br', 'yahooo.com.br': 'yahoo.com.br', 'yahho.com.br': 'yahoo.com.br',
    'uahoo.com': 'yahoo.com', 'tahoo.com': 'yahoo.com', 'gahoo.com': 'yahoo.com',

    // --- ICLOUD / APPLE (ME, MAC) ---
    'iclou.com': 'icloud.com', 'iclocd.com': 'icloud.com', 'iclloud.com': 'icloud.com',
    'icloud.com.br': 'icloud.com', 'ocloud.com': 'icloud.com', 'mee.com': 'me.com',
    'macc.com': 'mac.com',

    // --- MSN / LIVE / AOL / ZOHO / YANDEX ---
    'msnn.com': 'msn.com', 'msm.com': 'msn.com', 'liv.com': 'live.com',
    'livee.com': 'live.com', 'live.br': 'live.com.br', 'aoll.com': 'aol.com',
    'zohoo.com': 'zoho.com', 'yandexx.com': 'yandex.com', 'yandec.com': 'yandex.com',

    // --- PROTONMAIL / TUTANOTA / FASTMAIL / DUCK ---
    'protonmai.com': 'protonmail.com', 'protonmial.com': 'protonmail.com',
    'proton.com': 'proton.me', 'protom.me': 'proton.me', 'tutanot.com': 'tutanota.com',
    'tutamail.co': 'tutamail.com', 'fastmai.com': 'fastmail.com', 'duckk.com': 'duck.com',

    // --- GLOBO / GLOBOMAIL ---
    'glob.com': 'globo.com', 'golobo.com': 'globo.com', 'globoo.com': 'globo.com',
    'globomai.com': 'globomail.com', 'globomial.com': 'globomail.com', 'globomail.com.br': 'globomail.com',

    // --- UOL / BOL / TERRA / IG / OI / R7 / ZIPMAIL / SAPO ---
    'uol.com': 'uol.com.br', 'uol.co.br': 'uol.com.br', 'uoll.com.br': 'uol.com.br',
    'bol.com': 'bol.com.br', 'bol.co.br': 'bol.com.br', 'boll.com.br': 'bol.com.br',
    'terra.com': 'terra.com.br', 'tera.com.br': 'terra.com.br', 'ig.com': 'ig.com.br',
    'igg.com.br': 'ig.com.br', 'oii.com.br': 'oi.com.br', 'r77.com': 'r7.com',
    'zipmai.com.br': 'zipmail.com.br', 'zipmail.com': 'zipmail.com.br', 'sapo.com': 'sapo.pt',

    // --- INSTITUCIONAIS / ACADÉMICOS ---
    'uspp.br': 'usp.br', 'usp.com.br': 'usp.br', 'ufrjj.br': 'ufrj.br', 'ufrj.com.br': 'ufrj.br',
    'unicam.br': 'unicamp.br', 'unicamp.com.br': 'unicamp.br', 'ufmgg.br': 'ufmg.br',
    'pucrio.br': 'puc-rio.br', 'puc-rio.com.br': 'puc-rio.br', 'puc-sp.br': 'pucsp.br',
    'puc-rs.br': 'pucrs.br', 'unespp.br': 'unesp.br', 'ufscc.br': 'ufsc.br',
    'ufrgss.br': 'ufrgs.br', 'ufff.br': 'uff.br', 'uerjj.br': 'uerj.br'
  };

  // --- E-MAILS TEMPORÁRIOS BLOQUEADOS ---
  private dominiosDescartaveis = new Set([
    '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'trashmail.com', 'dispostable.com', 'getnada.com',
    'sharklasers.com', 'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com',
    'guerrillamailblock.com', '10minutemail.net'
  ]);

  validarEmail(email: string): Observable<DisifyResponse> {
    const emailLimpo = email.trim();
    const partes = emailLimpo.split('@');
    const usuario = partes[0] || '';
    const dominioDigitado = partes.length === 2 ? partes[1].toLowerCase() : '';

    const regexEmailEstrito = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const estruturaValida = regexEmailEstrito.test(emailLimpo);

    let sugestaoDominio: string | undefined = undefined;

    // 1. Verifica se é um domínio/subdomínio estritamente válido
    const ehSubdominioValido = Array.from(this.dominiosValidos).some(valido => dominioDigitado.endsWith('.' + valido));
    const ehDominioAutorizado = this.dominiosValidos.has(dominioDigitado) || ehSubdominioValido;

    // 2. Se não estiver na lista de permitidos, tenta encontrar uma sugestão
    if (!ehDominioAutorizado && dominioDigitado) {
      if (this.mapaErrosDigitacao[dominioDigitado]) {
        sugestaoDominio = this.mapaErrosDigitacao[dominioDigitado];
      } else {
        // Detecta falhas de digitação na extensão (.co, .cm, .con, .com.b, etc.)
        for (const dominioOficial of this.dominiosValidos) {
          const partesOficiais = dominioOficial.split('.');
          const partesDigitadas = dominioDigitado.split('.');

          if (partesOficiais[0] === partesDigitadas[0] && partesOficiais.length === partesDigitadas.length) {
            const extOficial = partesOficiais.slice(1).join('.');
            const extDigitada = partesDigitadas.slice(1).join('.');

            if (extOficial !== extDigitada && (
              extOficial.startsWith(extDigitada) || 
              extDigitada === 'co' || extDigitada === 'cm' || extDigitada === 'c' || extDigitada === 'con' || extDigitada === 'com.b'
            )) {
              sugestaoDominio = dominioOficial;
              break;
            }
          }
        }
      }
    }

    const ehDescartavel = this.dominiosDescartaveis.has(dominioDigitado);
    
    // Regra estrita: O e-mail só é válido se estiver no formato estrito, não tiver sugestão de erro E for um domínio explicitamente autorizado
    const ehFormatoValido = estruturaValida && !sugestaoDominio && ehDominioAutorizado;

    return this.http.get<DisifyResponse>(`${this.apiUrl}/${emailLimpo}`).pipe(
      map(res => ({
        ...res,
        format: res.format && ehFormatoValido,
        dns: res.dns && ehFormatoValido && !ehDescartavel,
        disposable: res.disposable || ehDescartavel,
        sugestao: sugestaoDominio ? `${usuario}@${sugestaoDominio}` : undefined
      })),
      catchError(() => {
        return of({
          email: emailLimpo,
          format: ehFormatoValido,
          domain: dominioDigitado,
          disposable: ehDescartavel,
          dns: ehFormatoValido && !ehDescartavel,
          whitelist: ehDominioAutorizado,
          sugestao: sugestaoDominio ? `${usuario}@${sugestaoDominio}` : undefined
        });
      })
    );
  }
}