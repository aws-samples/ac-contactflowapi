
# Amazon Connect contact flow API's demo  

This demo shows how you can leverage [Amazon Connect](https://aws.amazon.com/connect/) api's to manage contact flows.  

## Usage
Use `sam` to build, invoke and deploy the function.

##### SAM Build:
Ensure you are in the root folder

`sam build --use-container`

##### SAM Deploy:

`sam deploy template.yaml --s3-bucket REPLACE-ME --stack-name sam-cf1 --capabilities CAPABILITY_IAM --parameter-overrides ParameterKey=CADS3BucketForWebSite,ParameterValue=REPLACE-ME ParameterKey=backupDDBTable,ParameterValue=REPLACE-ME ParameterKey=arnMappingDDBTable,ParameterValue=REPLACE-ME`