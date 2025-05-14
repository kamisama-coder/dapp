import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SongService } from './song.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FormsModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  song = '';
  response: any;
  song_list: string[] = [];

  constructor(private songservice: SongService) {}

  submitCity() {
    this.songservice.sendCity(this.song).subscribe((res) => {
      this.response = res;
    });
  }

  update(x: string) {
    this.songservice.getmp3(x).subscribe((res) => {
      this.response = res;
    });
  }

}
