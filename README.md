# Welcome to metriq!

There are 3 main components to this project:

1. `metriq-postgres`: The PostgreSQL database for users/benchmarks/service state/etc.
2. `metriq-app`: The webapp the client uses to interact with `metriq-api`
3. `metriq-api`: A REST API that serves as the glue between database and client.

**Make sure to initialize the submodules with `git submodule init` and `git submodule update`.**
