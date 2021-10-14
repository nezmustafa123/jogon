'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let map, mapEvent; //declare global variable for map

class Workout {
  //take in data common to both workouts
  //instance properties
  date = new Date(); //create new date in which workout happened
  id = (Date.now() + '').slice(-10);
  constructor(distance, coords, duration) {
    //can call any code in constructor
    this.coords = coords; //[lat, lng] takes in array of lat and lng
    this.distance = distance; //km
    this.duration = duration; //min
  }
}
//child classes
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    //add original parameters and unique parameter call super with common ones
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  //calculate pace
  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60); //divide by 60 to get hours not minutes
    return this.speed;
  }
}
//create new classes as test
// const run1 = new Running([23, -23], 5.2, 45, 190);
// const cycle1 = new Cycling([23, -23], 27, 96, 525);
// console.log(run1, cycle1);
///////////////////////////////
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//APPLICATIION ARCHITECTURE
//one big class APP everything relating to application should be in the class
class App {
  //private instance properties

  #map;
  #mapEvent;
  //implement app class and methods put functionality in methods which will be called constructor method gets called straight away
  constructor() {
    //load page event triggers constructor triggers getposition
    this._getPosition();
    //render workout that's not yet a workout put pin or marker on map replace that with data coming from workout
    form.addEventListener('submit', this._newWorkout.bind(this));
    //change event listener available on select element
    inputType.addEventListener('change', this._toggleElevationField);
    //architecture give project a structure when and how to store the data
    //data needing to be stored comes from user input
    //design classes by having parent class that has distance duration coords properties common to child classes
  }

  _getPosition() {
    //geolocation browser api on navigator takes two callbacks success and position
    if (navigator.geolocation) {
      //if geolocation exists and browser has permission do this
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          //reference the success callback with this._loadMap because in class have to use this with __loadmap will pass in the parameter
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    //position object
    //position argument not an event in the common sense gets passed in automatically load map called on the event
    const { latitude } = position.coords;
    //destructure latitude property
    const { longitude } = position.coords;
    //destructure longitude
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];
    // console.log(this);
    //add event handler to map to listen for clicks use event handler coming from library
    this.#map = L.map('map').setView(coords, 14); //reassign map
    // console.log(map);
    //l variable global variable that's available in other scripts only works if scrpts file comes after
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //map object generated leaflet with on method
    //handing clicks on map
    this.#map.on('click', this._showForm.bind(this)); //bind this keyword so this in function is app object, otherwise set map event on map
  }

  _showForm(mapE) {
    this.#mapEvent = mapE; //get coordinates from mapE when map is clicked copy it to global variable then access it later
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    //toggle class on both of them
    console.log('fired');
    console.log(inputElevation.classList);
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    //arrow function use rest parameter loop through using every is one is not number will return false
    //new workout method
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    //if every inputs
    e.preventDefault();

    //get data from form
    const type = inputType.value; //select element will return one of the options each option has string value
    const distance = +inputDistance.value; //convert to number
    const duration = +inputDuration.value; //convert to number
    //check if data is valid

    //if workout is of type running create running object get cadence
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if data is valid (number)

      if (
        //check for opposide of what were interested in using guard clause
        //use isfinite to cheeck if it's not a number when one of these three is not a number and not all
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        // invert the function if not true then show the window
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert('Inputs have to be positive numbers!');
      }
    }
    //if workout is of type cycling create cycling ojbect get elevation gain
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
    }

    //add new object to workout array
    //render workout on map as a marker

    const { lat, lng } = this.#mapEvent.latlng; //descructure from latlng property which is object
    L.marker([lat, lng])
      .addTo(this.#map)
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

    //hide form and clear input fields

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }
}

const app = new App(); //no parameters needed
