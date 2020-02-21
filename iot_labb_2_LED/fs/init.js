load('api_i2c.js');
load('api_timer.js');
load('api_pwm.js');
load('api_gpio.js');
load('api_adc.js');
load('api_spi.js');
load('api_sys.js');
load('api_math.js');
load('api_mqtt.js');


let led_1 = 33; //Green
let led_2 = 15; //Red 1
let led_3 = 32; //Yellow
let led_4 = 14; //Red 2

GPIO.setup_output(led_1, 0);
GPIO.setup_output(led_2, 0);
GPIO.setup_output(led_3, 0);
GPIO.setup_output(led_4, 0);
let handler = 1;

let maxTemp = 24;

let MCP9808_I2CADDR = 0x18; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg
let i2c_h = I2C.get(); // I2C handler

MQTT.sub('my/topic/switch/3', function(conn, topic, msg) {

    print('Topic:', topic, 'message:', msg);

    if(msg === '0'){
        handler = 0;
        GPIO.blink(led_1, 1000, 1000);
        GPIO.blink(led_2, 1000, 1000);
        GPIO.blink(led_3, 1000, 1000);
        GPIO.blink(led_4, 1000, 1000);
    }

    else if(msg === '1'){
        handler = 1;
        GPIO.blink(led_1, 0, 0);
        GPIO.blink(led_2, 0, 0);
        GPIO.blink(led_3, 0, 0);
        GPIO.blink(led_4, 0, 0);
    }

}, null);

MQTT.sub('my/topic/switch/1', function(conn, topic, msg) {
    
    if(handler){
        print('Topic:', topic, 'message:', msg);
        if(msg === '0'){
            GPIO.write(led_1, 1);
            GPIO.write(led_2, 1);
        }else{
            GPIO.write(led_1, 0);
            GPIO.write(led_2, 0);
        }
    }

}, null);

MQTT.sub('my/topic/switch/2', function(conn, topic, msg) {

    if(handler){
        print('Topic:', topic, 'message:', msg);
        if(msg === '0'){
            GPIO.write(led_3, 1);
            GPIO.write(led_4, 1);
        }else{
            GPIO.write(led_3, 0);
            GPIO.write(led_4, 0);
        }
    }

  }, null);

function min_timer_callback(){
    
    let t = I2C.readRegW(i2c_h, MCP9808_I2CADDR, MCP9808_REG_AMBIENT_TEMP);
    let tempC = t & 0x0fff; // bitwise AND to strip non-temp bits
    tempC = tempC/16.0; // convert to decimal
    let tempCfloor = Math.floor(tempC);

    if(tempC > maxTemp){
        print("Temperature:", tempCfloor, 'Max Temp:', maxTemp, 'VARMT!');
        let temp = MQTT.pub('my/topic/temperature/warm', JSON.stringify(tempCfloor), 0, 0);
        print('Published temp varmt:', temp ? 'yes' : 'no');
    }
    else{
        print("Temperature:", tempCfloor, 'Max Temp:', maxTemp);
        let temp = MQTT.pub('my/topic/temperature/cold', JSON.stringify(tempCfloor), 0, 0);
        print('Published temp kallt:', temp ? 'yes' : 'no');
    }
}

Timer.set(1000, Timer.REPEAT, min_timer_callback, null);
