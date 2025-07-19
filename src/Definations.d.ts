export interface Credentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

export interface EnvVarInput {
  keyName: string;
  keySecret: string;
}

export interface RunnerEnvVarInput {
  envVarName: string;
  envVarValue: string | number | boolean;
  varPrefix?: string | null;
}

export interface AzureKeyVaultConstructorParams {
  keyVaultName: string;
  credentials: Credentials;
}

export interface BulkEnvInput {
  varPrefix?: string | null;
  fileName?: string;
  fileLocation?: string;
}

export type ListSecretDict = {
  name: string;
  enabled?: boolean;
};

export interface VaultConfig {
  keyVaultType: "AWS" | "AZURE";
  keyVaultName?: string | null;
  credentials?: Partial<Credentials>;
}


export type CloudTypes = "AZURE" | "AWS";

export type EnvironmentTypes = "local" | "development" | "staging" | "production";
