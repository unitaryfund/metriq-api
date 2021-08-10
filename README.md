# Welcome to metriq!

There are 3 main components to this project:

1. `metriq-db`: The mongodb database for users/benchmarks/service state/etc.
2. `metriq-app`: The webapp the client uses to interact with `metriq-api`
3. `metriq-api`: A REST API that serves as the glue between database and client.

## Get started

### With Docker + VS Code

> Make sure you have Docker installed and running before working with this project!

1. Clone this repo.
2. **Make sure to also initialize the submodules with `git submodule init` and `git submodule update`.**
3. Install the recommended extensions in VS Code, (when automatically prompted,) most importantly `ms-vscode-remote.remote-containers`.
4. From the icon in the lower most left corner, select from the dropdown "Open folder in container" (or command pallet and `Remote-Containers: Open in Container`)
5. Grab a coffee, will take a sec, but when it is done, your VS Code window will be running in the container with all the dependancies and servers running so you can just go on your normal desktop browser to localhost:3000 and see the client.

If the app starts, but you don't see any submissions on the homepage, see the `metriq-db` README.md for instructions on how to restore the database manually, via a terminal into your container. (The README there gives you a single line you can copy/paste into the terminal, to restore all collections.)

If something goes wrong, assuming you have initialized and updated the submodules, open a terminal and run `npm i` in **both** the `metriq-api` and `metriq-app` folders of the container, respectively. You might also have to manually restore the `metriq-db` collections, as explained above. Then, with two separate terminal windows in the container, you can manually run `node index` in the `metriq-api` folder and `npm start` in the `metriq-app` folder. If this still doesn't work, (like, because you forgot to initialize and update your submodules,) it might be easiest to delete your container in VS Code (in the "Remote Explorer" on the far left vertical menu bar of the VS Code window) and start again.

### Local setup

TBD
