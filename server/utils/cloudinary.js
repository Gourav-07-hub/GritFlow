import { v2 as cloudinary } from 'cloudinary';

/**
 * Lazily configure Cloudinary.
 * ESM imports are hoisted, so `dotenv.config()` hasn't run yet when this
 * module is first loaded.  We defer config until the first actual API call.
 */
const configure = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Proxy — reconfigure on every property access so env vars are always fresh
export default new Proxy(cloudinary, {
  get(target, prop) {
    configure();
    return target[prop];
  },
});
