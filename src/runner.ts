#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const CloudTypesArray = ['AWS', 'AZURE'] as const;

const argv = yargs(hideBin(process.argv))
  .options({
    ct: { choices: CloudTypesArray, demandOption: true, default: 'AZURE' },
    ci: { type: 'string', alias: 'clientId', demandOption: true },
    cs: { type: 'string', alias: 'secretValue' },
    tn: { type: 'string', alias: 'tenantId' },
  })
  .parseSync();

console.log(argv);
