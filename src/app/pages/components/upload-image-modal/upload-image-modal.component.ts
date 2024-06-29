import { CommonModule } from '@angular/common';
import { Component, EventEmitter, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

export interface respuestaUploadImage {
  file: File;
  url: string;
}

@Component({
  selector: 'app-upload-image-modal',
  standalone: true,
  imports: [ImageCropperComponent, CommonModule],
  templateUrl: './upload-image-modal.component.html',
  styleUrl: './upload-image-modal.component.scss'
})
export class UploadImageModalComponent {
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;
  respuesta = new EventEmitter<respuestaUploadImage>();

  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedEvent!: ImageCroppedEvent;
  canvasRotation = 0;
  cropperStaticWidth = 428;
  cropperStaticHeight = 185;
  loadingForm = false;

  constructor(public readonly ModalRef: BsModalRef) {}

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
    this.croppedEvent = event;
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.imageCropper.transform.flipH;
    const flippedV = this.imageCropper.transform.flipV;
    this.imageCropper.transform = {
      ...this.imageCropper.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  uploadImage() {
    const blob  = this.croppedEvent.blob;
    const file: File = this.imageChangedEvent.target.files[0]
    console.log(this.croppedEvent, this.imageChangedEvent.target.files[0]);

    const resp: File = new File([blob!], file.name, { type: 'image/png' });
    console.log(resp);

    this.respuesta.emit({ file: resp, url: this.croppedImage });
    this.ModalRef.hide()
  }
}
