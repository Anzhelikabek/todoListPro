import {Injectable} from '@angular/core';
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged, User
} from "firebase/auth";
import {firebaseApp} from '../firebase.config';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {UserService} from "./user.service"; // Убедитесь, что путь к файлу firebase.config.ts корректен

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth(firebaseApp);
  private currentUser: User | null = null;

  constructor(private userService: UserService) {
    // Слушатель состояния аутентификации
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });
  }
  getRoleByEmail(email: string): Observable<string> {
    return this.userService.getUsers().pipe(
        map((users) => {
          const user = users.find((user) => user.email === email);
          return user?.role || 'user'; // Возвращаем роль или "user" по умолчанию
        })
    );
  }


  isAdmin(email: string): Observable<boolean> {
    return this.getRoleByEmail(email).pipe(
        map((role) => role === 'admin') // Возвращаем true, если роль "admin"
    );
  }


  isLoggedIn(): boolean {
    return this.auth.currentUser !== null; // Проверка авторизации
  }
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password)
        .then((result) => {
          if (result.user?.email) {
            localStorage.setItem('userEmail', result.user.email); // Сохраняем email
            console.log('Email сохранён при регистрации:', result.user.email);
          }
          console.log('Registration Successful:', result.user);
          return result.user;
        })
        .catch((error) => {
          console.error('Registration Failed:', error);
          throw error;
        });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
        .then((result) => {
          if (result.user?.email) {
            localStorage.setItem('userEmail', result.user.email); // Сохраняем email
            console.log('Email сохранён при входе:', result.user.email);
          }
          console.log('Login Successful:', result.user);
          return result.user;
        })
        .catch((error) => {
          console.error('Login Failed:', error);
          throw error;
        });
  }


  // Метод для входа через Google
  googleSignIn() {
    const provider = new GoogleAuthProvider(); // Использование GoogleAuthProvider из Firebase
    return signInWithPopup(this.auth, provider)
      .then((result) => {
        const user = result.user;
        console.log('Google Sign-In Successful:', user);
        return user;
      })
      .catch((error) => {
        console.error('Error during Google Sign-In:', error);
        throw error;
      });
  }

  logout(): Promise<void> {
    return signOut(this.auth)
      .then(() => {
        // Очищаем localStorage
        localStorage.removeItem('userEmail');
        console.log('User signed out and localStorage cleared');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
        throw error; // Пробрасываем ошибку для обработки
      });
  }


  getCurrentUser() {
    return this.auth.currentUser;
  }
}
