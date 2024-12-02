import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { firebaseConfig } from './app/firebase.config';
import { routes } from './app/app.routes';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MessageService} from 'primeng/api';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideNoopAnimations(),
    MessageService,
    provideRouter(routes), // Маршруты
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Инициализация Firebase
    provideAuth(() => getAuth()), // Инициализация Auth
  ],
}).catch((err) => console.error(err));
