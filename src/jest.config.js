export default {
  extensionsToTreatAsEsm: ['.js'], // Укажите, что Jest должен считать файлы .js модулями
  transform: {
    '^.+\\.js$': 'babel-jest', // Укажите Babel для трансформации модулей
  },
  testEnvironment: 'node', // Тестовая среда
    collectCoverage: true,
  collectCoverageFrom: ["./src/**"],
  coverageReporters: ['html'],
  coverageDirectory: './coverage'
};
