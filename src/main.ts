import 'zone.js';

import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';

import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { App } from './app/app';

// Registra os dados regionais para português do Brasil.
registerLocaleData(localePtBr, 'pt-BR');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));