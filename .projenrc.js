const {
  AwsCdkTypeScriptApp,
  Semver,
} = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.67.0',
  name: 'eks-demo',
  cdkDependencies: [
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-eks',
  ],
});

project.addDependencies({
  'cdk8s': Semver.caret('0.30.0'),
  'cdk8s-plus': Semver.caret('0.30.0'),
  'constructs': Semver.caret('3.0.4'),
});


const common_exclude = ['cdk.out', 'cdk.context.json', 'yarn-error.log'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();
