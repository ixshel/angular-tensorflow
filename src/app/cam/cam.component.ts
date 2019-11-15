import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';

// import the model that we are going to use
import * as ts from '@tensorflow/tfjs';
// import * as tf from '@tensorflow/tfjs-core';
import * as cocoSSD from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';

@Component({
  selector: 'app-cam',
  templateUrl: './cam.component.html',
  styleUrls: ['./cam.component.scss']
})
export class CamComponent implements OnInit {
  model;
  modelType: string = null;
  startCamera: boolean = false;
  liveVid: any = null;
  loading: boolean = false;
  predictions: Array<any> = [];
  selectedCam: any = { facingMode: 'user' };
  @ViewChild('video', { static: true }) video: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  constructor(private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    console.log('cam app');
  }

  async selectCamera(camera: string) {
    if (this.liveVid && this.liveVid.srcObject) {
      console.log('video: ', this.liveVid.srcObject.getTracks()[0]);
      this.liveVid.srcObject.getTracks()[0].stop();
    }
    await this.initCamera(camera);
  }

  private initCamera(camera?: string) {
    this.liveVid = this.video.nativeElement;
    this.loading = false;
    console.log('set camera: ', camera);

    let selectedCam: any = null;
    if (camera === 'front') {
      selectedCam = { facingMode: 'user' };
    }

    if (camera === 'rear') {
      selectedCam = { facingMode: { exact: 'environment' } };
    }

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: selectedCam,
          audio: false
        })
        .then(stream => {
          this.liveVid.srcObject = stream;
        })
        .catch(error => {
          alert('device camera not available');
          console.log('We have an error: ', JSON.stringify(error));
        });
    }
  }

  async selectModel(selectedModel?: string) {
    this.loading = true;
    if (selectedModel === 'CocoSSD') {
      // you can pass 'lite_mobilenet_v2' as argument
      this.model = await cocoSSD.load();
      if (this.model) {
        this.loading = false;
        this.detectFrame();
      }
    }

    if (selectedModel === 'Mobilinet') {
      this.model = await mobilenet.load();
    }

  }

  withMobilinet() {
    setInterval(async () => {
      // mobilinet
      this.predictions = await this.model.classify(this.video.nativeElement);
      await ts.nextFrame();
    }, 3000);
  }

  detectFrame() {
    this.model
      .detect(this.video.nativeElement)
      .then(preds => {
        this.predictions = preds;
        this.renderPredictions();
        requestAnimationFrame(() => {
          this.detectFrame();
        });
      })
      .catch(error => {
        console.log('Error: ', error);
      });
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
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Bounding box
      this.ctx.strokeStyle = '#00FFFF';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);
      // Label background
      this.ctx.fillStyle = '#00FFFF';
      const textWidth = this.ctx.measureText(prediction.class).width;
      const textHeight = parseInt('16px sans-serif', 10); // base 10
      this.ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
      // Draw the text
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(prediction.class, x, y);
    });
  }
}
