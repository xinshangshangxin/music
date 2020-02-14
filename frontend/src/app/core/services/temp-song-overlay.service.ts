import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { TempSongOverlayComponent } from '../../modules/billboard/temp-song-overlay/temp-song-overlay.component';

@Injectable({
  providedIn: 'root',
})
export class TempSongOverlayService {
  private overlayRef: OverlayRef | null = null;

  constructor(private readonly overlay: Overlay) {}

  public toggle() {
    if (this.overlayRef) {
      this.close();
    } else {
      this.open();
    }
  }

  public open() {
    this.overlayRef = this.overlay.create(this.getOverlayConfig());
    const tempSongPortal = new ComponentPortal(TempSongOverlayComponent);

    this.overlayRef.attach(tempSongPortal);
    this.overlayRef.addPanelClass('temp-song-overlay');

    this.overlayRef
      .backdropClick()
      .pipe(takeUntil(this.overlayRef.detachments()))
      .subscribe(() => {
        this.close();
      }, console.warn);
  }

  public close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private getOverlayConfig() {
    const baseConfig = {
      scrollStrategy: this.overlay.scrollStrategies.close(),
      disposeOnNavigation: true,
      hasBackdrop: true,
    };

    // window width is at less than
    if (window.matchMedia('(max-width: 700px)').matches) {
      console.info('手机版');

      return {
        ...baseConfig,
        positionStrategy: this.overlay
          .position()
          .global()
          .top('200px')
          .width('100%'),
      };
    }

    console.info('桌面版');
    return {
      ...baseConfig,
      backdropClass: 'temp-song-backdrop',
      positionStrategy: this.overlay
        .position()
        .global()
        .right('0px')
        .height('100%'),
    };
  }
}
