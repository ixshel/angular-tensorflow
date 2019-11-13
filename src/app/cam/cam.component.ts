import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';

// import the model that we are going to use
import * as ts from '@tensorflow/tfjs';
import * as tf from '@tensorflow/tfjs-core';
import * as cocoSSD from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';

@Component({
  selector: 'app-cam',
  templateUrl: './cam.component.html',
  styleUrls: ['./cam.component.scss']
})
export class CamComponent implements OnInit {
  model;
  loading: boolean = true;
  predictions: Array<any> = [];
  @ViewChild('video', { static: true }) video: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  constructor(private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    console.log('cam app');
    // to start the camera
    await this.startCamera();

    // With mobilinet model
    // this.model = await mobilenet.load();
    // this.withMobilinet();

    // with cocoSSD
    await this.predictiveWithCocoSSD();
  }

  startCamera() {
    const liveVid = this.video.nativeElement;
    this.loading = false;

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: 'user'
          },
          audio: false
        })
        .then(stream => {
          console.log('live...');
          liveVid.srcObject = stream;
          // if you dont set autoplay in the html
          // liveVid.play();
        })
        .catch(error => {
          console.log(`We have an error: ${error}`);
        });
    }
  }

  withMobilinet() {
    setInterval(async () => {
      // mobilinet
      this.predictions = await this.model.classify(this.video.nativeElement);
      await ts.nextFrame();
    }, 3000);
  }

  async predictiveWithCocoSSD() {
    // you can pass 'lite_mobilenet_v2' as argument
    this.model = await cocoSSD.load();
    this.video.nativeElement.addEventListener('loadeddata', () => {
      this.detectFrame();
    });
  }

  detectFrame() {
    // console.log('detect frame...');
    // setTimeout(() => {
      this.model.detect(this.video.nativeElement)
      .then(preds => {
        // console.log('Predictions: ', preds);
        this.predictions = preds;
        this.renderPredictions();
        requestAnimationFrame(() => {
          this.detectFrame();
        });
      })
      .catch(error => {
        console.log('Error: ', error);
      });
    // }, 300);
  }

  renderPredictions() {

    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.width = 300;
    this.canvas.nativeElement.height = 225;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.font = '16px sans-serif';
    this.ctx.textBaseline = 'top';
    this.ctx.drawImage(this.video.nativeElement, 0, 0, 300, 225);

    this.predictions.forEach(prediction => {
      const x = prediction.bbox[0] + (100/2);
      const y = prediction.bbox[1] - 20;
      const width = prediction.bbox[2] / 5;
      const height = prediction.bbox[3] / 5;
          // Bounding box
      this.ctx.strokeStyle = '#00FFFF';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);
          // Label background
      this.ctx.fillStyle = '#00FFFF';
      const textWidth = this.ctx.measureText(prediction.class).width;
      const textHeight = parseInt('16px sans-serif', 10); // base 10
      this.ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    this.predictions.forEach(prediction => {
      const x = prediction.bbox[0] + (100/2);
      const y = prediction.bbox[1] - 20;
      // Draw the text last to ensure it's on top.
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(prediction.class, x, y);
    });
  }
}
