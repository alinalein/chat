module.exports = function (api) {
  api.cache(true);

  const presets = ['babel-preset-expo'];

  // add react-native-dotenv plugin
  const plugins = [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
  ];

  return {
    presets,
    plugins,
  };
};