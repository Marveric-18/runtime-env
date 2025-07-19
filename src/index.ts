#!/usr/bin/env node
import yargs from "yargs";
import "dotenv/config";

import { CloudTypes, EnvironmentTypes } from "./Definations";
import MainVaultRunner from "./Main";

const CloudTypesArray: ReadonlyArray<CloudTypes> = ["AWS", "AZURE"];

const EnvironmentArray: ReadonlyArray<EnvironmentTypes> = [
  "local",
  "development",
  "staging",
  "production",
];

async function main(): Promise<void> {
  const argv = await yargs.options({
    ct: { choices: CloudTypesArray, alias: "cloudType", default: "AZURE" },
    kn: { type: "string", alias: "keyVaultName", default: null },
    ci: { type: "string", alias: "clientId", default: null },
    cs: { type: "string", alias: "secretValue", default: null },
    tn: { type: "string", alias: "tenantId", default: null },
    prefix: { type: "string", alias: "varPrefix", demandOption: true },
    env: {
      choices: EnvironmentArray,
      alias: "environment",
      default: "development",
    },
  }).argv;

  const environmentType = process.env.NODE_ENV || argv.env;
  const cloudType = process.env.CLOUD_TYPE || argv.ct;
  let keyVaultRunner;

  switch (cloudType) {
    case "AZURE": {
      const keyVaultName = process.env.KEYVAULT_NAME || argv.kn;
      const clientId = process.env.CLIENT_ID || argv.ci;
      const clientSecret = process.env.CLIENT_SECRET || argv.cs;
      const tenantId = process.env.TENANT_ID || argv.tn;

      if (!keyVaultName || !clientId || !clientSecret || !tenantId) {
        throw "Valid authentication credentials are not provided";
      }

      keyVaultRunner = new MainVaultRunner({
        keyVaultType: cloudType,
        keyVaultName: keyVaultName,
        credentials: {
          tenantId: tenantId,
          clientId: clientId,
          clientSecret: clientSecret,
        },
      });
      break;
    }
    case "AWS": {
      throw "Currently AWS password manager is not supported";
    }
    default: {
      throw "please provide valid secret provider";
    }
  }

  const envFile = ".env." + environmentType;

  if (!argv.prefix) {
    throw "Please enter valid env var prefix";
  }

  await keyVaultRunner.buildEnv({
    varPrefix: argv.prefix,
    fileName: envFile,
  });
}

main().catch((err) => {
  throw err;
});
