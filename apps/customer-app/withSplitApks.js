const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to enable APK splitting per CPU architecture.
 * This is incredibly useful for EAS "preview" internal builds (APKs), 
 * bringing the file size down from ~90MB (Universal) to ~25MB (Split).
 */
const withSplitApks = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      const buildGradle = config.modResults.contents;
      
      // We explicitly inject the splits block inside the android block
      // This will ensure Gradle builds separate APKs for each ABI
      if (!buildGradle.includes("enableSeparateBuildPerCPUArchitecture")) {
        config.modResults.contents = buildGradle.replace(
          /android\s*\{/,
          `android {\n    splits {\n        abi {\n            reset()\n            enable true\n            universalApk false\n            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"\n        }\n    }\n`
        );
      } else {
        config.modResults.contents = buildGradle.replace(
          "def enableSeparateBuildPerCPUArchitecture = false",
          "def enableSeparateBuildPerCPUArchitecture = true"
        );
      }
    }
    return config;
  });
};

module.exports = withSplitApks;
