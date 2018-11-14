<template>
  <div>
    <h1>Welcome to TEA</h1>
    <h4>(Thermometer Evaluator and Alerter)</h4>
    <div v-if="showError === true">
      <p class="error-text">{{form.errorMessage}}</p>
    </div>
    <p>Use your location or enter a temp.</p>
    <form v-on:submit.prevent>
      <button class="basic-style btn" v-on:click="getLocationTemp">Local temperture</button>
      <input class="basic-style temp-input" placeholder="Enter Temp" v-model.number="form.inputTemp"/>
      <select class="basic-style" v-model="form.inputScale">
        <option value='F'>Fahrenheit</option>
        <option value='C'>Celisus</option>
        <option value='K'>Kelvin</option>
      </select>
      
      <div>
        <input class="basic-style" type="checkbox" id="inputTempAlert" v-model="form.inputTempAlert">
        <label for="inputTempAlert">Setup Alert</label>
      </div>
        
      <div class="alert-input-container" v-if="form.inputTempAlert">
        <input class="basic-style alert-input" type="number" placeholder="Temp to notify at" v-model.number="form.inputThreshold"/>
        <div class="alert-checkbox">
          <input type="checkbox" id="inputIncrease" v-model="form.inputIncrease">
          <label for="inputIncrease">Increase</label>          
        </div>
        <div class="alert-checkbox">
          <input type="checkbox" id="inputDecrease" v-model="form.inputDecrease">
          <label for="inputDecrease">Decrease</label>          
        </div>
        <div class="alert-checkbox">
          <input type="checkbox" id="inputRepeat" v-model="form.inputRepeat">
          <label for="inputRepeat">Repeat</label>
        </div>
      </div>
      
      <button class="basic-style btn" v-on:click="initTheromo">Submit</button>
    </form>
    <div v-if="showTemp === true">
      <p id="currentTempOutput" class="highlight-bg">Current input temp: {{ currentTemperature }}{{ currentScale }}</p>
      <p class="highlight-bg" v-bind:key="temp.key" v-for="temp in temps">{{ temp.value }}{{ temp.key }}</p>
    </div>
    <div>
      <div v-if="showTemp === true">
        <p id="tempOutput" class="highlight-bg">{{ tempReadingMessage }}</p>
      </div>
      <div v-if="showAlert === true">
        <p class="temp-alert-text">{{ alertMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// Input temp - Read the temperature of an external source
// Input callback - set a temp threshold to be notified on, when reached *This can be single, repeating, or directionally set
// Output - Fahrenheit and Celsius
export default {
  name: 'Thermometer',
  data: function() {
    return {
      currentTemperature: '',
      previousTemp: '',
      tempThreshold: '',
      alertOnIncrease: false,
      alertOnDecrease: false,
      alertRepeat: false,
      alertOnCooldown: false,
      alertCooldownTime: 5000,
      currentScale: '',
      tempInterval: 10000,
      tempAlertInterval: {},
      temps: [],
      showAlert: false,
      showTemp: false,
      tempReadingMessage: '',
      alertMessage: 'Temp has been reached',
      showError: false,
      errorCooldownTime: 5000,
      form: {
        inputTemp: '',
        inputScale: '',
        inputTempAlert: false,
        inputThreshold: '',
        inputIncrease: false,
        inputDecrease: false,
        inputRepeat: false,
        errorMessage: ''
      }
    };
  },
  methods: {
    initTheromo: function() {
      this.showTemp = true;
      this.updateValues();
      if (this.form.inputTempAlert) {
        if (!this.form.inputThreshold || this.form.inputThreshold === typeof Number) return this.renderError('Missing temp threshold');
        
        this.tempThreshold = this.form.inputThreshold;
        this.alertOnIncrease = this.form.alertOnIncrease;
        this.alertOnDecrease = this.form.alertOnDecrease;
        this.alertRepeat = this.form.inputRepeat;
        this.previousTemp = this.form.inputTemp;
        this.setupTempAlert(this.tempThreshold, this.alertOnIncrease, this.alertOnDecrease, this.alertRepeat);
        this.tempReadingMessage = 'Checking temp for: ' + this.tempThreshold + '' + this.currentScale + '. Current Temp is: ' + 
            this.currentTemperature + '. Previous Temp: ' + this.previousTemp;
      }
    },
    getLocationTemp: function() {
      this.$store.dispatch('getTempertureInformation');
      this.currentTemperature = this.$store.state.localTemp;
      this.currentScale = 'K'; // openweather API returns a K scale temp
      this.form.inputTemp = this.currentTemperature;
      this.form.inputScale = this.currentScale;
    },
    updateValues: function() {
      if (!this.form.inputTemp || this.form.inputTemp === typeof Number) return this.renderError('Missing temp');
      if (!this.form.inputScale) return this.renderError('Missing scale');

      this.currentTemperature = parseFloat(this.form.inputTemp);
      this.currentScale = this.form.inputScale;
      this.readTemp(this.currentTemperature, this.currentScale);
    },
    readTemp: function(temp, scale) {
      this.temps = [];
      if (scale === 'C') {
        this.temps.push({ key: 'F', value: this.convertCToF(temp).toFixed(1) });
        this.temps.push({ key: 'K', value: this.convertCToK(temp).toFixed(1) });
      }else if (scale === 'F') {
        this.temps.push({ key: 'C', value: this.convertFToC(temp).toFixed(1) });
        this.temps.push({ key: 'K', value: this.convertFToK(temp).toFixed(1) });
      }else if (scale === 'K') {
        this.temps.push({ key: 'F', value: this.convertKToF(temp).toFixed(1) });
        this.temps.push({ key: 'C', value: this.convertKToC(temp).toFixed(1) });
      }
    },
    convertCToF(temp) {
      return (temp * 9/5) + 32;
    },
    convertCToK(temp) {
      return temp + 273.15;
    },
    convertFToC(temp) {
      return (temp - 32) * 5/9;
    },
    convertFToK(temp) {
      return (temp - 32) * 5/9 + 273.15;
    },
    convertKToF(temp) {
      return (temp - 273.15) * 9/5 + 32;
    },
    convertKToC(temp) {
      return temp - 273.15;
    },
    setupTempAlert: function(alertTemp, alertOnIncrease, alertOnDecrease, alertRepeat) {
      this.tempAlertInterval = setInterval(() => {
          this.updateValues();
          this.tempReadingMessage = 'Checking temp for: ' + alertTemp + '' + this.currentScale + '. Current Temp is: ' + 
            this.currentTemperature + '. Previous Temp: ' + this.previousTemp;

          if (alertOnIncrease) {
            if (this.previousTemp < this.currentTemperature && alertTemp <= this.currentTemperature) {
              this.alertOnThreshold(alertRepeat);
            }
          }else if (alertOnDecrease) {
            if (this.previousTemp > this.currentTemp && alertTemp >= this.currentTemperature) {
              this.alertOnThreshold(alertRepeat);
            }
          }else if (alertTemp <= this.currentTemperature) { 
            this.alertOnThreshold(alertRepeat);  
          }
          this.previousTemp = this.currentTemperature;
      }, this.tempInterval);
    },
    alertOnThreshold: function(alertRepeat) {
      if (!this.alertOnCooldown) {
        this.notifyTemp();
        if (alertRepeat) {
          this.alertOnCooldown = true;
          setTimeout(() => {
            this.alertOnCooldown = false;
          }, this.alertCooldownTime);
        }
      }

      if (!alertRepeat) clearInterval(this.tempAlertInterval);
    },
    notifyTemp: function() {
      // Feedback, should this be more dispatching a event for other listeners?
      this.showAlert = true;
      setTimeout(() => {
        this.clearNotifyTemp();
      }, 30000);
    },
    clearNotifyTemp: function() {
      this.showAlert = false;
    },
    renderError: function(msg) {
      this.showError = true;
      this.form.errorMessage = msg;
      setTimeout(() => {
        this.clearError();
      }, this.errorCooldownTime);
    },
    clearError: function() {
      this.showError = false;
      this.form.errorMessage = '';
    }
  }
}
</script>

<style scoped>
  .basic-style {
    padding: 10px;
    border-radius: 5px;
    margin: 10px 10px 10px 0;
  }

  .btn {
    background-color: #fff;
  }

  .temp-input {
    width: 20%;
  }

  .alert-input-container {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: center; 
  }

  .alert-input {
    width: 25%;
  }

  .alert-checkbox {
    margin-right: 10px;
  }

  .highlight-bg {
    animation-duration: 10s;
    animation-name: fadeOut;
    animation-iteration-count: 1;
  }

  @keyframes fadeOut {
    from {
       background-color:#ffe8a4;
    }

    to {
      background-color:#f7f5f5;
    }
  }

  .error-text {
    color: #e65e1a;
  }

  .temp-alert-text {
    color: #e65e1a;
    font-size: 16px;
    font-weight: bold;
  }
</style>
