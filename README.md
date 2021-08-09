# Welcome to metriq!

There are 3 main components to this project:

1. `metriq-db`: The mongodb database for users/benchmarks/service state/etc.
2. `metriq-app`: The webapp the client uses to interact with `metriq-api`
3. `metriq-api`: A REST API that serves as the glue between database and client.

## Get started

### With Docker + VS Code

> Make sure you have Docker installed and running before working with this project!

1. Clone this repo (make sure to also initialize the submodules with `git submodule init` and `git submodule update`) and install the recommended extensions, most importantly `ms-vscode-remote.remote-containers`.
2. From the icon in the lower most left corner, select from the dropdown "Open folder in container" (or command pallet and `Remote-Containers: Open in Container`)
3. Grab a coffee, will take a sec, but when it is done, your VS Code window will be running in the container with all the dependancies and servers running so you can just go on your normal desktop browser to localhost:3000 and see the client.

### Local setup

TBD
