import { App, DefaultStackSynthesizer } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { readFileSync } from "fs";
import { resolve } from "path";
import { BuildConfig } from "../lib/build/buildConfig";
import { AwsSsoExtensionsForEnterprise } from "../lib/stacks/pipeline/aws-sso-extensions-for-enterprise";
import yaml = require("js-yaml");

test("Empty Stack", () => {
  const app = new App();

  function ensureString(
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    object: { [name: string]: any },
    propName: string
  ): string {
    if (!object[`${propName}`] || object[`${propName}`].trim().length === 0)
      throw new Error(propName + " does not exist or is empty");

    return object[`${propName}`];
  }

  function ensureDependentPropIsPresentForSourceRepo(
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    object: { [name: string]: any },
    repoTypePropName: string,
    propName: string
  ): string {
    const repoType = ensureString(object, repoTypePropName);
    let propValue = "";
    if (repoType.toLowerCase() === "codecommit") {
      switch (propName.toLowerCase()) {
        case "repoarn":
          propValue = ensureString(object, propName);
          break;
        case "repobranchname":
          propValue = ensureString(object, propName);
          break;
        default:
          return "";
      }
    } else if (repoType.toLowerCase() === "codestar") {
      switch (propName.toLowerCase()) {
        case "codestarconnectionarn":
          propValue = ensureString(object, propName);
          break;
        case "reponame":
          propValue = ensureString(object, propName);
          break;
        case "repobranchname":
          propValue = ensureString(object, propName);
          break;
        default:
          return "";
      }
    } else {
      throw new Error(
        `Repo type ${repoType} is not one of valid values - ["codecommit","codestar"]`
      );
    }
    /** Making the linter happy */
    return propValue;
  }
  function ensureValidString(
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    object: { [name: string]: any },
    propName: string,
    validList: Array<string>
  ): string {
    if (
      !object[`${propName}`] ||
      object[`${propName}`].trim().length === 0 ||
      typeof object[`${propName}`] !== "string"
    )
      throw new Error(
        propName +
          " does not exist or is empty or is of not the correct data type"
      );

    const value = ("" + object[`${propName}`]).toUpperCase();
    if (!validList.includes(value)) {
      throw new Error(
        `${propName} is not one of the valid values - ${validList.toString()}`
      );
    }

    return object[`${propName}`];
  }

  function ensureBoolean(
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    object: { [name: string]: any },
    propName: string
  ): boolean {
    if (typeof object[`${propName}`] !== "boolean")
      throw new Error(
        propName + " does not exist or is of not the correct data type"
      );

    return object[`${propName}`];
  }

  function ensureNumber(
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    object: { [name: string]: any },
    propName: string
  ): number {
    if (!object[`${propName}`] || typeof object[`${propName}`] === "number")
      throw new Error(
        propName + " does not exist or is empty or is not a number data type"
      );

    return object[`${propName}`];
  }

  function getConfig() {
    const env = app.node.tryGetContext("config");
    if (!env)
      throw new Error(
        "Context variable missing on CDK command. Pass in as `-c config=XXX`"
      );
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const unparsedEnv: any = yaml.load(
      readFileSync(resolve("./config/" + env + ".yaml"), "utf8")
    );

    return {
      App: ensureString(unparsedEnv, "App"),
      Environment: ensureString(unparsedEnv, "Environment"),
      Version: ensureString(unparsedEnv, "Version"),

      PipelineSettings: {
        BootstrapQualifier: ensureString(
          unparsedEnv["PipelineSettings"],
          "BootstrapQualifier"
        ),
        DeploymentAccountId: ensureString(
          unparsedEnv["PipelineSettings"],
          "DeploymentAccountId"
        ),
        DeploymentAccountRegion: ensureString(
          unparsedEnv["PipelineSettings"],
          "DeploymentAccountRegion"
        ),
        TargetAccountId: ensureString(
          unparsedEnv["PipelineSettings"],
          "TargetAccountId"
        ),
        TargetAccountRegion: ensureString(
          unparsedEnv["PipelineSettings"],
          "TargetAccountRegion"
        ),
        SSOServiceAccountId: ensureString(
          unparsedEnv["PipelineSettings"],
          "SSOServiceAccountId"
        ),
        SSOServiceAccountRegion: ensureString(
          unparsedEnv["PipelineSettings"],
          "SSOServiceAccountRegion"
        ),
        OrgMainAccountId: ensureString(
          unparsedEnv["PipelineSettings"],
          "OrgMainAccountId"
        ),
        RepoType: ensureValidString(
          unparsedEnv["PipelineSettings"],
          "RepoType",
          ["CODECOMMIT", "CODESTAR"]
        ),
        RepoArn: ensureDependentPropIsPresentForSourceRepo(
          unparsedEnv["PipelineSettings"],
          "RepoType",
          "RepoArn"
        ),
        RepoBranchName: ensureDependentPropIsPresentForSourceRepo(
          unparsedEnv["PipelineSettings"],
          "RepoType",
          "RepoBranchName"
        ),
        RepoName: ensureDependentPropIsPresentForSourceRepo(
          unparsedEnv["PipelineSettings"],
          "RepoType",
          "RepoName"
        ),
        CodeStarConnectionArn: ensureDependentPropIsPresentForSourceRepo(
          unparsedEnv["PipelineSettings"],
          "RepoType",
          "CodeStarConnectionArn"
        ),
        SynthCommand: ensureString(
          unparsedEnv["PipelineSettings"],
          "SynthCommand"
        ),
      },

      Parameters: {
        LinksProvisioningMode: ensureValidString(
          unparsedEnv["Parameters"],
          "LinksProvisioningMode",
          ["API", "S3"]
        ),
        PermissionSetProvisioningMode: ensureValidString(
          unparsedEnv["Parameters"],
          "PermissionSetProvisioningMode",
          ["API", "S3"]
        ),
        LinkCallerRoleArn: ensureString(
          unparsedEnv["Parameters"],
          "LinkCallerRoleArn"
        ),
        PermissionSetCallerRoleArn: ensureString(
          unparsedEnv["Parameters"],
          "PermissionSetCallerRoleArn"
        ),
        NotificationEmail: ensureString(
          unparsedEnv["Parameters"],
          "NotificationEmail"
        ),
        AccountAssignmentVisibilityTimeoutHours: ensureNumber(
          unparsedEnv["Parameters"],
          "AccountAssignmentVisibilityTimeoutHours"
        ),
        IsAdUsed: ensureBoolean(unparsedEnv["Parameters"], "IsAdUsed"),
        DomainName: ensureString(unparsedEnv["Parameters"], "DomainName"),
        ImportCurrentSSOConfiguration: ensureBoolean(
          unparsedEnv["Parameters"],
          "ImportCurrentSSOConfiguration"
        ),
        UpgradeFromVersionLessThanV303: ensureBoolean(
          unparsedEnv["Parameters"],
          "UpgradeFromVersionLessThanV303"
        ),
        SupportNestedOU: ensureBoolean(
          unparsedEnv["Parameters"],
          "SupportNestedOU"
        ),
        FunctionLogMode: ensureValidString(
          unparsedEnv["Parameters"],
          "FunctionLogMode",
          ["INFO", "WARN", "DEBUG", "EXCEPTION"]
        ),
      },
    };
  }

  const buildConfig: BuildConfig = getConfig();

  // WHEN
  const stack = new AwsSsoExtensionsForEnterprise(
    app,
    "MyTestStack",
    {
      env: {
        region: buildConfig.PipelineSettings.DeploymentAccountRegion,
        account: buildConfig.PipelineSettings.DeploymentAccountId,
      },
      synthesizer: new DefaultStackSynthesizer({
        qualifier: buildConfig.PipelineSettings.BootstrapQualifier,
      }),
    },
    buildConfig
  );
  // THEN
  // Only does synth check at this time
  const template = Template.fromStack(stack);
  template.templateMatches({
    Resources: {},
  });
});
