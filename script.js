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
    },
    function () {
      alert('Could not get your position');
    }
  );
}

//render workout that's not yet a workout put pin or marker on map replace that with data coming from workout
form.addEventListener('submit', function (e) {
  e.preventDefault();
  //clear input fields

  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
  //displaymarker
  console.log(mapEvent);
  const { lat, lng } = mapEvent.latlng; //descructure from latlng property which is object
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        // maxHeight: 250,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});
//change event listener available on select element
inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  //toggle class on both of them
});
