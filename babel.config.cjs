const basePresets = [
  [
    '@babel/preset-env',
    {
      targets: {
        node: '20',
        browsers: ['>0.25%', 'not dead'],
      },
      bugfixes: true,
      modules: false,
    },
  ],
  [
    '@babel/preset-react',
    {
      runtime: 'automatic',
      importSource: 'react',
    },
  ],
  '@babel/preset-typescript',
  '@babel/preset-flow',
];

const basePlugins = [
  ['@babel/plugin-transform-runtime', { version: '7.23.7', helpers: true, regenerator: true }],
];

module.exports = {
  presets: basePresets,
  plugins: basePlugins,
  env: {
    production: {
      plugins: [
        'babel-plugin-transform-remove-console',
        'babel-plugin-transform-remove-debugger',
      ],
    },
    test: {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    },
  },
};
