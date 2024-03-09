const defaultStandardVersion = {
  scripts: {
    prerelease: "",
  },
  bumpFiles: [
    {
      filename: "package.json",
      type: "json",
    },
  ],
  skip: {
    changelog: true,
    tag: true
  }
};

module.exports = defaultStandardVersion;
