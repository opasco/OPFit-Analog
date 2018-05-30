/*
 * Entry point for the watch app
 */
import document from "document";
import clock from "clock";
import { display } from "display";
import { HeartRateSensor } from "heart-rate";
import { Barometer } from "barometer";
import userActivity from "user-activity";
import { battery } from "power";

let myHearRateMonitor = new HeartRateSensor();
let myBarometer = new Barometer();
let myClockTxt = document.getElementById("myClockTxt");
let hourHand = document.getElementById("hours");
let hourHand2 = document.getElementById("hours2");
let minHand = document.getElementById("mins");
let minHand2 = document.getElementById("mins2");
let secHand = document.getElementById("secs");
let bpmHand = document.getElementById("bpm");
let altHand = document.getElementById("alt");
let activityHand = document.getElementById("activity");
let batteryHand = document.getElementById("battery");
let hrTxt = document.getElementById("hrTxt");
let batteryTxt = document.getElementById("batteryTxt");
let altTxt = document.getElementById("altTxt");
let activityTxt = document.getElementById("activityTxt");
let date = document.getElementById("date");

let dayNames = [
    "Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];


clock.granularity = 'seconds'; // Update clock every second

// Helper functions

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
}

// Returns an angle (0-360) for heart rate (0-200bpm)
function bpmToAngle(bpm) {
  return (360 / 200) * bpm;
}

// Returns an angle (0-360) for altitude (0-29,029ft)
function altToAngle(alt) {
  return (360 / 29029) * alt;
}

// Returns an angle (0-360) for activity (0-goal steps)
function activityToAngle(steps) {
  if(userActivity.goals.steps != 0) {
    if(userActivity.goals.steps > steps) {
      activityHand.fill="#aaffaa";
      activityTxt.fill="#aaffaa";
    }
    else {
      activityHand.fill="#00ff00";
      activityTxt.fill="#00ff00";
    }
    return (360 / userActivity.goals.steps) * steps;
  }
  
  return 0;
}

// Returns an angle (0-360) for battery (0-100%)
function batteryToAngle(level) {
  return (360 / 100) * level;
}

function altitudeFromPressure(pressure) {
  return (1 - (pressure/1013.25)**0.190284)*145366.45;
}

function refreshClock() {
  if (display.on) {
    myHearRateMonitor.start();
    myBarometer.start();

    activityHand.groupTransform.rotate.angle = activityToAngle(userActivity.today.local.steps);
    activityTxt.text = "Steps: " + userActivity.today.local.steps;
    batteryHand.groupTransform.rotate.angle = batteryToAngle(battery.chargeLevel);
    batteryTxt.text = "Bat: " + Math.floor(battery.chargeLevel) + "%";
    
    let dayInfo = new Date();
    date.text = dayNames[dayInfo.getDay()] + " " + dayInfo.getDate();
  }
}

// Events

clock.ontick = function(evt) {
  // console.log("Tic toc");
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  hourHand2.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  minHand2.groupTransform.rotate.angle = minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = secondsToAngle(secs);
}

display.onchange = function(event) {
  refreshClock();
}

myHearRateMonitor.onreading = function() {
  let heartRate = myHearRateMonitor.heartRate;
  bpmHand.groupTransform.rotate.angle = bpmToAngle(heartRate);
  hrTxt.text = "HR: " + heartRate + "bpm"
  myHearRateMonitor.stop();
}

myBarometer.onreading = function() {
  let altitude = altitudeFromPressure(myBarometer.pressure / 100);
  altHand.groupTransform.rotate.angle = altToAngle(altitude);
  altTxt.text = "Alt: " + altitude + "ft"
  myBarometer.stop();
}

battery.onchange = function() {
  let charge = battery.chargeLevel;
}


// Main

console.log("App Started");

myHearRateMonitor.start();
myBarometer.start();

setInterval(refreshClock, 5000);
