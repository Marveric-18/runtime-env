#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var CloudTypesArray = [
    'AWS',
    'AZURE'
];
var argv = yargs.options({
    ct: { choices: CloudTypesArray, demandOption: true, default: 'AZURE' },
    ci: { type: 'string', alias: 'clientId', default: null, demandOption: true },
    cs: { type: 'string', alias: 'secretValue', default: null },
    tn: { type: 'string', alias: 'tenantId', default: null },
}).argv;
console.log(argv);
