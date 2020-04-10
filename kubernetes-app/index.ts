import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";

const appLabels = { app: "rps" };

const rps_version = "v0.1.2"
const rps_namespace = "dev"

const configMap = new k8s.core.v1.ConfigMap("rps-config", 
{
    data: {
        RPS_USER: "UserName",
        RPS_VERSION: rps_version
    },
    metadata: {
        namespace: rps_namespace
    }
})

const deployment = new k8s.apps.v1.Deployment("rps", 
{
    metadata:
    {
        namespace: rps_namespace 
    },
    spec: {
        selector: {
            matchLabels: appLabels
        },
        replicas: 1,
        template: {
            metadata: { 
                labels: appLabels
            },
            spec: { 
                containers: 
                [{ 
                    name: "rps", 
                    image: "away168/rps:" + rps_version, 
                    envFrom: 
                    [{
                        configMapRef: {name: configMap.metadata.name}
                    }], 
                    ports: [{ containerPort: 80}] 
                }]
            }
        }
    }
});

const service = new k8s.core.v1.Service("rps-sevice",
{
    metadata: {
        labels: deployment.metadata.labels,
        namespace: rps_namespace 
    },
    spec: {
        ports: [{ port: 80, targetPort: 80}],
        selector: deployment.spec.template.metadata.labels, 
        type: "LoadBalancer"
    }
});

export const name = deployment.metadata.name;
