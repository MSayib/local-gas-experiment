/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: true,
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@adapters/(.*)$': '<rootDir>/src/adapters/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
};
