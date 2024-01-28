import { Component, inject } from '@angular/core';
import { InputUiComponent } from '@hazeyu-ordering-tool-client/shared/ui-input';
import { ButtonUiComponent } from '@hazeyu-ordering-tool-client/shared/ui-button';
import { SignalState } from '@hazeyu-ordering-tool-client/core/util-state';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type State = {
}

@Component({
    selector: 'hot-login',
    templateUrl: './login.smart-component.html',
    styleUrls: ['./login.smart-component.scss'],
    standalone: true,
    imports: [
        InputUiComponent,
        ButtonUiComponent
    ]
})
export class LoginSmartComponent extends SignalState<State> {
    private readonly formBuilder = inject(FormBuilder);

    protected formGroup: FormGroup = new FormGroup({});

    public constructor() {
        super();


        this.buildForm();
    }

    private buildForm(): void {
        this.formGroup = this.formBuilder.group({
            email: ['', [Validators.required]],
            password: ['', [Validators.required]],
        });
    }
}