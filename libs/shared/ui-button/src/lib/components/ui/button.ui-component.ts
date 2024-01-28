import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'button[hotButton]',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrls: ['./button.ui-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonUiComponent {}
