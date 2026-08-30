const { getApiBaseUrl } = require('../apiConfig');

try {
  const url = getApiBaseUrl({ ...process.env, NODE_ENV: 'production' });
  process.stdout.write(`Building Ripple against ${url}\n`);
} catch (error) {
  process.stderr.write(`Production configuration error: ${error.message}\n`);
  process.exit(1);
}
