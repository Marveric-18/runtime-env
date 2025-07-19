// KeyVault class to access key vault based on Azure or AWS
// For now, we will only have Azure Key vault access for the first version

import { BulkEnvInput, EnvVarInput, ListSecretDict } from "./Definations";


abstract class KeyVault {
  constructor() {}

  abstract createEnvVar(input: EnvVarInput): Promise<Boolean>;

  abstract createBulkEnv(input: BulkEnvInput): Promise<void>;

  abstract getSecretValue(keyName: string): Promise<string>;

  abstract fetchAllSecrets(): Promise<ListSecretDict[]>;
}

export default KeyVault;
