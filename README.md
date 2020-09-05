
# Amazon Connect contact flow API's demo  

This demo shows how you can leverage [Amazon Connect](https://aws.amazon.com/connect/) api's to manage contact flows.  

## Usage
Use `sam` to build, invoke and deploy the function.

##### SAM Build:
Ensure you are in the root folder

`sam build --use-container`

##### SAM Deploy:
`sam deploy template.yaml --s3-bucket REPLACE_ME --stack-name REPLACE_ME --parameter-overrides ParameterKey=CFWebsiteCreatorRole,ParameterValue=REPLACE_ME --capabilities CAPABILITY_IAM`
      
