/**
 * UT Device Communication Service
 * Handles serial port communication with Olympus, GE, and Evident UT devices
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class DeviceCommunicationService {
  constructor() {
    this.activePort = null;
    this.parser = null;
    this.deviceType = null;
    this.dataCallbacks = new Set();
  }

  /**
   * List available serial ports
   */
  async listPorts() {
    try {
      const ports = await SerialPort.list();
      return ports.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer || 'Unknown',
        serialNumber: port.serialNumber || 'Unknown',
        vendorId: port.vendorId,
        productId: port.productId,
      }));
    } catch (error) {
      console.error('Error listing ports:', error);
      throw error;
    }
  }

  /**
   * Connect to a UT device
   */
  async connect(portPath, deviceType = 'olympus', baudRate = 9600) {
    try {
      // Close existing connection if any
      if (this.activePort?.isOpen) {
        await this.disconnect();
      }

      this.deviceType = deviceType;

      // Configure port based on device type
      const config = this.getDeviceConfig(deviceType, baudRate);

      this.activePort = new SerialPort({
        path: portPath,
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
        autoOpen: false,
      });

      // Setup parser
      this.parser = this.activePort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      // Setup data listeners
      this.parser.on('data', (data) => {
        this.handleDeviceData(data);
      });

      this.activePort.on('error', (err) => {
        console.error('Serial port error:', err);
        this.notifyCallbacks({ type: 'error', error: err.message });
      });

      // Open the port
      await new Promise((resolve, reject) => {
        this.activePort.open((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`Connected to ${deviceType} device on ${portPath}`);
      return { success: true, deviceType, port: portPath };
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect() {
    if (this.activePort?.isOpen) {
      await new Promise((resolve) => {
        this.activePort.close(() => resolve());
      });
      this.activePort = null;
      this.parser = null;
      this.deviceType = null;
      console.log('Disconnected from device');
    }
  }

  /**
   * Get device-specific configuration
   */
  getDeviceConfig(deviceType, baudRate) {
    const configs = {
      olympus: {
        baudRate: baudRate || 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      },
      ge: {
        baudRate: baudRate || 19200,
        dataBits: 8,
        stopBits: 1,
        parity: 'even',
      },
      evident: {
        baudRate: baudRate || 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      },
    };

    return configs[deviceType] || configs.olympus;
  }

  /**
   * Handle incoming device data
   */
  handleDeviceData(rawData) {
    try {
      const parsedData = this.parseDeviceData(rawData, this.deviceType);
      if (parsedData) {
        this.notifyCallbacks({
          type: 'data',
          data: parsedData,
          raw: rawData,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error parsing device data:', error);
    }
  }

  /**
   * Parse device-specific data format
   */
  parseDeviceData(data, deviceType) {
    switch (deviceType) {
      case 'olympus':
        return this.parseOlympusData(data);
      case 'ge':
        return this.parseGEData(data);
      case 'evident':
        return this.parseEvidentData(data);
      default:
        return null;
    }
  }

  /**
   * Parse Olympus device data
   * Format: FREQ:5.0;GAIN:45.2;RANGE:250;VEL:5900;...
   */
  parseOlympusData(data) {
    const fields = {};
    const pairs = data.split(';');

    for (const pair of pairs) {
      const [key, value] = pair.split(':');
      if (key && value) {
        fields[key.trim()] = value.trim();
      }
    }

    return {
      frequency: fields.FREQ ? `${fields.FREQ} MHz` : null,
      gain: fields.GAIN ? parseFloat(fields.GAIN) : null,
      range: fields.RANGE ? parseFloat(fields.RANGE) : null,
      velocity: fields.VEL ? parseInt(fields.VEL) : null,
      probeType: fields.PROBE || null,
      serialNumber: fields.SN || null,
      temperature: fields.TEMP ? parseFloat(fields.TEMP) : null,
      couplant: fields.COUP || null,
    };
  }

  /**
   * Parse GE device data
   * Format: <FREQ>5.0</FREQ><GAIN>45.2</GAIN>...
   */
  parseGEData(data) {
    const fields = {};
    const tagPattern = /<(\w+)>(.*?)<\/\1>/g;
    let match;

    while ((match = tagPattern.exec(data)) !== null) {
      fields[match[1]] = match[2];
    }

    return {
      frequency: fields.FREQ ? `${fields.FREQ} MHz` : null,
      gain: fields.GAIN ? parseFloat(fields.GAIN) : null,
      range: fields.RANGE ? parseFloat(fields.RANGE) : null,
      velocity: fields.VEL ? parseInt(fields.VEL) : null,
      probeType: fields.PROBE || null,
      serialNumber: fields.SN || null,
    };
  }

  /**
   * Parse Evident (formerly Olympus IMS) data
   * Format: JSON-based
   */
  parseEvidentData(data) {
    try {
      const parsed = JSON.parse(data);
      return {
        frequency: parsed.frequency || null,
        gain: parsed.gain || null,
        range: parsed.range || null,
        velocity: parsed.velocity || null,
        probeType: parsed.probeType || null,
        serialNumber: parsed.serialNumber || null,
      };
    } catch {
      // Fallback to Olympus format
      return this.parseOlympusData(data);
    }
  }

  /**
   * Send command to device
   */
  async sendCommand(command) {
    if (!this.activePort?.isOpen) {
      throw new Error('No active connection');
    }

    return new Promise((resolve, reject) => {
      this.activePort.write(command + '\r\n', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Request specific data from device
   */
  async requestData(dataType) {
    const commands = {
      olympus: {
        all: 'GET:ALL',
        frequency: 'GET:FREQ',
        gain: 'GET:GAIN',
        range: 'GET:RANGE',
        velocity: 'GET:VEL',
      },
      ge: {
        all: 'REQ:ALL',
        frequency: 'REQ:FREQ',
        gain: 'REQ:GAIN',
      },
      evident: {
        all: '{"cmd":"get_all"}',
        frequency: '{"cmd":"get_freq"}',
      },
    };

    const command = commands[this.deviceType]?.[dataType] || commands[this.deviceType]?.all;
    if (command) {
      await this.sendCommand(command);
    }
  }

  /**
   * Register callback for device data
   */
  onData(callback) {
    this.dataCallbacks.add(callback);
    return () => this.dataCallbacks.delete(callback);
  }

  /**
   * Notify all registered callbacks
   */
  notifyCallbacks(data) {
    this.dataCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Callback error:', error);
      }
    });
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.activePort?.isOpen || false,
      deviceType: this.deviceType,
      port: this.activePort?.path || null,
    };
  }
}

// Singleton instance
const deviceService = new DeviceCommunicationService();

module.exports = deviceService;
