import { ChangeDetectionStrategy, Component, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Component({
  selector: 'input[hotInput]',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrls: ['./input.ui-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputUiComponent {}
