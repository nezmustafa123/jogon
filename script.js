'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapEvent; //declare global variable for map

class App {
  //implement app class and methods put functionality in methods which will be called
  constructor() {}

  _getPosition() {
    //geolocation browser api on navigator takes two callbacks success and position
    if (navigator.geolocation) {
      //if geolocation exists and browser has permission do this
      navigator.geolocation.getCurrentPosition(this.__loadMap, function () {
        //because in class have to use this with __loadmap will pass in the parameter
        alert('Could not get your position');
      });
    }
  }

  _loadMap(position) {
    //position object
    //position argument
    const { latitude } = position.coords;
    //destructure latitude property
    const { longitude } = position.coords;
    //destructure longitude
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];
    //add event handler to map to listen for clicks use event handler coming from library
    map = L.map('map').setView(coords, 14); //reassign map
    console.log(map);
    //l variable global variable that's available in other scripts only works if scrpts file comes after
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    //map object generated leaflet with on method
    //handing clicks on map
    map.on('click', function (mapE) {
      mapEvent = mapE; //get coordinates from mapE copy it to global variable then access it later
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  }

  _toggleElevationField() {}

  _showForm() {}

  _togglElevationField() {}

  _newWorkout() {}
}
