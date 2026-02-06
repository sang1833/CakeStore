import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-our-story',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    <div class="story-container">
      <section class="hero glass-panel">
        <h1>{{ 'STORY.TITLE' | translate }}</h1>
        <p class="subtitle">{{ 'STORY.SUBTITLE' | translate }}</p>
      </section>
      
      <section class="content">
        <div class="image-box">
             <!-- Placeholder for story image -->
             <div class="placeholder-img">🍰</div>
        </div>
        <div class="text-box glass-panel">
            <h2>{{ 'STORY.BEGINNING_TITLE' | translate }}</h2>
            <p [innerHTML]="'STORY.BEGINNING_TEXT_1' | translate"></p>
            <p>{{ 'STORY.BEGINNING_TEXT_2' | translate }}</p>
            <h2>{{ 'STORY.PHILOSOPHY_TITLE' | translate }}</h2>
            <p [innerHTML]="'STORY.PHILOSOPHY_TEXT' | translate"></p>
            <div class="signature">
                <p>{{ 'STORY.SIGNATURE' | translate }}</p>
                <p><em>The CakeStore Team</em></p>
            </div>
        </div>
      </section>
    </div>
  `,
    styles: [`
    .story-container {
        max-width: 900px;
        margin: 0 auto;
        padding: var(--spacing-lg);
    }
    
    .hero {
        text-align: center;
        padding: 4rem 2rem;
        margin-bottom: var(--spacing-xl);
        
        h1 {
            color: var(--color-secondary);
            font-size: 3rem;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            font-family: var(--font-header);
            font-size: 1.5rem;
            color: var(--color-primary-dark);
        }
    }
    
    .content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: center;
        
        @media(max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }
    
    .placeholder-img {
        width: 100%;
        height: 300px;
        background: #fdf6e9; /* Vanilla tint */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 5rem;
        border-radius: var(--radius-card);
        border: 2px dashed var(--color-primary-light);
    }
    
    .text-box {
        padding: 2rem;
        
        h2 {
            color: var(--color-secondary);
            margin-top: 0;
            margin-bottom: 1rem;
        }
        
        p {
            line-height: 1.6;
            margin-bottom: 1rem;
            color: var(--color-text-main);
        }
        
        .signature {
            margin-top: 2rem;
            font-family: var(--font-header);
            color: var(--color-primary-dark);
        }
    }
  `]
})
export class OurStoryComponent { }
