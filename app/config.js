const config = {
  ipAddress: '192.168.0.134',
  port: '8000',
  get baseUrl() {
    return `http://${this.ipAddress}:${this.port}`;
  }
};

export default config; 