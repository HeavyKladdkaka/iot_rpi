load('api_i2c.js');
load('api_timer.js');
load('api_pwm.js');
load('api_gpio.js');
load('api_adc.js');
load('api_spi.js');
load('api_sys.js');
load('api_math.js');
load('api_mqtt.js');

let fan = 13;

PWM.set(fan, 25000, 0.02);

MQTT.sub('temperature/warm', function(conn, topic, msg) {

  print('Topic:', topic, 'message:', msg);

  PWM.set(fan, 25000, 100);

}, null);

MQTT.sub('temperature/cold', function(conn, topic, msg) {

  print('Topic:', topic, 'message:', msg);

  PWM.set(fan, 25000, 0.02);

}, null);

function read_temp(){

}

Timer.set(1000, Timer.REPEAT, read_temp, null);
