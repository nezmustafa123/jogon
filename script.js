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

//geolocation browser api on navigator takes two callbacks success and position
if (navigator.geolocation) {
  //if geolocation exists and browser has permission do this
  navigator.geolocation.getCurrentPosition(
    function (position) {
      //position object
      //position argument
      const { latitude } = position.coords;
      //destructure latitude property
      const { longitude } = position.coords;
      //destructure longitude
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      const coords = [latitude, longitude];
      //add event handler to map to listen for clicks use event handler coming from library
      const map = L.map('map').setView(coords, 14);
      console.log(map);
      //l variable global variable that's available in other scripts only works if scrpts file comes after
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //map object generated leaflet with on method
      map.on('click', function (mapEvent) {
        //takes in special 'map' event from leaflet library
        console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng; //descructure from latlng property which is object
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              // maxHeight: 250,
              autolose: false,
              closeOnClick: false,
              className: 'running-popup',
            })
          )
          .setPopupContent('Workout')
          .openPopup();
      });
    },
    function () {
      alert('Could not get your position');
    }
  );
}

//render workout that's not yet a workout put pin or marker on map replace that with data coming from workout
