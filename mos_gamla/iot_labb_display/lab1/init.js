load('api_timer.js');
load('api_gpio.js');
let PIN_LEDR_OUT = 15; // red LED
let PIN_LEDG_OUT = 32; // green LED
let PIN_LEDY_OUT = 14; // yellow LED

let PIN_butt_1 = 21;
let PIN_butt_2 = 4;

GPIO.setup_input(21)


//GPIO.setup_output(PIN_LEDG, 0);
//GPIO.setup_output(PIN_LEDY, 0);
let count = 0;

function min_timer_callback(){
    let minutes = Math.floor((count++)/60);
    print('minuter:', minutes, 'sekunder:', (count - (minutes*60)));
}
Timer.set(1000, Timer.REPEAT, min_timer_callback, null);