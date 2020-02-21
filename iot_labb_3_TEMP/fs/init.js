load('api_i2c.js');
load('api_timer.js');
load('api_pwm.js');
load('api_gpio.js');
load('api_adc.js');
load('api_spi.js');
load('api_sys.js');
load('api_math.js');
load('api_mqtt.js');

let temp = 0;
let tempCfloor = 0;

let buttonPressed = 0;

let MCP9808_I2CADDR = 0x18; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg
let i2c_h = I2C.get(); // I2C handler

function read_temp(){

  let t = I2C.readRegW(i2c_h, MCP9808_I2CADDR, MCP9808_REG_AMBIENT_TEMP);
  let tempC = t & 0x0fff; // bitwise AND to strip non-temp bits
  tempC = tempC/16.0; // convert to decimal
  let tempCfloor = Math.floor(tempC);

  print('Temp:', tempCfloor);

  let release = MQTT.pub('temperature', JSON.stringify(tempCfloor), 0, 0);
  
  print('Published:', release ? 'yes' : 'no');
}

Timer.set(1000, Timer.REPEAT, read_temp, null);
