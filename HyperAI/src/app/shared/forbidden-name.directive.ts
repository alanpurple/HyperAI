import { Directive } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";
import { forbiddenNameValidator } from './validataions';

@Directive({
  selector: '[appForbiddenName]',
  providers: [{
    provide: NG_VALIDATORS, useExisting: ForbiddenValidatorDirective,
    multi: true
  }]
})
export class ForbiddenValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return forbiddenNameValidator()(control);
  }
}
