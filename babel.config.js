module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
  ],
  plugins: [
    ['module:react-native-dotenv',
      {
        path : '.env',
        moduleName: '@env',
        envName: 'APP_ENV',       
      }
    ],
    'react-native-reanimated/plugin'
  ],
};
