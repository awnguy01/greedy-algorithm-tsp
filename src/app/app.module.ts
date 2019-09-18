import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { GreedyService } from './services/greedy.service';

@NgModule({
  declarations: [AppComponent, MainComponent, FileUploadComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [GreedyService],
  bootstrap: [AppComponent]
})
export class AppModule {}
