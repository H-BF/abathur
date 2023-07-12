export const pod = `
apiVersion: v1
kind: Pod
metadata:
  name: {{{name}}}
  namespace: default
  annotations:
    cni.projectcalico.org/ipAddrs: "[\"{{{ip}}}\"]"
  labels:
    name: {{{name}}}
spec:
  containers:
    - name: nginx
      image: test_nginx
      imagePullPolicy: Never
      ports:
        - containerPort: 80
      volumeMounts:
        - name: nginx
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf


    - name: server
      image: test_server
      imagePullPolicy: Never

    - name: client
      image: test_client
      imagePullPolicy: Never
      
  restartPolicy: Never

  volumes:
  - name: nginx
    configMap:
      name: nginx
` 