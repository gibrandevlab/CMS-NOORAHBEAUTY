const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_NP7OnlwkcrSQ5FmUtry/Mjkf7ew=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_2iVbxpYu4d42bbEksOi404S0Dbs=',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/noorahbeauty',
});

module.exports = imagekit;
