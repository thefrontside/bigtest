let start = () => {};

// Make sure we don't include mirage in production
if (process.env.NODE_ENV !== 'production') {
  start = require('./start').default;
}

export default start;
