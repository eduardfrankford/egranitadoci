import { Component, input } from '@angular/core';
import { FaqItem } from '../../content/types';

/**
 * FAQ-Akkordeon auf Basis von <details>/<summary>: ohne JavaScript bedienbar,
 * Inhalte stehen vollständig im HTML (gut für Suchmaschinen und KI-Suche).
 */
@Component({
  selector: 'app-faq',
  template: `
    <div class="faq">
      @for (item of items(); track item.q) {
        <details class="faq-item" [attr.name]="group()">
          <summary>
            <span>{{ item.q }}</span>
            <svg
              class="icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </summary>
          <div class="answer">
            @for (p of item.a; track $index) {
              <p>{{ p }}</p>
            }
            @if (item.list?.length) {
              <ul>
                @for (li of item.list; track $index) {
                  <li>{{ li }}</li>
                }
              </ul>
            }
          </div>
        </details>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .faq {
      max-width: 820px;
      margin-inline: auto;
      text-align: left;
      border-top: 1px solid var(--c-line);
    }
    .faq-item {
      border-bottom: 1px solid var(--c-line);
    }
    summary {
      list-style: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.9rem 0.25rem;
      min-height: 48px;
      color: var(--c-heading);
      font-weight: 700;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    .icon {
      flex: none;
      transition: transform 0.25s var(--ease);
    }
    details[open] .icon {
      transform: rotate(180deg);
    }
    .answer {
      padding: 0 0.25rem 1rem;
    }
    .answer p:last-child,
    .answer ul:last-child {
      margin-bottom: 0;
    }
  `,
})
export class Faq {
  readonly items = input.required<FaqItem[]>();
  /** Gleicher Name = nur ein Eintrag gleichzeitig offen (natives Akkordeon). */
  readonly group = input<string | null>(null);
}
