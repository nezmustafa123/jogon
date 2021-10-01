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
  navigator.geolocation.getCurrentPosition(
    function (position) {
      //position object
      //position argument
      const { latitude } = position.coords;
      //destructure latitude property
      const { longitude } = position.coords;
      //destructure longitude
    },
    function () {
      alert('Could not get your position');
    }
  );
}
