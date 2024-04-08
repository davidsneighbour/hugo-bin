const defaultStandardVersion = require("@davidsneighbour/release-config");

const localStandardVersion = {
  scripts: {
    prerelease: "",
  },
  skip: {
    changelog: true
  }
};

const standardVersion = {
  ...defaultStandardVersion,
  ...localStandardVersion,
};
module.exports = standardVersion;
