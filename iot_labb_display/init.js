load('api_i2c.js');
load('api_timer.js');
load('api_pwm.js');
load('api_gpio.js');
load('api_adc.js');
load('api_spi.js');
load('api_sys.js');
load('api_math.js');

let PIN_LCD_RS = 12;
let spi_h = SPI.get();
let spi_param = {cs: 0, mode: 0, freq: 100000, hd: {tx_data: "", rx_len: 0}};

let PIN_LEDR = 15; // red LED
let PIN_LEDY = 32; // yellow LED
let PIN_LEDG = 14; // green LED

let PIN_BUZZER = 17;

GPIO.setup_output(PIN_LEDR, 0);
GPIO.setup_output(PIN_LEDY, 0);
GPIO.setup_output(PIN_LEDG, 0);

let level_0_1_transition = (4095/3.3);
let level_1_2_transition = (4095/3.3) * 2;
let level_2_3_transition = (4095/3.3) * 3;

let wheel_pin = 36;

let maxAdcBits = 4095;
let maxVolts = 3.3;
let voltsPerBit = (maxVolts / maxAdcBits);

ADC.enable(wheel_pin);

let MCP9808_I2CADDR = 0x18; // 0x00011000 std slave address
let MCP9808_REG_AMBIENT_TEMP = 0x05; // 0b00000101 temp data reg
let i2c_h = I2C.get(); // I2C handle
let maxTemp = 30;

function min_timer_callback(){

    let adc_value = ADC.read(wheel_pin);
    
    if(adc_value > level_0_1_transition && adc_value <= level_1_2_transition){
        maxTemp = 25;
    }
    else if(adc_value > level_1_2_transition && adc_value <= level_2_3_transition){
        maxTemp = 26;
    }
    else if(adc_value > level_2_3_transition){
        maxTemp = 27;
    }
    else{
        maxTemp = 24;
    }


    let t = I2C.readRegW(i2c_h, MCP9808_I2CADDR, MCP9808_REG_AMBIENT_TEMP);

    let tempC = t & 0x0fff; // bitwise AND to strip non-temp bits
    tempC = tempC/16.0; // convert to decimal
    let tempCfloor = Math.floor(tempC);

    lcd_write('Temperatur:');
    
    if(tempC > maxTemp){
        print("Temperature:", tempCfloor, 'Max Temp:', maxTemp, 'VARMT!');
        GPIO.blink(PIN_LEDR, 200, 200);
        PWM.set(PIN_BUZZER, 300, 0.5);
    }
    else{
        print("Temperature:", tempCfloor, 'Max Temp:', maxTemp);
        GPIO.blink(PIN_LEDR, 0, 0);
        GPIO.write(PIN_LEDR, 0);
        PWM.set(PIN_BUZZER, 50, 0);
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

Timer.set(1000, Timer.REPEAT, min_timer_callback, null);
lcd_init();
