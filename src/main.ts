import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as cdk from '@aws-cdk/core';
import * as cdk8s from 'cdk8s';
import { MyChart } from './my-chart';

export class MyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    const stack = cdk.Stack.of(this);

    const vpc = new ec2.Vpc(this, 'Vpc', { natGateways: 1 });

    const cluster = new eks.Cluster(this, 'Cluster', {
      vpc,
      version: eks.KubernetesVersion.V1_17,
    });

    // create a cdk8s chart and use `cdk8s.App` as the scope.
    const cdk8sApp = new cdk8s.App();
    const myChart = new MyChart(cdk8sApp, 'MyChart', {
      image: 'public.ecr.aws/d7p2r8s3/flask-docker-sample',
      region: stack.region,
    });

    // add the cdk8s chart to the cluster
    cluster.addCdk8sChart('my-chart', myChart);

    //query the load balancer address
    const myServiceAddress = new eks.KubernetesObjectValue(this, 'ServiceAddress', {
      cluster,
      objectType: 'service',
      objectName: myChart.service.name,
      jsonPath: '.status.loadBalancer.ingress[0].hostname', // https://kubernetes.io/docs/reference/kubectl/jsonpath/
    });

    new cdk.CfnOutput(this, 'ServiceEndpoint', { value: `http://${myServiceAddress.value}` });

  }
}

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();
