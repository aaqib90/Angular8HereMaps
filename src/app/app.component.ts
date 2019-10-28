import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
  
declare var H: any;  
  
@Component({  
  selector: 'app-root',  
  templateUrl: './app.component.html',  
  styleUrls: ['./app.component.css']  
})  
export class AppComponent {  
  title = 'HereMapDemo';  
  
  @ViewChild("map", { static: true }) public mapElement: ElementRef;  
  
  public lat: any = '22.5726';  
  public lng: any = '88.3639';  
  
  public width: any = '1000px';  
  public height: any = '600px';  
  
  private platform: any;  
  private map: any;  
  
  private _appId: string = 'xxxxx';
  private _appCode: string = 'xxxx';  
  
  public query: string;  
  private search: any;  
  private ui: any;  
  public address: string = '';  
  
  public constructor() {  
    this.query = "";  
  }  
  
  public ngOnInit() {  
    this.platform = new H.service.Platform({  
      "app_id": this._appId,  
      "app_code": this._appCode,  
      useHTTPS: true  
    });  
    this.search = new H.places.Search(this.platform.getPlacesService());  
  }  
  
  public ngAfterViewInit() {  
    let pixelRatio = window.devicePixelRatio || 1;  
    let defaultLayers = this.platform.createDefaultLayers({  
      tileSize: pixelRatio === 1 ? 256 : 512,  
      ppi: pixelRatio === 1 ? undefined : 320  
    });  
  
    this.map = new H.Map(this.mapElement.nativeElement,  
      defaultLayers.normal.map, { pixelRatio: pixelRatio });
  
    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));  
    var ui = H.ui.UI.createDefault(this.map, defaultLayers);  
  
    this.map.setCenter({ lat: this.lat, lng: this.lng });  
    this.map.setZoom(14);
    this.dropMarker({ "lat": this.lat, "lng": this.lng }, {});
    // this.dropRectangle(event.bbox, event);
  
    this.setUpClickListener(this.map);  
  }

  results: string[];
  placeName: any;

  public  searchHandler(event) {
        this.places(event.query);
        // .then(data => {
        //     this.results = data;
        // });
    }
  
  public places(query: string) {  
    this.map.removeObjects(this.map.getObjects());  
    console.log('place name', this.placeName);
    // this.search.request({ "q": query, "at": this.lat + "," + this.lng }, {}, data => {
      this.search.request({ "q": query, "at": this.lat + "," + this.lng }, {}, data => {
      console.log(data);
      this.results = data.results.items;
      console.log('place name', this.placeName);
      // for (let i = 0; i < data.results.items.length; i++) {  
      //   this.dropMarker({ "lat": data.results.items[i].position[0], "lng": data.results.items[i].position[1] }, data.results.items[i]);
      //   this.dropRectangle(data.results.items[i].bbox, data.results.items[i]);
      //   // TODO : add Rect.

      //   if (i == 0)  
      //     this.map.setCenter({ lat: data.results.items[i].position[0], lng: data.results.items[i].position[1] })  
      // }  
    }, error => {  
      console.error(error);  
    });  
  }

  public onSelectPlace(event) {
    console.log(event);
    this.lat = event.position[0];
    this.lng = event.position[1];
    this.map.setCenter({ lat: this.lat, lng: this.lng });  
    this.map.setZoom(14);
    this.dropMarker({ "lat": this.lat, "lng": this.lng }, event);
    this.dropRectangle(event.bbox, event);
  }
  
  private dropMarker(coordinates: any, data: any) {  
    let marker = new H.map.Marker(coordinates);  
    marker.setData("<p>" + data.title + "<br>" + data.vicinity + "</p>");  
    marker.addEventListener('tap', event => {  
      let bubble = new H.ui.InfoBubble(event.target.getPosition(), {  
        content: event.target.getData()  
      });  
      this.ui.addBubble(bubble);  
    }, false);  
    this.map.addObject(marker);  
  }

  private dropRectangle(bbox: any, data: any) {
    console.log(bbox);
    // Create a style object:
    var customStyle = {
      strokeColor: 'black',
      fillColor: 'rgba(255, 255, 255, 0.5)',
      lineWidth: 5,
      lineCap: 'square',
      lineJoin: 'bevel'
    };

    // Create a rectangle and pass the custom style as an options parameter:
    var rect = new H.map.Rect(new H.geo.Rect(85.5, 24.8, 85.564, 24.92), 
      { style: customStyle });

    // Add the rectangle to the map:
    this.map.addObject(rect);

    // Instantiate a circle object (using the default style):
    var circle = new H.map.Circle({lat: this.lat, lng: this.lng}, 4000);

    // Add the circle to the map:
    this.map.addObject(circle);
    // this.map.setCenter({ lat: this.lat, lng: this.lng });  
    // this.map.setZoom(14);  
    // let rect = new H.map.Rect(coordinates); 
    // rect.setBoundingBox("<p>" + data.title + "<br>" + data.vicinity + "</p>");  
    // rect.addEventListener('tap', event => {  
    //   let bubble = new H.ui.InfoBubble(event.target.getPosition(), {  
    //     content: event.target.getData()  
    //   });  
    //   this.ui.addBubble(bubble);  
    // }, false);  
    // this.map.addObject(rect);  
  }
  
  public setUpClickListener(map: any) {  
    let self = this;  
    this.map.addEventListener('tap', function (evt) {  
      let coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);  
      self.lat = Math.abs(coord.lat.toFixed(4)) + ((coord.lat > 0) ? 'N' : 'S');  
      self.lng = Math.abs(coord.lng.toFixed(4)) + ((coord.lng > 0) ? 'E' : 'W');  
      self.fetchAddress(coord.lat, coord.lng);  
    });  
  }  
  
  private fetchAddress(lat: any, lng: any): void {  
    let self = this;  
    let geocoder: any = this.platform.getGeocodingService(),  
      parameters = {  
        prox: lat + ', ' + lng + ',20',  
        mode: 'retrieveAreas',  
        gen: '9'  
      };  
  
  
    geocoder.reverseGeocode(parameters,  
      function (result) {  
        let data = result.Response.View[0].Result[0].Location.Address;  
        self.address = data.Label + ', ' + data.City + ', Pin - ' + data.PostalCode + ' ' + data.Country;  
      }, function (error) {  
        alert(error);  
      });  
  }  
  
} 