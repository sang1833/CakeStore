import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    standalone: true,
    template: `
    <footer>
      <div class="content">
        <div class="brand">
          <h3>La Patisserie</h3>
          <p>Handcrafted sweets for your sweetest moments.</p>
        </div>
        <div class="links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <div class="copy">
          &copy; 2026 CakeStore. All rights reserved.
        </div>
      </div>
    </footer>
  `,
    styles: [`
    footer {
      background: var(--color-secondary);
      color: var(--color-text-light);
      padding: var(--spacing-xl) 0;
      margin-top: var(--spacing-xl);
    }

    .content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      text-align: center;
    }

    .brand h3 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-xs);
    }

    .brand p {
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .links {
      display: flex;
      gap: var(--spacing-md);
      
      a {
        color: var(--color-text-light);
        opacity: 0.6;
        font-size: 0.85rem;
        &:hover { opacity: 1; }
      }
    }

    .copy {
      font-size: 0.8rem;
      opacity: 0.4;
    }
  `]
})
export class FooterComponent { }
