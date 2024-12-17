import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import {HttpClient, HttpClientModule, provideHttpClient} from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { firebaseConfig } from './app/firebase.config';
import { routes } from './app/app.routes';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';
import {MessageService} from 'primeng/api';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {importProvidersFrom} from "@angular/core";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          },
        })
    ),
    provideHttpClient(),
    provideNoopAnimations(),
    MessageService,
    provideAnimations(),
    provideRouter(routes), // Маршруты
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Инициализация Firebase
    provideAuth(() => getAuth()), // Инициализация Auth
  ],
}).catch((err) => console.error(err));
