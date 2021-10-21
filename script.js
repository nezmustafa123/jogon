'use strict';

let map, mapEvent; //declare global variable for map and mapEvent

class Workout {
  //take in data common to both workouts
  //instance properties available on the new objects created through child classes
  date = new Date(); //create new date in which workout happened
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    //can call any code in constructor
    this.coords = coords; //[lat, lng] takes in array of lat and lng
    this.distance = distance; //km
    this.duration = duration; //min
  }
  _setDescription() {
    //add set description method to workout class so ALL types of workout classes get them
    //set workout description based of type and date
    //prettier-ignore
    //convert type to uppercase
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } the ${this.date.getDate()}`; //use number from get month to retrieve month string from array
  } //get date from tehe workout object then month from that which is zero based array
  click() {
    //every object gets this method can increase the number of clicks
    this.clicks++;
  }
}

//child classes
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    //add original parameters and unique parameter call super with common ones
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription(); //set description specific to running
  }

  //calculate pace only unique to running
  //min/km
  calcPace() {
    this.pace = this.duration / this.distance;
    // console.log(pace);
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription(); //constructor gets access to all methods of the parent class it's executed here but gets accesss to the type from child class
  }
  //calculate speed only unique to cycling
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
  //private class fields/properties

  #map;
  #mapZoomLevel = 13; //create zoom level field (object property)
  #mapEvent;
  #workouts = []; //initialise field to empty array

  //implement app class and methods put functionality in methods which will be called constructor method gets called straight away
  constructor() {
    //code in constructor method gets executed straight away
    //load page event triggers constructor triggers getposition
    this._getPosition();
    //get data from local storage
    this._getLocalStorage();
    //render workout that's not yet a workout put pin or marker on map replace that with data coming from workout
    form.addEventListener('submit', this._newWorkout.bind(this));
    //change event listener available on select element
    inputType.addEventListener('change', this._toggleElevationField);
    //architecture give project a structure when and how to store the data
    //data needing to be stored comes from user input
    //design classes by having parent class that has distance duration coords properties common to child classes
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
    //on map load
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
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel); //reassign map
    // console.log(map);
    //l variable global variable that's available in other scripts only works if scrpts file comes after
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //map object generated leaflet with on method
    //handing clicks on map
    this.#map.on('click', this._showForm.bind(this)); //bind this keyword so this in function is app object, otherwise set map event on map

    this.#workouts.forEach(workout => {
      //loop over workouts in the list and render them on the side bar

      this._renderWorkoutMarker(workout); //map hasn't been loaded yet at the beginning it takes some time, this runs in the constructor when app is first loaded
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE; //get coordinates from mapE when map is clicked copy it to global variable then access it later
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none'; //hide form immediately to get rid of transition

    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    //toggle class on both of them
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    //arrow function use rest parameter loop through using every is one is not number will return false
    //new workout method
    const allPositive = (...inputs) => inputs.every(inp => inp > 0); //arbitraty inputs using rest operator
    //if every inputs
    e.preventDefault();

    //get data from form
    const type = inputType.value; //select element will return one of the options each option has string value
    const distance = +inputDistance.value; //convert to number
    const duration = +inputDuration.value; //convert to number
    const { lat, lng } = this.#mapEvent.latlng; //descructure from latlng property which is object
    let workout;
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
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //if workout is of type cycling create cycling ojbect amd get elevation gain
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration) //elevationgain may well be negative for cycling so leave it out
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation); //make workout cycling object
    }
    //add new object to workout array

    this.#workouts.push(workout); //push the new workout created with running constructor function/class
    // console.log(workout);

    //DELEGATE FUNCTIONALITY IN SEPERATE METHODS
    //render workout on map as a marker
    this._renderWorkoutMarker(workout);
    //pass in workout object to render specific workout markers

    //render workout on list
    this._renderWorkout(workout);

    //hide form and clear input fields

    this._hideForm();

    //set local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          // maxHeight: 250,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  //use inside new workout method
  _renderWorkout(workout) {
    //insert some dynamic markup
    // console.log('fired');
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;

    if (workout.type === 'running') {
      html += `
    <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
      </div>
     </li>
     `;
    } else if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.speed.toFixed(1)}</span>
              <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⛰</span>
              <span class="workout__value">${workout.elevationGain}</span>
              <span class="workout__unit">m</span>
            </div>
          </li>
          `;
    }
    form.insertAdjacentHTML('afterend', html);
    //insert html element after end of form so last workout appears before others
  }

  _moveToPopup(e) {
    //get target find closest parent with workout class will get entire list elementuse the custom data-id attribute to find which popup to scroll to
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return; //if null return

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    ); //find workout with its it equal to id of workout element clicked on

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      //leaflet map setview takes coordinates zoom level and object of options
      animate: true,
      pan: {
        duration: 2, //2 seconds
      },
    });
    //using api public interface
    // workout.click();
  }
  _setLocalStorage() {
    //give name and string associate with name, convert object to string using JSON.stringify
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    //have to pass in the key to get item can technically set everything in app in local storage one key for each
    const data = JSON.parse(localStorage.getItem('workouts')); //large string use opposite of json stringify json parse convert to array with objects

    //check if there's data to begin with

    if (!data) return;
    this.#workouts = data; //if there's data restore workouts array at beginning workouts array will be empy then populated

    this.#workouts.forEach(workout => {
      //loop over workouts in the list and render them on the side bar
      this._renderWorkout(workout);
    });
  }

  reset() {
    //will be available in app object app.reset();
    //reset method to use in the console
    localStorage.removeItem('workouts'); //remove items based off key
    location.reload(); //reload the page programatically so it looks empty
  }
}
const app = new App();
//no parameters needed creat app object then store it in app
