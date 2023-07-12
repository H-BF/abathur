export const ipPool = `
apiVersion: projectcalico.org/v3
kind: IPPool
metadata:
    name: new-pool-one
    namespace: default
spec:
    blockSize: {{blockSize}}
    cidr: {{{cidr}}}
    ipipMode: CrossSubnet
    natOutgoing: true
    disabled: false
    nodeSelector: all()
`