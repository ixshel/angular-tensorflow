import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// Import mobilenet - which is the pre trained model from tensorflow
import * as mobilenet from '@tensorflow-models/mobilenet';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent implements OnInit {
  imgSrc: string;
  // Ensure Change Detection runs before accessing the instance
  // If you need to access it in ngOnInit hook just set as true
  @ViewChild('img', { static: false }) imageEl: ElementRef;

  predictions: Array<any> = [];

  model: any;
  loading: boolean = true;

  constructor() {}

  async fileChange(e: any) {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (res: any) => {
        if (res.target.result) {
          this.imgSrc = res.target.result;
          setTimeout(async () => {
            // now I have the image so I can run classify and get the model predictions
            const imgEl = this.imageEl.nativeElement;
            this.predictions = await this.model.classify(imgEl);
          }, 0);
        }
      };
    }
  }

  async ngOnInit() {
    console.log('loading mobilenet model...');
    this.model = await mobilenet.load();
    console.log('Sucessfully loaded model');
    this.loading = false;
  }
}
