import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private translate = inject(TranslateService);
  private authService = inject(AuthService);
  protected readonly title = signal('cake-store-ui');

  constructor() {
    this.translate.addLangs(['en', 'vi']);
    this.translate.use('vi');
    this.authService.loadUser();
  }
}
