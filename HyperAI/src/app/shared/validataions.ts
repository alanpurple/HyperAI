import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const NameRe: RegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export function forbiddenNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = NameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  }
}
