import { ClientSecretCredential } from "@azure/identity";
import { SecretClient, KeyVaultSecret } from "@azure/keyvault-secrets";

import KeyVault from "./KeyVault.ts";
import {
  EnvVarInput,
  AzureKeyVaultConstructorParams,
  BulkEnvInput,
  ListSecretDict,
} from "./Definations";

/**
 * AzureKeyVault class to interact with Azure Key Vault.
 * It extends the KeyVault class and implements methods to create environment variables,
 * create bulk environment variables, fetch all secrets, and get a specific secret value.
 */
class AzureKeyVault extends KeyVault {
  private url: string;
  private vaultName: string;
  private client: SecretClient;

  /**
   * Constructor for AzureKeyVault.
   * @param {AzureKeyVaultConstructorParams} params - Parameters including keyVaultName and credentials.
   */
  constructor({ keyVaultName, credentials }: AzureKeyVaultConstructorParams) {
    super();
    this.vaultName = keyVaultName;
    this.url = `https://${this.vaultName}.vault.azure.net`;

    const clientCredentials = new ClientSecretCredential(
      credentials.tenantId,
      credentials.clientId,
      credentials.clientSecret
    );

    this.client = new SecretClient(this.url, clientCredentials);
  }

  /**
   * Validates the key name and secret value.
   * @param {string} keyName - The name of the key.
   * @param {string} keySecret - The secret value.
   * @throws Will throw an error if the key name or secret value is invalid.
   * 
   * @return {boolean} - Returns true if the key and secret are created Successfully.
   */
  createEnvVar = async ({ keyName, keySecret }: EnvVarInput): Promise<Boolean> => {
    try {
      const result = await this.client.setSecret(keyName, keySecret, {
        enabled: true,
      });
      if (!result) throw new Error("Unable to create client secret");
      return true;
    } catch (error: any) {
      throw new Error("Something went wrong creating secret: " + error.message);
    }
  };

  /**
   * Creates multiple environment variables in Azure Key Vault.
   * @param {string | null} varPrefix - The prefix to use for the environment variable names.
   * @param {string} fileName - The name of the file containing environment variables.
   * @param {string} fileLocation - The location of the file containing environment variables.
   * @throws Will throw an error if the method is not implemented.
   * 
   * @return {Promise<void>} - A list of created environment variables.
   */
  createBulkEnv = async ({
    varPrefix = null,
    fileName = ".env",
    fileLocation,
  }: BulkEnvInput): Promise<void> => {
    throw new Error("Not implemented yet");
  };

  /**
   * Fetches all secrets from Azure Key Vault.
   * @returns {Promise<ListSecretDict[]>} - A promise that resolves to a list of secrets.
   * @throws Will throw an error if unable to fetch secrets.
   */
  async fetchAllSecrets(): Promise<ListSecretDict[]> {
    const result: ListSecretDict[] = [];
    try {
      for await (const secret of this.client.listPropertiesOfSecrets()) {
        result.push({
          name: secret.name,
          enabled: secret.enabled,
        });
      }
    } catch (error) {
      throw new Error("Unable to get secret list from cloud");
    }
    return result;
  }

  /**
   * Fetches a specific secret from Azure Key Vault.
   * @param keyName - The name of the secret to retrieve.
   * @throws Will throw an error if the secret is not found or if unable to get the secret.
   * @returns {Promise<string>} - A promise that resolves to the secret value.
   */
  async getSecretValue(keyName: string): Promise<string> {
    try {
      const secret: KeyVaultSecret = await this.client.getSecret(keyName);
      if (!secret?.value) {
        throw "Secret not found";
      }
      return secret.value;
    } catch (error) {
      throw new Error("Unable to get secret list from cloud");
    }
  }
}

export default AzureKeyVault;
