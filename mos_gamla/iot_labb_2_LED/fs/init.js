load('api_i2c.js');
load('api_timer.js');
load('api_pwm.js');
load('api_gpio.js');
load('api_adc.js');
load('api_spi.js');
load('api_sys.js');
load('api_math.js');
load('api_mqtt.js');

let led_1 = 33; // green LED
let led_2 = 15; // red 1 LED
let led_3 = 32; // yellow LED
let led_4 = 14; // red 2 LED

GPIO.setup_output(led_1, 0);
GPIO.setup_output(led_2, 0);
GPIO.setup_output(led_3, 0);
GPIO.setup_output(led_4, 0);



function min_timer_callback(){
    
    MQTT.sub('my/topic/switches/button1', function(conn, topic, msg) {
      print('Topic:', topic, 'message:', msg);
    }, null);
}

Timer.set(1000, Timer.REPEAT, min_timer_callback, null); 