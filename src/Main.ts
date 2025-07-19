import { writeFile } from "fs/promises";
import AzureKeyVault from "./AzureKeyVault.ts";
import {
  isAlphaNumeric,
  isAlphaNumericOrBooleanOrNumber,
  isValidInteger,
} from "./validations.ts";

import {
  ListSecretDict,
  RunnerEnvVarInput,
  VaultConfig,
} from "./Definations";

/**
 * MainVaultRunner class to manage interactions with Azure Key Vault.
 * It allows creating environment variables, building environment files,
 * and managing secrets in the vault.
 */
class MainVaultRunner {
  #keyvault: AzureKeyVault | string | null = null;
  #keyValueDict: Record<string, string | number | boolean> = {};

  constructor({
    keyVaultType,
    keyVaultName = null,
    credentials = {},
  }: VaultConfig) {
    if (!keyVaultName) {
      throw new Error("Please provide correct keyvault name");
    }

    switch (keyVaultType) {
      case "AWS": {
        this.#keyvault = "Coming Soon";
        break;
      }
      case "AZURE": {
        if (
          !credentials.tenantId ||
          !credentials.clientId ||
          !credentials.clientSecret
        ) {
          throw new Error(
            "Azure Credentials Invalid! Please provide valid tenantId, clientId, and clientSecret"
          );
        }

        this.#keyvault = new AzureKeyVault({
          keyVaultName,
          credentials: {
            tenantId: credentials.tenantId,
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret,
          },
        });
        break;
      }
      default: {
        throw new Error(
          "Please provide valid Keyvault name and Access Credentials"
        );
      }
    }
  }

  /**
   * Validates the key name and secret value.
   * @param {string} keyName - The name of the key.
   * @param {string | number | boolean} keySecret - The secret value.
   * @returns {boolean} - Returns true if the key and secret are valid.
   */
  private validateKey(
    keyName: string,
    keySecret: string | number | boolean
  ): boolean {
    if (!isAlphaNumeric(keyName)) return false;
    if (!isAlphaNumericOrBooleanOrNumber(keySecret)) return false;
    return true;
  }

  /**
   * Transforms the key name and secret value for storage.
   * @param {string} keyName - The name of the key.
   * @param {string | number | boolean} keySecret - The secret value.
   * @param {string | null} prefix - An optional prefix to add to the key name.
   * @returns {{ keyName: string; keySecret: string }} - The transformed key name and secret value.
   */
  private tranformKeyValue(
    keyName: string,
    keySecret: string | number | boolean,
    prefix: string | null = ""
  ): { keyName: string; keySecret: string } {
    return {
      keyName: `${prefix}-${keyName}`.replaceAll("_", "-"),
      keySecret: `${keySecret}`,
    };
  }

  /**
   * Creates an environment variable in the Azure Key Vault.
   * @param {RunnerEnvVarInput} envVarInput - The input containing the environment variable name and value.
   * @throws Will throw an error if the key name or value is invalid or if unable to create the secret.
   */
  async createEnvVar({
    envVarName,
    envVarValue,
    varPrefix = null,
  }: RunnerEnvVarInput): Promise<void> {
    const isValid = this.validateKey(envVarName, envVarValue);
    if (!isValid) throw new Error("Key name or value is invalid");

    try {
      const { keyName, keySecret } = this.tranformKeyValue(
        envVarName,
        envVarValue,
        varPrefix
      );
      const result = await (this.#keyvault as AzureKeyVault).createEnvVar({
        keyName,
        keySecret,
      });
      if (!result) throw new Error("Secret could not be created");
    } catch (error: any) {
      throw new Error("Something went wrong creating secret: " + error.message);
    }
  }

  /**
   * Writes the environment variables to a file.
   * @param fileName - The name of the file to write the environment variables to.
   * @throws Will throw an error if unable to write the file.
   */
  private async writeEnv(fileName = ".env"): Promise<void> {
    try {
      let envString = "";
      for (const eachKey of Object.keys(this.#keyValueDict)) {
        let secretName = eachKey.replaceAll("-", "_");
        let secretValue = this.#keyValueDict[eachKey];

        if (secretValue === "true" || secretValue === "false") {
          secretValue = Boolean(secretValue);
        } else if (isValidInteger(secretValue)) {
          secretValue = parseInt(`${secretValue}`);
        } else {
          secretValue = `${secretValue}`;
          envString += `${secretName}="${secretValue}"\n`;
          continue;
        }

        envString += `${secretName}=${secretValue}\n`;
      }

      await writeFile(fileName, envString);
      console.log("File created and written successfully!");
    } catch (err) {
      console.error("Failed to write file:", err);
    }
  }

  /**
   * Builds the environment variables from Azure Key Vault secrets and writes them to a file.
   * @param varPrefix - An optional prefix to filter the secrets.
   * @param fileName - The name of the file to write the environment variables to.
   * @throws Will throw an error if unable to fetch secrets or write the file.
   * @returns {Promise<void>} - A promise that resolves when the environment variables are built
   */
  async buildEnv({
    varPrefix = null,
    fileName = ".env",
  }: {
    varPrefix?: string | null;
    fileName?: string;
  }): Promise<void> {
    this.#keyValueDict = {};

    const allSecrets: ListSecretDict[] = await (
      this.#keyvault as AzureKeyVault
    ).fetchAllSecrets();

    for (const secretProperties of allSecrets) {
      if (varPrefix && !secretProperties.name.includes(varPrefix)) continue;

      const value = await (this.#keyvault as AzureKeyVault).getSecretValue(
        secretProperties.name
      );
      const secretName = secretProperties.name.replaceAll("-", "_");

      this.#keyValueDict[secretName] = value;
    }

    await this.writeEnv(fileName);
  }
}

export default MainVaultRunner;
