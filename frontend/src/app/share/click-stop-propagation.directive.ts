import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[app-click-stop-propagation]',
})
export class ClickStopPropagationDirective {
  @HostListener('click', ['$event'])
  // eslint-disable-next-line class-methods-use-this
  public onClick(event: any): void {
    event.stopPropagation();
  }
}
