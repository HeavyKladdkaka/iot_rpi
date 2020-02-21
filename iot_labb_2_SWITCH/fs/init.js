load('api_i2c.js');
load('api_timer.js');
load('api_pwm.js');
load('api_gpio.js');
load('api_adc.js');
load('api_spi.js');
load('api_sys.js');
load('api_math.js');
load('api_mqtt.js');

let switch_1 = 21;
let switch_2 = 4;
let PIN_LCD_RS = 12;

let temp = 0;
let tempCfloor = 0;
let maxTemp = 23;

let buttonPressed = 0;

let spi_h = SPI.get();
let spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "", rx_len: 0}};

GPIO.setup_input(switch_1, GPIO.PULL_UP);
GPIO.setup_input(switch_2, GPIO.PULL_UP);
GPIO.setup_output(PIN_LCD_RS, 0);

GPIO.set_button_handler(switch_1, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 10, function(x) {
  let press = MQTT.pub('my/topic/switch/1', JSON.stringify(0), 0, 0);
  
  print('Published switch 1:', press ? 'yes' : 'no');
}, true);

GPIO.set_button_handler(switch_2, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 10, function(x) {
    let res = MQTT.pub('my/topic/switch/2', JSON.stringify(0), 0, 0);
    print('Published switch 2:', res ? 'yes' : 'no');
}, true);

MQTT.sub('my/topic/temperature/warm', function(conn, topic, msg) {

  print('Topic:', topic, 'message:', msg);

  temp = JSON.parse(msg);

}, null);

MQTT.sub('my/topic/temperature/cold', function(conn, topic, msg) {

  print('Topic:', topic, 'message:', msg);

  temp = JSON.parse(msg);

}, null);

MQTT.sub('my/topic/switch/3', function(conn, topic, msg) {

  print('Topic:', topic, 'message:', msg);

  if(msg === '0'){
      buttonPressed = 1;
  }

  else if(msg === '1'){
      buttonPressed = 0;
  }

}, null);

function read_switches(){

    lcd_init();
    lcd_write("Temperatur:");
    lcd_write(JSON.stringify(temp));
    lcd_write("   Max temp:");
    lcd_write(JSON.stringify(maxTemp));

    if(temp > maxTemp || buttonPressed){
        print("Temperatur:", tempCfloor, 'Max Temp:', maxTemp, 'VARMT!');
        lcd_write("     VARMT!");
    }
    else{
        print("Temperatur:", tempCfloor, 'Max Temp:', maxTemp);
    }

    if(GPIO.read(switch_1) === 1){

      let release = MQTT.pub('my/topic/switch/1', JSON.stringify(1), 0, 0);
  
      print('Published:', release ? 'yes' : 'no');
    }
    if(GPIO.read(switch_2) === 1){

      let release = MQTT.pub('my/topic/switch/2', JSON.stringify(1), 0, 0);
  
      print('Published:', release ? 'yes' : 'no');
    }
}

function lcd_init(){
  lcd_cmd("\x39");
  Sys.usleep(30*1000);

  lcd_cmd("\x15");
  Sys.usleep(30*1000);

  lcd_cmd("\x55");
  Sys.usleep(30*1000);
  
  lcd_cmd("\x6E");
  Sys.usleep(30*1000);

  lcd_cmd("\x72");
  Sys.usleep(30*1000);

  lcd_cmd("\x38");
  Sys.usleep(30*1000);

  lcd_cmd("\x0F");
  Sys.usleep(30*1000);

  lcd_cmd("\x01");
  Sys.usleep(30*1000);

  lcd_cmd("\x06");
  Sys.usleep(30*1000);
 }   

function lcd_cmd(cmd){
  GPIO.write(PIN_LCD_RS, 0); // RS low for cmd
  spi_param.hd.tx_data = cmd;
  SPI.runTransaction(spi_h, spi_param);
 }

function lcd_write(cmd){
  GPIO.write(PIN_LCD_RS, 1);
  spi_param.hd.tx_data = cmd;
  SPI.runTransaction(spi_h, spi_param);
}

Timer.set(1000, Timer.REPEAT, read_switches, null);
lcd_init();
