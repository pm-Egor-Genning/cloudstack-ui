import { Directive, Input, OnChanges, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[csValidatorsFeedback]',
})
export class ValidatorsFeedbackDirective implements OnChanges {
  @Input() control: FormControl;
  @Input() errorMessages: { [key: string]: string };
  @Input() bounds: { lowerLimit: number; upperLimit: number };
  private el: any;

  constructor(element: ElementRef, private translateService: TranslateService) {
    this.el = element.nativeElement;
  }

  public ngOnChanges() {
    this.control.valueChanges.subscribe(() => this._printError());
    this._printError();
  }

  public errorMessageByKey(key: string): Observable<string> {
    return this.translateService.instant(this.errorMessages[key], this.bounds);
  }

  private _printError(): void {
    if (this.control.invalid) {
      const errors: string[] = Object.keys(this.control.errors || {}); // @todo sort by priority
      // example 'required':'VM_PAGE.STORAGE_DETAILS.VOLUME_RESIZE.SIZE_IS_REQUIRED'
      // example 'min':'VM_PAGE.STORAGE_DETAILS.VOLUME_RESIZE.BETWEEN'
      // example 'max':'VM_PAGE.STORAGE_DETAILS.VOLUME_RESIZE.BETWEEN'
      // example 'integerValidator':'VM_PAGE.STORAGE_DETAILS.VOLUME_RESIZE.INTEGER'
      let key: string;
      // @TODO DIRTY HACK
      if (errors.hasOwnProperty('min') && errors.hasOwnProperty('max')) {
        key = 'between';
      } else {
        key = errors[0];
      }
      if (this.errorMessages.hasOwnProperty(key)) {
        this.el.innerHTML = this.errorMessageByKey(key);
      } else {
        throw new Error(`Unknown error key ${key}`);
      }
    } else {
      this.el.innerHTML = '';
    }
  }
}