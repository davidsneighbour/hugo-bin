import defaultStandardVersion from "@davidsneighbour/release-config";

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
export default standardVersion;
