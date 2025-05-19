// axios.js - Implementasi sederhana dari axios menggunakan modul http/https bawaan Node.js
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Fungsi utama axios
function axios(config) {
  return new Promise((resolve, reject) => {
    // Parse URL
    const parsedUrl = url.parse(config.url);
    
    // Tentukan protokol (http atau https)
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    // Buat options untuk request
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.path,
      method: config.method ? config.method.toUpperCase() : 'GET',
      headers: config.headers || {}
    };
    
    // Tambahkan Content-Type jika tidak ada
    if (config.data && !options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json';
    }
    
    // Buat request
    const req = protocol.request(options, (res) => {
      // Handle respons
      const responseType = config.responseType || 'json';
      
      // Untuk responseType 'arraybuffer'
      if (responseType === 'arraybuffer') {
        const chunks = [];
        
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            data: buffer,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            config: config
          });
        });
      }
      // Untuk responseType 'stream'
      else if (responseType === 'stream') {
        resolve({
          data: res,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          config: config
        });
      }
      // Untuk responseType 'json' atau default
      else {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          let parsedData;
          
          try {
            // Parse data sebagai JSON jika responseType adalah 'json'
            if (responseType === 'json' && data.trim() !== '') {
              parsedData = JSON.parse(data);
            } else {
              parsedData = data;
            }
            
            resolve({
              data: parsedData,
              status: res.statusCode,
              statusText: res.statusMessage,
              headers: res.headers,
              config: config
            });
          } catch (e) {
            reject(new Error(`Error parsing response: ${e.message}`));
          }
        });
      }
    });
    
    // Handle error
    req.on('error', (error) => {
      reject(error);
    });
    
    // Kirim data jika ada
    if (config.data) {
      const data = typeof config.data === 'object' ? JSON.stringify(config.data) : config.data;
      req.write(data);
    }
    
    // Akhiri request
    req.end();
  });
}

// Metode helper untuk HTTP methods
axios.get = (url, config = {}) => {
  return axios({ ...config, method: 'get', url });
};

axios.post = (url, data, config = {}) => {
  return axios({ ...config, method: 'post', url, data });
};

axios.put = (url, data, config = {}) => {
  return axios({ ...config, method: 'put', url, data });
};

axios.delete = (url, config = {}) => {
  return axios({ ...config, method: 'delete', url });
};

axios.patch = (url, data, config = {}) => {
  return axios({ ...config, method: 'patch', url, data });
};

// Export modul
module.exports = axios;
