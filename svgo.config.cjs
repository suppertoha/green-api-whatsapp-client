module.exports = {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          removeUnknownsAndDefaults: false,
          convertPathData: {
            floatPrecision: 2,
          },
        },
      },
    },
  ],
};
