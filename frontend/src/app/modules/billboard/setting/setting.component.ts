import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import { Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { Config } from '../../../core/player/interface';
import { ConfigService } from '../../../core/services/config.service';
import { PersistService } from '../../../core/services/persist.service';
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements OnInit, OnDestroy {
  public step = 0;

  public config: Config;

  public settingFormGroup: FormGroup;

  public peaks = [
    // {
    //   name: '完整播放',
    //   duration: 0,
    // },
    {
      name: '20s',
      duration: 20,
    },
    {
      name: '25s',
      duration: 25,
    },
    {
      name: '30s',
      duration: 30,
    },
    {
      name: '35s',
      duration: 35,
    },
    {
      name: '40s',
      duration: 40,
    },
    {
      name: '45s',
      duration: 45,
    },
    {
      name: '50s',
      duration: 50,
    },
    {
      name: '55s',
      duration: 55,
    },
    {
      name: '60s',
      duration: 60,
    },
  ];

  private subscription: Subscription;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly configService: ConfigService,
    private readonly playerService: PlayerService,
  ) { }

  public ngOnInit() {
    this.subscription = this.whenPersistConfig()
      .subscribe(console.info, console.warn);
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public setStep(index: number) {
    this.step = index;
  }

  public selectionChange({ value }: MatSelectChange) {
    this.configService.changeConfig({
      peakConfig: {
        duration: value,
      },
    });
  }

  public setDefaultConfig() {
    console.info(PersistService.DEFAULT_CONFIG);
    this.configService.changeConfig(PersistService.DEFAULT_CONFIG)
      .pipe(
        map(() => {
          this.subscription.unsubscribe();
        }),
        switchMap(() => this.whenPersistConfig()),
      )
      .subscribe(console.info, console.warn);
  }

  private whenPersistConfig() {
    return this.configService.getConfig()
      .pipe(
        map((config) => {
          this.config = config;

          this.settingFormGroup = this.formBuilder.group({
            peakConfig: this.formBuilder.group({
              duration: [this.config.peakConfig.duration, Validators.required],
              minVolume: [this.config.peakConfig.minVolume, Validators.required],
              layIn: [this.config.peakConfig.layIn, Validators.required],
              layOut: [this.config.peakConfig.layOut, Validators.required],
              after: [this.config.peakConfig.after, Validators.required],
              before: [this.config.peakConfig.before, Validators.required],
            }),
            errorRetry: this.formBuilder.group({
              songRetries: [this.config.errorRetry.songRetries, Validators.required],
              playerRetries: [this.config.errorRetry.playerRetries, Validators.required],
            }),
            preloadLen: [this.config.preloadLen, Validators.required],
          });

          return this.settingFormGroup;
        }),
        switchMap((formGroup) => formGroup.valueChanges),
        filter(() => this.settingFormGroup.valid),
        switchMap((config) => {
          console.info('new config: ', config);

          return this.configService.changeConfig(config);
        }),
        map(() => this.playerService.loadNextSongs()),
      );
  }
}
