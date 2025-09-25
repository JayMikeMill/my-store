const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest", // standard ts-jest preset (CommonJS)
  testEnvironment: "node",
  roots: ["<rootDir>/unit-tests"],
  testMatch: ["**/?(*.)+(test).ts"], // matches *.test.ts files
};
