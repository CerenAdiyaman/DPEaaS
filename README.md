# DPEaaS-
This project is a React-based admin panel that creates and deletes automatic preview environments on Kubernetes for each pull request.

Connecting a github repo with your github token -> Clone repo to your local -> Listing open previews -> get the PR id (selecting from open prs) -> create a branch and pull the Pr 
-> create docker image (frontend/backend/generic based on project) -> push docker image to dockerhub -> deploy using kubernetets -> create a url for testing env -> test the pr ->
delete it if it is deploy succesfully.
